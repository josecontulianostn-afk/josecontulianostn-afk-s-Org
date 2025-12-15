import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Menu, X, ShoppingBag, Scissors, Calendar } from 'lucide-react';

interface HeaderProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onChangeView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = `fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
    }`;

  const linkClass = (view: ViewState) => `cursor-pointer font-medium tracking-wide transition-colors ${currentView === view
      ? 'text-stone-900 border-b-2 border-stone-800'
      : (isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-stone-800 hover:text-stone-600')
    }`;

  const handleNavClick = (view: ViewState) => {
    onChangeView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick(ViewState.HOME)}>
            <span className={`serif text-3xl font-bold italic tracking-tighter ${isScrolled ? 'text-stone-900' : 'text-stone-900'}`}>
              Tus3B <span className="text-stone-500 not-italic font-light text-xl ml-1">Style</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-12 items-center">
            <a onClick={() => handleNavClick(ViewState.HOME)} className={linkClass(ViewState.HOME)}>Inicio</a>
            <a onClick={() => handleNavClick(ViewState.BOOKING)} className={linkClass(ViewState.BOOKING)}>Servicios & Reserva</a>
            <a onClick={() => handleNavClick(ViewState.CATALOG)} className={linkClass(ViewState.CATALOG)}>Perfumes (Decants)</a>

            <button
              onClick={() => handleNavClick(ViewState.BOOKING)}
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 px-4 flex flex-col space-y-6 animate-in slide-in-from-top-5">
          <button onClick={() => handleNavClick(ViewState.HOME)} className="flex items-center space-x-3 text-lg font-medium text-stone-700">
            <span>Inicio</span>
          </button>
          <button onClick={() => handleNavClick(ViewState.BOOKING)} className="flex items-center space-x-3 text-lg font-medium text-stone-700">
            <Scissors size={20} />
            <span>Corte & Brushing</span>
          </button>
          <button onClick={() => handleNavClick(ViewState.CATALOG)} className="flex items-center space-x-3 text-lg font-medium text-stone-700">
            <ShoppingBag size={20} />
            <span>Perfumes</span>
          </button>
          <button
            onClick={() => handleNavClick(ViewState.BOOKING)}
            className="bg-stone-900 text-white w-full py-3 rounded-lg text-center uppercase tracking-widest font-bold"
          >
            Agendar Cita
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;