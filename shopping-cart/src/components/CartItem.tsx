// import { useShoppingCart } from "../context/ShoppingCartContext";
import storeItems from "../data/storeItems";
import { Button, Stack } from "react-bootstrap";
import { useShoppingCart } from "../context/ShoppingCartContext";
import { formatCurrency } from "../utilities/formatCurrency";
import {
    findById,
    isDefined,
    isValidId,
    isValidQuantity
} from "../utilities/typeGuards";

type CartItemProps = {
    id: number;
    quantity: number;
}

export function CartItem(props: CartItemProps) {
    // Validate props at the component boundary
    const { id, quantity } = props;
    
    const { removeFromCart } = useShoppingCart();

    if (!isValidId(id)) {
        console.error('CartItem received invalid id:', id);
        return null;
    }

    if (!isValidQuantity(quantity)) {
        console.error('CartItem received invalid quantity:', quantity);
        return null;
    }

    const { removeFromCart } = useShoppingCart();
    // Using type guard for better null safety
    const item = findById(storeItems, id);

    // isDefined type guard narrows the type properly
    if (!isDefined(item)) {
        console.warn(`StoreItem with id ${id} not found in cart`);
        return null;
    }
    return (
        <Stack direction="horizontal" gap={2} className="d-flex align-items-center">
            <img
                src={item.imgUrl}
                style={{
                    width: "125px",
                    height: "75px",
                    objectFit: "cover"
                }}
            />
            <div className="me-auto">
                <div>
                    {item.name}{" "}
                    {quantity > 1 && (
                        <span className="text-muted" style={{ fontSize: ".65rem" }}>
                            x{quantity}
                        </span>
                    )}
                </div>
                <div className="text-muted" style={{ fontSize: ".75rem" }}>
                    {formatCurrency(item.price)}
                </div>
            </div>
            <div>{formatCurrency(item.price * quantity)}</div>
            <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeFromCart(item.id)}
            >
                &times;
            </Button>
        </Stack>
    );
}