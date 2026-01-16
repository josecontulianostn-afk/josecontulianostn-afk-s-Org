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

  const navClass = `fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
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

    if (path === '/') {
      // On Hub, maybe show nothing or simple text since the page has big branding
      return (
        <span className="serif text-xl font-bold tracking-tighter text-stone-900">
          Tus3B
        </span>
      );
    }

    if (path.startsWith('/perfum')) {
      return (
        <div className="flex flex-col items-start leading-none">
          <span className={`serif text-4xl font-bold tracking-tight text-amber-500`}>
            Perfum
          </span>
          <span className="text-stone-600 text-[10px] md:text-xs font-medium tracking-[0.2em] ml-1 uppercase">
            by tus3b
          </span>
        </div>
      );
    } else if (path.startsWith('/regalos')) {
      return (
        <div className="flex flex-col items-start leading-none">
          <span className={`serif text-3xl font-bold tracking-tight text-rose-500`}>
            Amor Amor
          </span>
          <span className="text-stone-600 text-[10px] md:text-xs font-medium tracking-[0.2em] ml-1 uppercase">
            by tus3b
          </span>
        </div>
      );
    } else {
      // Default / Layout "Style" (for /style, /gallery, /booking etc)
      return (
        <div className="flex flex-col items-start leading-none">
          <span className={`serif text-4xl font-bold italic tracking-tighter text-stone-900`}>
            Style
          </span>
          <span className="text-stone-600 text-[10px] md:text-xs font-medium tracking-[0.2em] ml-1 uppercase">
            by tus3b
          </span>
        </div>
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
              <Link to="/" className="text-white bg-stone-900 p-2 rounded-full hover:bg-stone-700 transition" title="Volver al Hub">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </Link>
            )}
            <Link to={location.pathname === '/' ? '/' : '/style'} className="flex-shrink-0 flex items-center cursor-pointer no-underline group">
              {getLogoContent()}
            </Link>
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