import reactLogo from "../assets/react.svg";
export function Home() {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the home page of the Shopping Cart Application.</p>
            <div className="App">
                <img src={reactLogo} className="react-logo" alt="React.JS Logo Graphic" />
                <h1>Shopping Cart Application</h1>
                <img src="https://dijf55il5e0d1.cloudfront.net/images/na/1/7/3/17368_1000.jpg" className="shopping-cart-image" alt="Shopping Cart Picture" />
            </div>
        </div>
    );
}