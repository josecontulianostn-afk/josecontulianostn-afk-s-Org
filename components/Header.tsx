import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Menu, X, ShoppingBag, Scissors, Gift, Home } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface HeaderProps { }

const Header: React.FC<HeaderProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use a reliable background for all inner pages to ensure logo visibility
  const isHomePage = location.pathname === '/';
  const headerBgClass = (isScrolled || !isHomePage)
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100 py-3'
    : 'bg-transparent py-1';

  const navClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBgClass}`;

  const linkClass = (path: string) => `cursor-pointer font-medium tracking-wide transition-colors ${location.pathname === path
    ? 'text-stone-900 border-b-2 border-stone-800'
    : ((isScrolled || !isHomePage) ? 'text-stone-600 hover:text-stone-900' : 'text-stone-800 hover:text-stone-600')
    }`;

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // --- Dynamic Branding Logic ---
  const getLogoContent = () => {
    const path = location.pathname;



    // HOME VIEW: Custom Large Branding in Header
    if (path === '/') {
      return (
        <div className="flex items-center gap-3">
          {/* Logo Restored */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-200 via-rose-200 to-amber-200 shadow-sm shrink-0">
            <img src="/images/logo-hub.jpg" alt="Logo" className="w-full h-full object-cover rounded-full border border-white/20" />
          </div>

          {/* Text - Fixed width alignment */}
          <div className="flex flex-col items-center justify-center -space-y-0.5">
            <h1 className="font-serif italic text-2xl md:text-3xl text-stone-900 tracking-[0.15em] drop-shadow-sm whitespace-nowrap">
              Tus3B <span className="text-amber-500">HUB</span>
            </h1>
            <span className="text-[9px] md:text-[10px] text-stone-500 uppercase tracking-[0.25em] font-medium leading-none whitespace-nowrap">
              Belleza &bull; Aroma &bull; Regalos
            </span>
          </div>
        </div>
      );
    }

    // INTERNAL VIEWS: Left-aligned specific brand logo
    let mainColor = 'text-stone-900';
    let brandName = 'Style';
    let subText = 'by tus3b';
    let isItalic = true;

    if (path.startsWith('/perfum')) {
      mainColor = 'text-amber-600';
      brandName = 'Perfum';
      isItalic = false;
    } else if (path.startsWith('/regalos')) {
      mainColor = 'text-rose-600';
      brandName = 'Amor Amor';
      isItalic = false;
    }

    return (
      <Link to={path.startsWith('/perfum') ? '/perfum' : path.startsWith('/regalos') ? '/regalos' : '/style'} className="flex flex-col justify-center items-start leading-none group pb-2.5">
        <div className="flex items-center gap-2">
          <span className={`serif text-2xl md:text-3xl font-bold tracking-tight ${mainColor} ${isItalic ? 'italic' : ''} transition-opacity group-hover:opacity-80`}>
            {brandName}
          </span>
        </div>
        <span className="text-stone-400 text-[10px] font-medium tracking-[0.2em] uppercase ml-0.5">
          {subText}
        </span>
      </Link>
    );
  };

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center min-h-14 md:min-h-[4rem]">

          {/* LEFT: Branding & Back Button */}
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            {location.pathname !== '/' && (
              <Link to="/" className={`p-2 rounded-full transition shrink-0 ${(isScrolled || !isHomePage) ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' : 'bg-black/20 text-white hover:bg-black/30'}`} title="Volver al Hub">
                <Home size={18} />
              </Link>
            )}

            {/* Brand Logo Container - Takes remaining left space */}
            <div className="flex items-center justify-start">
              {getLogoContent()}
            </div>
          </div>

          {/* CENTER: Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center justify-center flex-1">
            {location.pathname !== '/' && (
              <>
                <Link to="/style" className={linkClass('/style')}>Style</Link>
                <Link to="/perfum" className={linkClass('/perfum')}>Perfum</Link>
                <Link to="/regalos" className={linkClass('/regalos')}>Amor Amor</Link>
              </>
            )}
          </div>

          {/* RIGHT: Buttons */}
          <div className="flex items-center justify-end flex-1 gap-4">
            {/* Desktop Booking Button */}
            <button
              onClick={() => {
                if (location.pathname === '/style') {
                  document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/style');
                }
              }}
              className="hidden md:block bg-stone-900 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition shadow-lg transform hover:scale-105"
            >
              Reservar
            </button>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`focus:outline-none ${(isScrolled || !isHomePage) ? 'text-stone-900' : 'text-stone-800'}`}>
                {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[56px] bg-white z-40 flex flex-col p-6 space-y-6 animate-in slide-in-from-right-10 border-t border-stone-100">
          <button onClick={() => handleNavClick('/style')} className="flex items-center space-x-4 text-lg font-medium text-stone-800 p-3 active:bg-stone-50 rounded-xl border border-transparent active:border-stone-100">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"><Scissors size={20} /></div>
            <span>Style (Inicio)</span>
          </button>

          <button onClick={() => handleNavClick('/perfum')} className="flex items-center space-x-4 text-lg font-medium text-stone-800 p-3 active:bg-stone-50 rounded-xl border border-transparent active:border-stone-100">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><ShoppingBag size={20} /></div>
            <span>Perfumes</span>
          </button>

          <button onClick={() => handleNavClick('/regalos')} className="flex items-center space-x-4 text-lg font-medium text-stone-800 p-3 active:bg-stone-50 rounded-xl border border-transparent active:border-stone-100">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600"><Gift size={20} /></div>
            <span>Regalos</span>
          </button>

          <div className="mt-auto pb-8">
            <button
              onClick={() => handleNavClick('/booking')}
              className="w-full bg-stone-900 text-white py-4 rounded-xl text-center uppercase tracking-widest font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Scissors size={18} />
              Agendar Cita
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;