import { Col, Row } from "react-bootstrap";
import { StoreItem } from "../components/StoreItem";
import storeItems from "../data/storeItems";

export function Store() {
    return (
        <div>
            <h1>Welcome to the Store Page</h1>
            <p>This is the online Store page of the Shopping Cart Application.</p>
            <Row md={2} xs={1} lg={3} className="g-3">
                {storeItems.map(item => (
                    <Col key={item.id}><StoreItem {...item} /></Col>
                ))}
            </Row>
        </div>
    );
}