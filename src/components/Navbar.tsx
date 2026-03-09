import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'News Room', path: '/blog' },
    { name: 'Events', path: '/events' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#BC002D] rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">
                I
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">INTI</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-gray-600 hover:text-[#BC002D] font-medium transition-colors"
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 h-0.5 bg-[#BC002D] bottom-[-4px]"
                  />
                )}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link
                  to={user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/dashboard'}
                  className="px-6 py-2.5 rounded-md bg-[#BC002D] text-white font-medium hover:bg-[#9a0025] transition-colors shadow-md hover:shadow-lg hover:shadow-[#BC002D]/20"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/portal"
                className="px-6 py-2.5 rounded-md bg-[#BC002D] text-white font-medium hover:bg-[#9a0025] transition-colors shadow-md hover:shadow-lg hover:shadow-[#BC002D]/20 ml-4"
              >
                Membership Portal
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'text-[#BC002D] bg-red-50'
                    : 'text-gray-700 hover:text-[#BC002D] hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#BC002D] hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#BC002D] hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/portal"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#BC002D] hover:bg-red-50"
              >
                Membership Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
