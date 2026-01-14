import { Offcanvas, Stack } from "react-bootstrap";
import { useShoppingCart } from "../context/ShoppingCartContext";
import { CartItem } from "../components/CartItem";
import storeItems from "../data/storeItems";
import { formatCurrency } from "../utilities/formatCurrency";
import { findById, isDefined } from "../utilities/typeGuards";

type ShoppingCartProps = {
    isOpen: boolean;
}

export function ShoppingCart({ isOpen }: ShoppingCartProps) {
    const { closeCart, cartItems } = useShoppingCart();
    const total = cartItems.reduce((total, cartItem) => {
        const item = findById(storeItems, cartItem.id);

        // Type guard ensures type safety - only add price if item exists
        if (!isDefined(item)) {
            console.warn(`StoreItem with id ${cartItem.id} not found when calculating total`);
            return total; // Skip items not found
        }

        return total + item.price * cartItem.quantity;
    }, 0);
    return (
        <Offcanvas show={isOpen} onHide={closeCart} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Your Shopping Cart</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Stack gap={3}>
                    {cartItems.map(item => (
                        <CartItem key={item.id} {...item} />
                    ))}
                    <div className="ms-auto fw-bold fs-5">
                        Total{" "}
                        {formatCurrency(total)}
                    </div>
                </Stack>
            </Offcanvas.Body>
        </Offcanvas>
    );
}