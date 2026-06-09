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
            {/* Logo Section */}
            <Link
                to="/"
                className="text-2xl font-display font-bold text-white tracking-widest flex items-center gap-2 group"
            >
              QUIZ
              <span className="bg-white text-black px-2 py-0.5 rounded font-extrabold text-lg transition-all duration-200 group-hover:bg-mono-gray-200">
              LY
            </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            isActive ? 'text-black' : 'text-mono-gray-400 hover:text-white'
                        }`}
                    >
                      {isActive && (
                          <motion.div
                              layoutId="active-pill"
                              className="absolute inset-0 bg-white rounded-lg -z-10"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                      )}
                      <Icon size={18} />
                      <span>{link.name}</span>
                    </Link>
                );
              })}

              {user ? (
                  <div className="flex items-center gap-5 pl-5 ml-2 border-l border-mono-gray-800">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-mono-gray-600 flex items-center justify-center text-xs text-white font-bold font-display uppercase bg-mono-gray-900 transition-all duration-200 hover:border-mono-gray-400">
                        {user.name?.charAt(0) || <FiUser size={14} />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-white tracking-wide">{user.name}</span>
                        {user.role === 'ADMIN' && (
                            <span className="text-[10px] font-extrabold text-black bg-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 w-max">
                        <FiShield size={9} /> ADMIN
                      </span>
                        )}
                      </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-mono-gray-800 hover:border-white text-sm text-mono-gray-400 hover:text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-mono-gray-900"
                    >
                      <FiLogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
              ) : (
                  <div className="flex items-center gap-4 pl-5 ml-2 border-l border-mono-gray-800">
                    <Link
                        to="/login"
                        className="px-5 py-2.5 text-sm font-semibold text-mono-gray-400 hover:text-white transition-all duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2.5 text-mono-gray-400 hover:text-white focus:outline-none transition-all duration-200 cursor-pointer rounded-lg hover:bg-mono-gray-900"
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
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="md:hidden border-t border-mono-gray-800 bg-black/95 backdrop-blur-md overflow-hidden"
              >
                <div className="px-6 py-7 space-y-4">
                  {/* Navigation Links */}
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3.5 px-5 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-white text-black'
                                    : 'text-mono-gray-400 hover:text-white bg-mono-gray-900/30 hover:bg-mono-gray-900/50'
                            }`}
                        >
                          <Icon size={18} />
                          <span>{link.name}</span>
                        </Link>
                    );
                  })}

                  {user ? (
                      <div className="pt-5 mt-3 border-t border-mono-gray-800 space-y-5">
                        {/* User Profile Section */}
                        <div className="flex items-center gap-4 px-5">
                          <div className="w-11 h-11 rounded-full border border-mono-gray-600 flex items-center justify-center text-sm text-white font-bold font-display uppercase bg-mono-gray-900">
                            {user.name?.charAt(0) || <FiUser size={16} />}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-base font-bold text-white">{user.name}</h4>
                            <p className="text-xs text-mono-gray-400 break-all">{user.email}</p>
                            {user.role === 'ADMIN' && (
                                <span className="text-[10px] font-extrabold text-black bg-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 mt-1 w-max">
                          <FiShield size={9} /> ADMIN
                        </span>
                            )}
                          </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-lg border border-mono-gray-800 text-mono-gray-400 hover:text-white text-sm font-semibold hover:border-white transition-all duration-200 cursor-pointer hover:bg-mono-gray-900"
                        >
                          <FiLogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                  ) : (
                      <div className="pt-5 mt-3 border-t border-mono-gray-800 flex flex-col gap-3">
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-center py-3.5 rounded-lg border border-mono-gray-800 text-mono-gray-400 hover:text-white font-semibold text-sm transition-all duration-200 hover:border-mono-gray-600"
                        >
                          Sign In
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-center py-3.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-black hover:text-white border-2 border-white transition-all duration-200"
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