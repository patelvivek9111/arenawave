import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import EmployeeLogin from './pages/EmployeeLogin';
import QRScanner from './pages/QRScanner';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminEmployees from './pages/AdminEmployees';
import AdminCounters from './pages/AdminCounters';
import { CartProvider } from './context/CartContext';
import { PricingProvider } from './context/PricingContext';

function AppRoutes() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-stone-50 font-sans antialiased">
      <Navbar />
      <main className="relative min-w-0 flex-1 overflow-x-clip">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/scanner" element={<QRScanner />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/counters" element={<AdminCounters />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <PricingProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </PricingProvider>
  );
}

export default App;
