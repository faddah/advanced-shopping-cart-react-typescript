import { createContext, useContext, useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
    isCartItemArray,
    type CartItem,
    findById,
    hasItemWithId,
    isDefined,
    type ShoppingCartContextType,
    assertShoppingCartContext,
    isValidId,
    isValidProviderProps
} from "../utilities/typeGuards";

type ShoppingCartProviderProps = { children: React.ReactNode; }

// Using the type from typeGuards for consistency
type ShoppingCartContext = ShoppingCartContextType;

// Initialize context with undefined instead of empty object
// This allows us to properly detect when context is used outside provider
const ShoppingCartContext = createContext<ShoppingCartContext | undefined>(undefined);

/**
 * Hook to access ShoppingCart context with runtime validation
 * Throws an error if used outside of ShoppingCartProvider
 * This catches integration errors at the boundary
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useShoppingCart(): ShoppingCartContext {
    const context = useContext(ShoppingCartContext);

    // Type guard validation - catches usage outside provider
    assertShoppingCartContext(context);

    return context;
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
    // Validate provider props at the boundary
    if (!isValidProviderProps({ children })) {
        throw new Error('ShoppingCartProvider received invalid props');
    }

    const [isOpen, setIsOpen] = useState(false);
    const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
        "shopping-cart",
        [],
        isCartItemArray // Pass the type guard for validation
    );

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const cartQuantity = cartItems.reduce((quantity, item) => item.quantity + quantity, 0);

    const getItemQuantity = (id: number) => {
        const item = findById(cartItems, id);
        // Type guard provides safe access to quantity
        return isDefined(item) ? item.quantity : 0;
    };
    const increaseCartQuantity = (id: number) => {
        setCartItems(currItems => {
            // Type guard for checking if item exists in cart
            if (!hasItemWithId(currItems, id)) {
                return [...currItems, { id, quantity: 1}];
            } else {
                return currItems.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: item.quantity + 1 };
                    } else {
                        return item;
                    }
                });
            }
        });
    };
    const decreaseCartQuantity = (id: number) => {
        setCartItems(currItems => {
            const item = findById(currItems, id);

            // Type guard for safe quantity access
            if (isDefined(item) && item.quantity === 1) {
                return currItems.filter(item => item.id !== id);
            } else {
                return currItems.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: item.quantity - 1 };
                    } else {
                        return item;
                    }
                });
            }
        });
    };
    const removeFromCart = (id: number) =>
        setCartItems( currItems => currItems.filter(item => item.id !== id));

    return (
        <ShoppingCartContext.Provider value={{
            openCart,
            closeCart,
            getItemQuantity,
            increaseCartQuantity,
            decreaseCartQuantity,
            removeFromCart,
            cartQuantity,
            cartItems
        }}>
            {children}
            <ShoppingCart isOpen={isOpen} />
        </ShoppingCartContext.Provider>
    );
}
