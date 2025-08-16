import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Link, Settings, BarChart3, ChevronDown } from 'lucide-react';
import {logout} from "../api/auth.js"
import { toast } from 'react-toastify';
function Header() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Navigate to landing and scroll to section id (works from any page)
  const scrollToSection = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // if element not found, try again shortly (useful after navigation)
    setTimeout(() => {
      const retry = document.getElementById(id);
      if (retry) retry.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const handleNav = (e, id) => {
    if (e && e.preventDefault) e.preventDefault();
    // If not on landing, navigate there first, then attempt to scroll
    if (window.location.pathname !== '/') {
      navigate('/');
      // give React a moment to mount landing content
      setTimeout(() => scrollToSection(id), 300);
    } else {
      scrollToSection(id);
    }
    // close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {

    const userData = localStorage.getItem('user');
    let signedIn = false;
    let userObj = null;
    if (userData) {
      try {
        userObj = JSON.parse(userData);
        signedIn = userObj.isSignedIn === true;
      } catch (err) {
        console.error('Failed to parse stored user in Header:', err);
        signedIn = false;
        userObj = null;
      }
    }
    setIsSignedIn(signedIn);
    setUser(userObj);
  }, []);

  const handleSignIn = () => {
    navigate('/login');
  };
  
  const handleProfile= ()=>{
    navigate('/profile');
  }
  const handleDashBoard= ()=>{
    navigate('/dashboard');
  }

  const handleSignOut = async () => {
    const response = await logout();
    if (response && response.error ) {
      toast.error('Failed to sign out');
    }
    else{
      setIsSignedIn(false);
      setUser(null);
      setIsProfileDropdownOpen(false);
      console.log('User signed out');
      toast.success('Successfully signed out');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="relative bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Link className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Url-short
            </h2>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex items-center gap-8">
              <li>
                <a 
                  href="#home" 
                  onClick={(e) => handleNav(e, 'home')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
                >
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleNav(e, 'about')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
                >
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  onClick={(e) => handleNav(e, 'services')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
                >
                  Services
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNav(e, 'contact')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
                >
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center">
            {!isSignedIn ? (
              <button 
                onClick={handleSignIn}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.photo ? (
                      <img src={user.photo} alt="avatar" className="w-9 h-9 object-cover rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-70 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name || user?.username || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.gmail || user?.email || ''}</p>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button 
                       onClick={handleProfile}
                       className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button 
                       onClick={handleDashBoard}
                       className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-2">
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 animate-fade-in">
            <nav className="p-6">
              <ul className="space-y-4 mb-6">
                <li>
                  <a 
                    href="#home" 
                    onClick={toggleMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-300"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#about" 
                    onClick={toggleMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-300"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a 
                    href="#services" 
                    onClick={toggleMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-300"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    onClick={toggleMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-300"
                  >
                    Contact
                  </a>
                </li>
              </ul>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4">
                {!isSignedIn ? (
                  <button 
                    onClick={() => {
                      handleSignIn();
                      toggleMobileMenu();
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg"
                  >
                    Sign In
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.photo ? (
                          <img src={user.photo} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name || user?.username || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.gmail || user?.email || ''}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button 
                      onClick={handleDashBoard}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => {
                        handleSignOut();
                        toggleMobileMenu();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 font-medium transition-colors duration-300 hover:bg-red-50 rounded-xl border border-red-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;