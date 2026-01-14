/**
 * Context Validation Examples
 * Demonstrates comprehensive context validation patterns
 */

import { createContext, useContext } from 'react';
import { describe, it, expect, vi as jest } from "vitest";
import {
    isShoppingCartContext,
    assertShoppingCartContext,
    validateContextValue,
    logContextStructure,
    hasValidContextMethodSignatures,
    isContextDefaultValue,
    type ShoppingCartContextType,
    type CartItem
} from "./typeGuards";

// ============================================
// Example 1: Basic Context Validation
// ============================================

/**
 * PROBLEM: Using context outside of provider
 */
export function example1_ContextOutsideProvider() {
    // Simulating what happens when you forget to wrap in Provider
    const FakeContext = createContext<ShoppingCartContextType | undefined>(undefined);

    function BrokenComponent() {
        const context = useContext(FakeContext);

        // WITHOUT type guard - crashes with unclear error
        // context.openCart();  // ❌ TypeError: Cannot read property 'openCart' of undefined

        // WITH type guard - clear error message
        try {
            assertShoppingCartContext(context);
            context.openCart(); // Never reaches here
        } catch (error) {
            // ✅ Clear error: "useShoppingCart must be used within ShoppingCartProvider"
            console.error(error);
            return null;
        }
    }

    return <BrokenComponent />;
}

// ============================================
// Example 2: Context Structure Validation
// ============================================

/**
 * Validating context has correct structure
 */
export function example2_ValidateStructure() {
    const validContext: ShoppingCartContextType = {
        openCart: () => {},
        closeCart: () => {},
        getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        cartQuantity: 0,
        cartItems: []
    };

    const invalidContext = {
        // Missing methods
        cartQuantity: 0,
        cartItems: []
    };

    console.log('Valid:', isShoppingCartContext(validContext));     // true
    console.log('Invalid:', isShoppingCartContext(invalidContext)); // false
}

// ============================================
// Example 3: Method Signature Validation
// ============================================

/**
 * Validating context methods have correct signatures
 */
export function example3_MethodSignatures() {
    const contextWithCorrectSignatures: ShoppingCartContextType = {
        openCart: () => {},
        closeCart: () => {},
        getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        cartQuantity: 5,
        cartItems: []
    };

    // Validate method signatures
    if (hasValidContextMethodSignatures(contextWithCorrectSignatures)) {
        console.log('✅ All method signatures are correct');
    } else {
        console.log('❌ Method signatures are incorrect');
    }
}

// ============================================
// Example 4: Context Value Validation Before Providing
// ============================================

/**
 * Validating context value before passing to Provider
 */
export function example4_ValidateBeforeProviding() {
    // Create context value
    const contextValue = {
        openCart: () => {},
        closeCart: () => {},
        getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        cartQuantity: 0,
        cartItems: []
    };

    // Validate before providing
    if (validateContextValue(contextValue, 'ShoppingCartContext')) {
        console.log('✅ Context value is valid, safe to provide');
        // return <Context.Provider value={contextValue}>...</Context.Provider>
    } else {
        console.error('❌ Invalid context value, do not provide');
        // Handle error - maybe throw or use fallback
    }
}

// ============================================
// Example 5: Development-Time Context Logging
// ============================================

/**
 * Logging context structure for debugging
 */
export function example5_LoggingContext() {
    const context: ShoppingCartContextType = {
        openCart: () => {},
        closeCart: () => {},
        getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        cartQuantity: 3,
        cartItems: [
            { id: 1, quantity: 2 },
            { id: 2, quantity: 1 }
        ]
    };

    // Logs detailed structure (only in development)
    logContextStructure(context, 'ShoppingCartContext');

    // Output:
    // ShoppingCartContext Structure
    //   ✅ Valid context structure
    //   Methods: { openCart: "function", closeCart: "function", ... }
    //   Properties: { cartQuantity: 3, cartItemsCount: 2 }
}

// ============================================
// Example 6: Detecting Default/Empty Context
// ============================================

/**
 * Checking if context has default empty value
 */
export function example6_DetectDefaultValue() {
    const emptyContext1 = undefined;
    const emptyContext2 = null;
    const emptyContext3 = {};
    const validContext = {
        openCart: () => {},
        cartItems: []
    };

    console.log('undefined:', isContextDefaultValue(emptyContext1)); // true
    console.log('null:', isContextDefaultValue(emptyContext2));      // true
    console.log('{}:', isContextDefaultValue(emptyContext3));        // true
    console.log('valid:', isContextDefaultValue(validContext));      // false
}

// ============================================
// Example 7: Creating Safe Context Hook
// ============================================

/**
 * Pattern for creating a safe context hook with validation
 */
export function example7_SafeContextHook() {
    const MyContext = createContext<ShoppingCartContextType | undefined>(undefined);

    function useMyContext(): ShoppingCartContextType {
        const context = useContext(MyContext);

        // Validate context is not default/empty
        if (isContextDefaultValue(context)) {
            throw new Error(
                'useMyContext must be used within MyContextProvider. ' +
                'Component is not wrapped in provider.'
            );
        }

        // Validate context structure
        assertShoppingCartContext(context);

        return context;
    }

    return { MyContext, useMyContext };
}

// ============================================
// Example 8: Context Value with Invalid cartQuantity
// ============================================

/**
 * Validating cartQuantity property
 */
export function example8_InvalidCartQuantity() {
    const invalidContexts = [
        {
            // All methods...
            openCart: () => {},
            closeCart: () => {},
            getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
            cartQuantity: -1,  // ❌ Negative
            cartItems: []
        },
        {
            // All methods...
            openCart: () => {},
            closeCart: () => {},
            getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
            increaseCartQuantity: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            decreaseCartQuantity: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            removeFromCart: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            cartQuantity: NaN,  // ❌ NaN
            cartItems: []
        },
        {
            // All methods...
            openCart: () => {},
            closeCart: () => {},
            getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
            increaseCartQuantity: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            decreaseCartQuantity: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            removeFromCart: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            cartQuantity: Infinity,  // ❌ Infinity
            cartItems: []
        }
    ];

    invalidContexts.forEach((ctx, index) => {
        console.log(`Context ${index + 1}:`, isShoppingCartContext(ctx)); // false
    });
}

// ============================================
// Example 9: Context Value with Invalid cartItems
// ============================================

/**
 * Validating cartItems array
 */
export function example9_InvalidCartItems() {
    const invalidContext = {
        openCart: () => {},
        closeCart: () => {},
        getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        cartQuantity: 2,
        cartItems: [
            { id: 1, quantity: 2 },
            { id: -1, quantity: 0 },  // ❌ Invalid id and quantity
            { id: "string", quantity: 1 }  // ❌ Wrong types
        ] as unknown as CartItem[]
    };

    // This will fail validation
    console.log('Valid:', isShoppingCartContext(invalidContext)); // false
    // Console shows: "cartItems array contains invalid items"
}

// ============================================
// Example 10: Complete Provider Pattern with Validation
// ============================================

/**
 * Complete example of Provider with all validations
 */
export function example10_CompleteProviderPattern() {
    const MyContext = createContext<ShoppingCartContextType | undefined>(undefined);

    function MyProvider({ children }: { children: React.ReactNode }) {
        // ... state and methods

        const contextValue: ShoppingCartContextType = {
            openCart: () => {},
            closeCart: () => {},
            getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
            increaseCartQuantity: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            decreaseCartQuantity: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            removeFromCart: (_id: number) => {
                // Use _id to perform some operation
                console.log(_id);
            },
            cartQuantity: 0,
            cartItems: []
        };

        // Validate before providing (development only)
        if (import.meta.env.DEV) {
            // 1. Validate structure
            if (!validateContextValue(contextValue, 'MyContext')) {
                throw new Error('Invalid context value structure');
            }

            // 2. Validate method signatures
            if (!hasValidContextMethodSignatures(contextValue)) {
                console.warn('Method signatures may be incorrect');
            }

            // 3. Log for debugging (optional)
            // logContextStructure(contextValue, 'MyContext');
        }

        return (
            <MyContext.Provider value={contextValue}>
                {children}
            </MyContext.Provider>
        );
    }

    return MyProvider;
}

// ============================================
// Example 11: Testing Context Validation
// ============================================

/**
 * How to test context validation in unit tests
 */
export function example11_TestingContextValidation() {
    describe('Context Validation', () => {
        it('should validate correct context structure', () => {
            const validContext: ShoppingCartContextType = {
                openCart: jest.fn(),
                closeCart: jest.fn(),
                getItemQuantity: jest.fn(() => 0),
                increaseCartQuantity: jest.fn(),
                decreaseCartQuantity: jest.fn(),
                removeFromCart: jest.fn(),
                cartQuantity: 0,
                cartItems: []
            };

            expect(isShoppingCartContext(validContext)).toBe(true);
        });

        it('should reject context missing methods', () => {
            const invalidContext = {
                cartQuantity: 0,
                cartItems: []
            };

            expect(isShoppingCartContext(invalidContext)).toBe(false);
        });

        it('should reject context with invalid cartQuantity', () => {
            const invalidContext = {
                openCart: jest.fn(),
                closeCart: jest.fn(),
                getItemQuantity: jest.fn(() => 0),
                increaseCartQuantity: jest.fn(),
                decreaseCartQuantity: jest.fn(),
                removeFromCart: jest.fn(),
                cartQuantity: -5,  // Invalid
                cartItems: []
            };

            expect(isShoppingCartContext(invalidContext)).toBe(false);
        });
    });
}

// ============================================
// Example 12: Error Recovery Pattern
// ============================================

/**
 * Pattern for recovering from context validation errors
 */
export function example12_ErrorRecovery() {
    const SafeContextConsumer = () => {
        let context: ShoppingCartContextType | null = null;

        try {
            const rawContext = useContext(
                createContext<ShoppingCartContextType | undefined>(undefined)
            );
            assertShoppingCartContext(rawContext);
            context = rawContext;
        } catch (error) {
            console.error('Context validation failed:', error);

            // Provide fallback context
            context = {
                openCart: () => console.log('Fallback openCart'),
                closeCart: () => console.log('Fallback closeCart'),
                getItemQuantity: () => 0,
                increaseCartQuantity: () => {},
                decreaseCartQuantity: () => {},
                removeFromCart: () => {},
                cartQuantity: 0,
                cartItems: []
            };

            // Show error UI
            return <div>Error: Context not available</div>;
        }

        // Use validated context
        return <div>Cart: {context.cartQuantity} items</div>;
    };

    return <SafeContextConsumer />;
}

// ============================================
// Example 13: Custom Context Validator
// ============================================

/**
 * Creating custom validators for specific context requirements
 */
export function example13_CustomValidator() {
    function validateCartNotEmpty(context: unknown): boolean {
        if (!isShoppingCartContext(context)) {
            return false;
        }

        // Additional validation: cart must have items
        if (context.cartItems.length === 0) {
            console.warn('Cart is empty');
            return false;
        }

        return true;
    }

    function validateCartQuantityMatches(context: unknown): boolean {
        if (!isShoppingCartContext(context)) {
            return false;
        }

        // Validate cartQuantity matches sum of item quantities
        const actualQuantity = context.cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        if (context.cartQuantity !== actualQuantity) {
            console.error(
                `Cart quantity mismatch: reported ${context.cartQuantity}, ` +
                `actual ${actualQuantity}`
            );
            return false;
        }

        return true;
    }

    // Usage
    const context: ShoppingCartContextType = {
        openCart: () => {},
        closeCart: () => {},
        getItemQuantity: (_id: number) => {
            // Use _id to perform some operation
                console.log(_id);
                return 0;
            },
        increaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        decreaseCartQuantity: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        removeFromCart: (_id: number) => {
            // Use _id to perform some operation
            console.log(_id);
        },
        cartQuantity: 2,
        cartItems: [{ id: 1, quantity: 2 }]
    };

    console.log('Not empty:', validateCartNotEmpty(context));
    console.log('Quantity matches:', validateCartQuantityMatches(context));
}
