import './App.css'
// import reactLogo from './assets/react.svg'
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Home } from "./pages/Home";
import { Store } from "./pages/Store";
import { About } from "./pages/About";

function App() {
  return (
    <div className="App">
      <img src={reactLogo} className="react-logo" alt="React.JS Logo Graphic" />
      <h1>Shopping Cart Application</h1>
      <img src="https://dijf55il5e0d1.cloudfront.net/images/na/1/7/3/17368_1000.jpg" className="shopping-cart-image" alt="Shopping Cart Picture" />
    </div>
  )
}

export default App
