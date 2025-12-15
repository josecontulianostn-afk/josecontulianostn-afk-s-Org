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
          Cortes profesionales a domicilio y perfumería de alta gama en formatos exclusivos. La experiencia que mereces, donde la necesitas.
        </p>

        <button
          onClick={onCtaClick}
          className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white overflow-hidden rounded-sm transition-all hover:bg-white hover:text-stone-900"
        >
          <span className="relative z-10 text-sm font-bold uppercase tracking-widest">Reserva Tu Cita</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;