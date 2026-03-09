import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Upload, 
  Layout, 
  User, 
  ShoppingCart, 
  Camera,
  Menu,
  X
} from 'lucide-react';
import { cn } from './lib/utils';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import RecommendationsPage from './pages/RecommendationsPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import BuddyChat from './components/BuddyChat';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

import { auth, onAuthStateChanged, signOut } from './firebase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Design', path: '/upload', icon: Camera },
    { name: 'Shop', path: '/booking', icon: ShoppingCart },
    { name: 'Dashboard', path: '/dashboard', icon: Layout },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold tracking-tighter text-accent">GRUHA ALANKARA</span>
          </Link>

            <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location.pathname === item.path ? "text-accent" : "text-white/60"
                )}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={16} className="text-accent" />
                  )}
                  <span className="text-xs font-medium text-white/80 max-w-[100px] truncate">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-medium text-white/40 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/signin" 
                className="px-5 py-2 bg-accent text-black rounded-full text-sm font-semibold hover:bg-accent/90 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-accent"
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-400/10"
                >
                  <X size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-accent text-black font-semibold"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FooterWrapper = () => {
  const location = useLocation();
  return location.pathname === '/' ? <Footer /> : null;
};

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Routes>
          </main>
          <FooterWrapper />
          <BuddyChat />
        </div>
      </ErrorBoundary>
    </Router>
  );
}
