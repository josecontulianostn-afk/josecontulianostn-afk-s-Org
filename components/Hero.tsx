import React from 'react';
import { ViewState } from '../types';

interface HeroProps {
  onCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <div className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-white text-base md:text-xl uppercase tracking-[0.3em] mb-4 font-light">
          Belleza & Elegancia
        </h2>
        <h1 className="text-white text-4xl md:text-7xl lg:text-8xl serif font-light mb-6 md:mb-8 max-w-4xl leading-tight">
          Redefine Tu Estilo <br /> <span className="italic">Tu Esencia</span>
        </h1>
        <p className="text-stone-200 max-w-lg mx-auto text-lg mb-10 font-light">
          Cortes profesionales a domicilio y perfumería de alta gama. Descubre nuestras ofertas de verano.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onCtaClick}
            className="px-8 py-4 bg-white text-stone-900 rounded-full font-bold uppercase tracking-widest hover:bg-stone-100 transition shadow-lg"
          >
            Reserva Tu Cita
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center space-x-8 text-white/90 text-sm font-medium">
          <div className="flex items-center bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Disponible Hoy
          </div>
          <div className="flex items-center bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            <span className="mr-1">Desde</span>
            <span className="font-bold text-lg">$7.000</span>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Hero;