import './App.css'
// import reactLogo from './assets/react.svg'
import { ShoppingCartProvider } from "./context/ShoppingCartContext";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/Home";
import { Store } from "./pages/Store";
import { About } from "./pages/About";

function App() {
  return <>
  <NavBar />
  <Container>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/store" element={<Store/>} /> 
      <Route path="/about" element={<About/>} /> 
    </Routes>
  </Container>
  </>
}

export default App
