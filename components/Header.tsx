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
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 flex flex-col p-6 space-y-8 animate-in slide-in-from-right-10">
          <button onClick={() => handleNavClick(ViewState.HOME)} className="flex items-center space-x-4 text-xl font-medium text-stone-700 p-2 active:bg-stone-50 rounded-lg">
            <span>Inicio</span>
          </button>
          <button onClick={() => handleNavClick(ViewState.BOOKING)} className="flex items-center space-x-4 text-xl font-medium text-stone-700 p-2 active:bg-stone-50 rounded-lg">
            <Scissors size={24} />
            <span>Corte & Brushing</span>
          </button>
          <button onClick={() => handleNavClick(ViewState.CATALOG)} className="flex items-center space-x-4 text-xl font-medium text-stone-700 p-2 active:bg-stone-50 rounded-lg">
            <ShoppingBag size={24} />
            <span>Perfumes</span>
          </button>

          <div className="mt-auto pb-8">
            <button
              onClick={() => handleNavClick(ViewState.BOOKING)}
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