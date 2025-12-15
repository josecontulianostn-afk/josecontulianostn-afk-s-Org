import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { PHONE_NUMBER } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
                <span className="serif text-3xl font-bold italic tracking-tighter block mb-4">
                  Tus3B <span className="text-stone-400 not-italic font-light text-xl ml-1">Style</span>
                </span>
                <p className="text-stone-400 font-light max-w-xs mx-auto md:mx-0">
                    Elevando tu estilo con servicios de peluquería premium a domicilio y lo mejor de la perfumería internacional.
                </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
                <h4 className="uppercase tracking-widest text-xs font-bold text-stone-500 mb-4">Contacto</h4>
                <a href={`https://wa.me/${PHONE_NUMBER}`} className="text-stone-300 hover:text-white mb-2 transition flex items-center gap-2">
                    <MessageCircle size={16} /> WhatsApp: +56 9 8452 4774
                </a>
                <span className="text-stone-300 mb-2">Santiago, Chile</span>
                <span className="text-stone-300">contacto@tus3b.cl</span>
            </div>

            <div className="flex flex-col items-center md:items-start">
                 <h4 className="uppercase tracking-widest text-xs font-bold text-stone-500 mb-4">Síguenos</h4>
                 <div className="flex space-x-4">
                     <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-stone-700 transition">
                         <Instagram size={20} />
                     </a>
                     {/* Add more social icons if needed */}
                 </div>
            </div>
        </div>
        <div className="border-t border-stone-800 mt-12 pt-8 text-center text-stone-500 text-sm font-light">
            &copy; {new Date().getFullYear()} Tus3B Style. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;