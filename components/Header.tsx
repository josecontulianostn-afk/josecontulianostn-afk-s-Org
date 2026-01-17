import React, { useState, useEffect } from 'react';
import { ViewState } from '../types'; // Kept for types if needed, but we rely on routes now
import { Menu, X, ShoppingBag, Scissors, Gift } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  // Legacy props might be removed if state is fully managed by router
  // But staying compatible for now if needed, though we will likely ignore them
}

const Header: React.FC<HeaderProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = `fixed w-full z-50 transition-all duration-300 ${(isScrolled || location.pathname === '/') ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
    }`;

  const linkClass = (path: string) => `cursor-pointer font-medium tracking-wide transition-colors ${location.pathname === path
    ? 'text-stone-900 border-b-2 border-stone-800'
    : (isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-stone-800 hover:text-stone-600')
    }`;

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // --- Dynamic Branding Logic ---
  const getLogoContent = () => {
    const path = location.pathname;

    // On Hub, show all 3 brands
    if (path === '/') {
      return (
        <div className="flex items-center gap-4 md:gap-6">
          {/* Main Logo Image */}
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-200 via-rose-200 to-amber-200 shadow-lg shrink-0">
            <img src="/images/logo-hub.jpg" alt="Logo" className="w-full h-full object-cover rounded-full border-2 border-white/10" />
          </div>

          {/* Style Logo */}
          <Link to="/style" className="flex flex-col items-center leading-none hover:opacity-70 transition-opacity cursor-pointer">
            <span className="serif text-lg md:text-xl font-bold italic tracking-tighter text-stone-900">Style</span>
            <span className="text-[8px] text-stone-500 uppercase tracking-wider">by Tus3B</span>
          </Link>
          {/* Divider */}
          <div className="h-6 w-px bg-stone-200 hidden md:block"></div>
          {/* Perfum Logo */}
          <Link to="/perfum" className="flex flex-col items-center leading-none hover:opacity-70 transition-opacity cursor-pointer">
            <span className="serif text-lg md:text-xl font-bold tracking-tight text-amber-500">Perfum</span>
            <span className="text-[8px] text-amber-600/70 uppercase tracking-wider">by Tus3B</span>
          </Link>
          {/* Divider */}
          <div className="h-6 w-px bg-stone-200 hidden md:block"></div>
          {/* Amor Amor Logo */}
          <Link to="/regalos" className="flex flex-col items-center leading-none hover:opacity-70 transition-opacity cursor-pointer">
            <span className="serif text-lg md:text-xl font-bold tracking-tight text-rose-500">Amor Amor</span>
            <span className="text-[8px] text-rose-600/70 uppercase tracking-wider">by Tus3B</span>
          </Link>
        </div>
      );
    }

    if (path.startsWith('/perfum')) {
      return (
        <Link to="/perfum" className="flex flex-col items-center leading-none hover:opacity-80 transition-opacity">
          <span className={`serif text-3xl md:text-4xl font-bold tracking-tight text-amber-500`}>
            Perfum
          </span>
          <span className="text-stone-600 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mt-1">
            by tus3b
          </span>
        </Link>
      );
    } else if (path.startsWith('/regalos')) {
      return (
        <Link to="/regalos" className="flex flex-col items-center leading-none hover:opacity-80 transition-opacity">
          <span className={`serif text-2xl md:text-3xl font-bold tracking-tight text-rose-500`}>
            Amor Amor
          </span>
          <span className="text-stone-600 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mt-1">
            by tus3b
          </span>
        </Link>
      );
    } else {
      // Default / Layout "Style" (for /style, /gallery, /booking etc)
      return (
        <Link to="/style" className="flex flex-col items-center leading-none hover:opacity-80 transition-opacity">
          <span className={`serif text-3xl md:text-4xl font-bold italic tracking-tighter text-stone-900`}>
            Style
          </span>
          <span className="text-stone-600 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mt-1">
            by tus3b
          </span>
        </Link>
      );
    }
  };

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo (Dynamic) */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <Link to="/" className="text-white bg-stone-900 p-2 rounded-full hover:bg-stone-700 transition z-10" title="Volver al Hub">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </Link>
            )}

            {/* Centered Logo Container */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {getLogoContent()}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {location.pathname !== '/' && (
              <>
                <Link to="/style" className={linkClass('/style')}>Style</Link>
                <Link to="/perfum" className={linkClass('/perfum')}>Perfum</Link>
                <Link to="/regalos" className={linkClass('/regalos')}>Amor Amor</Link>
              </>
            )}

            <button
              onClick={() => {
                if (location.pathname === '/style') {
                  document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/style');
                }
              }}
              className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm uppercase tracking-wider hover:bg-stone-800 transition shadow-lg"
            >
              Reservar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-800 focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 flex flex-col p-6 space-y-8 animate-in slide-in-from-right-10">
          <button onClick={() => handleNavClick('/style')} className="flex items-center space-x-4 text-xl font-medium text-stone-700 p-2 active:bg-stone-50 rounded-lg">
            <Scissors size={24} />
            <span>Style (Inicio)</span>
          </button>
          <button onClick={() => handleNavClick('/perfum')} className="flex items-center space-x-4 text-xl font-medium text-stone-700 p-2 active:bg-stone-50 rounded-lg">
            <ShoppingBag size={24} />
            <span>Perfumes</span>
          </button>
          <button onClick={() => handleNavClick('/regalos')} className="flex items-center space-x-4 text-xl font-medium text-stone-700 p-2 active:bg-stone-50 rounded-lg">
            <Gift size={24} />
            <span>Regalos</span>
          </button>

          <div className="mt-auto pb-8">
            <button
              onClick={() => handleNavClick('/booking')}
              className="w-full bg-stone-900 text-white py-4 rounded-xl text-center uppercase tracking-widest font-bold shadow-lg active:scale-95 transition-transform"
            >
              Agendar Cita
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;