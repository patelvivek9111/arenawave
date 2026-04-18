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
    updateEmployeeLink();

    const handleStorageChange = (e) => {
      if (e.key === 'employeeToken' || e.key === 'employeeUser') {
        updateEmployeeLink();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCustomStorageChange = () => {
      updateEmployeeLink();
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-aw-chrome', 'mono');
    return () => root.removeAttribute('data-aw-chrome');
  }, []);

  const linkClass = 'relative text-white hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group';
  const navSurface = 'bg-[#121212] border-b border-white/15 shadow-none';
  const linkHoverBg = 'bg-white/10';

  return (
    <nav className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${navSurface}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <span className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                ArenaWave
              </span>
              <div
                className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 bg-white"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            <Link to="/" className={linkClass}>
              <span className="relative z-10">Home</span>
              <div className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ${linkHoverBg}`} />
            </Link>
            <Link to="/about" className={linkClass}>
              <span className="relative z-10">About</span>
              <div className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ${linkHoverBg}`} />
            </Link>
            <Link to="/shop" className={linkClass}>
              <span className="relative z-10">Shop</span>
              <div className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ${linkHoverBg}`} />
            </Link>
            <Link to="/cart" className={`${linkClass} relative`}>
              <span className="relative z-10">Cart</span>
              <div className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ${linkHoverBg}`} />
              {getTotalItems() > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center bg-white text-zinc-900"
                >
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link to={employeeLink} className={linkClass}>
              <span className="relative z-10">Employee</span>
              <div className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ${linkHoverBg}`} />
            </Link>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg transition-all duration-300 flex items-center justify-center text-white hover:bg-white/10"
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

        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t rounded-b-2xl shadow-lg animate-slide-up border-white/15 bg-[#121212]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 flex items-center text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 flex items-center text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/shop"
                className="block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 flex items-center text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/cart"
                className="block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 relative flex items-center text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart
                {getTotalItems() > 0 && (
                  <span
                    className="absolute top-2.5 right-4 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center bg-white text-zinc-900"
                  >
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link
                to={employeeLink}
                className="block px-4 py-3 min-h-[44px] rounded-lg text-base font-medium transition-all duration-300 flex items-center text-white hover:bg-white/10"
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
