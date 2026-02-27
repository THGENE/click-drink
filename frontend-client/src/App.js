
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from 'socket.io-client';


import NavBar from './components/NavBar';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import TrendingBars from './pages/TrendingBars';


function App() {
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('connect', () => {
      console.log('Socket connecté !', socket.id);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trending" element={<TrendingBars />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
