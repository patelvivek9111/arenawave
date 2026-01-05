import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [employeeLink, setEmployeeLink] = useState('/employee/login');

  const updateEmployeeLink = () => {
    const token = localStorage.getItem('employeeToken');
    const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');
    
    if (token && user) {
      if (user.role === 'admin') {
        setEmployeeLink('/admin/dashboard');
      } else {
        setEmployeeLink('/employee/scanner');
      }
    } else {
      setEmployeeLink('/employee/login');
    }
  };

  useEffect(() => {
    // Check if employee is logged in and set appropriate link
    updateEmployeeLink();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e) => {
      if (e.key === 'employeeToken' || e.key === 'employeeUser') {
        updateEmployeeLink();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = () => {
      updateEmployeeLink();
    };
    
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <span className="text-xl md:text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                ArenaWave
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="relative text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-primary-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link
              to="/shop"
              className="relative text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group"
            >
              <span className="relative z-10">Shop</span>
              <div className="absolute inset-0 bg-primary-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group"
            >
              <span className="relative z-10">Cart</span>
              <div className="absolute inset-0 bg-primary-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle shadow-lg">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link
              to={employeeLink}
              className="relative text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group"
            >
              <span className="relative z-10">Employee</span>
              <div className="absolute inset-0 bg-primary-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary-600 p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-primary-50 transition-all duration-300 flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-lg animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 hover:bg-primary-50 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 hover:bg-primary-50 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/cart"
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 hover:bg-primary-50 relative flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart
                {getTotalItems() > 0 && (
                  <span className="absolute top-2.5 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle shadow-lg">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link
                to={employeeLink}
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 hover:bg-primary-50 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Employee
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
