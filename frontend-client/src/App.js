
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from 'socket.io-client';


import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';


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
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
