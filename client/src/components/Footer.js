import React from 'react';
import { Link } from 'react-router-dom';
import { useEmployeeNavLink } from '../hooks/useEmployeeNavLink';

const colHeading = 'text-xs font-semibold text-white tracking-wide mb-4';
const linkClass =
  'block text-sm text-zinc-400 hover:text-white transition-colors duration-200 py-1';

export default function Footer() {
  const employeeLink = useEmployeeNavLink();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block font-futuristic text-xl tracking-[0.12em] text-white hover:opacity-90 transition-opacity">
              ArenaWav
            </Link>
            <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-zinc-400">
              In-venue live audio for stadiums, sports, and large events—without relying on fan connectivity.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className={colHeading}>Discover</h2>
            <nav className="flex flex-col" aria-label="Discover">
              <Link to="/" className={linkClass}>
                Home
              </Link>
              <Link to="/about" className={linkClass}>
                About
              </Link>
              <Link to="/shop" className={linkClass}>
                Shop
              </Link>
            </nav>
          </div>

          <div className="lg:col-span-2">
            <h2 className={colHeading}>Shop</h2>
            <nav className="flex flex-col" aria-label="Shop">
              <Link to="/shop" className={linkClass}>
                Earwing
              </Link>
              <Link to="/cart" className={linkClass}>
                Cart
              </Link>
              <Link to="/checkout" className={linkClass}>
                Checkout
              </Link>
            </nav>
          </div>

          <div className="lg:col-span-2">
            <h2 className={colHeading}>Staff</h2>
            <nav className="flex flex-col" aria-label="Staff">
              <Link to={employeeLink} className={linkClass}>
                Employee
              </Link>
              <Link to="/admin/dashboard" className={linkClass}>
                Admin
              </Link>
            </nav>
          </div>

          <div className="lg:col-span-2">
            <h2 className={colHeading}>Company</h2>
            <nav className="flex flex-col" aria-label="Company">
              <Link to="/about" className={linkClass}>
                Our story
              </Link>
              <a href="mailto:support@arenawav.com" className={linkClass}>
                Contact
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {year} ArenaWav. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">Built for the venue.</p>
        </div>
      </div>
    </footer>
  );
}
