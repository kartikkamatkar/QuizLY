import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut, FiGrid, FiList, FiAward, FiShield, FiUser, FiZap } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsOpen(false);
    navigate('/login');
    window.location.reload(); // Force app re-render
  };

  const publicLinks = [
    { name: 'Home', path: '/', icon: FiGrid },
    { name: 'Leaderboard', path: '/leaderboard', icon: FiAward },
  ];

  const protectedLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Quizzes', path: '/quizzes', icon: FiList },
    { name: 'Arena', path: '/competitions', icon: FiZap },
    { name: 'Leaderboard', path: '/leaderboard', icon: FiAward },
  ];

  const links = user ? protectedLinks : publicLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-mono-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-display font-bold text-white tracking-widest flex items-center gap-1.5">
            QUIZ<span className="bg-white text-black px-1.5 py-0.5 rounded font-extrabold text-lg">LY</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'text-black' : 'text-mono-gray-400 hover:text-white'
                  }`}
                >
                  {/* Framer motion slide pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-mono-gray-800">
                {/* User avatar indicator */}
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full border border-mono-gray-600 flex items-center justify-center text-xs text-white font-bold font-display uppercase bg-mono-gray-900">
                    {user.name?.charAt(0) || <FiUser size={12} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white tracking-wide">{user.name}</span>
                    {user.role === 'ADMIN' && (
                      <span className="text-[9px] font-extrabold text-black bg-white px-1 rounded flex items-center gap-0.5 mt-0.5 w-max">
                        <FiShield size={8} /> ADMIN
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-mono-gray-800 hover:border-white text-xs text-mono-gray-400 hover:text-white font-semibold transition-all cursor-pointer"
                >
                  <FiLogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-4 border-l border-mono-gray-800">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold text-mono-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border border-white transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Action Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-mono-gray-400 hover:text-white focus:outline-none transition-colors cursor-pointer"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-mono-gray-800 bg-black/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-6 py-6 space-y-3">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      isActive ? 'bg-white text-black' : 'text-mono-gray-400 hover:text-white bg-mono-gray-900/30'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {user ? (
                <div className="pt-4 border-t border-mono-gray-800 space-y-4">
                  <div className="flex items-center space-x-3 px-4">
                    <div className="w-10 h-10 rounded-full border border-mono-gray-600 flex items-center justify-center text-sm text-white font-bold font-display uppercase bg-mono-gray-900">
                      {user.name?.charAt(0) || <FiUser size={14} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{user.name}</h4>
                      <p className="text-xs text-mono-gray-400">{user.email}</p>
                      {user.role === 'ADMIN' && (
                        <span className="text-[9px] font-extrabold text-black bg-white px-1 rounded flex items-center gap-0.5 mt-1 w-max">
                          <FiShield size={8} /> ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg border border-mono-gray-800 text-mono-gray-400 hover:text-white text-sm font-semibold hover:border-white transition-all cursor-pointer"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-mono-gray-800 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg border border-mono-gray-800 text-mono-gray-400 hover:text-white font-semibold text-sm transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-black hover:text-white border border-white transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
