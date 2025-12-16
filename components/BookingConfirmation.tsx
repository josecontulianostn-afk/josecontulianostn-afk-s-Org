import React, { useEffect } from 'react';
import { ViewState } from '../types';
import { MapPin, CheckCircle, Home, ShoppingBag, Star } from 'lucide-react';

interface BookingConfirmationProps {
    isHomeService: boolean;
    onGoHome: () => void;
    onGoCatalog: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ isHomeService, onGoHome, onGoCatalog }) => {

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 fade-in">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-stone-100 max-w-2xl w-full text-center relative overflow-hidden">

                {/* Decorative background circle */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6 shadow-sm animate-in zoom-in spin-in-12 duration-700">
                        <CheckCircle size={40} strokeWidth={2.5} />
                    </div>

                    <h2 className="serif text-4xl text-stone-900 mb-3">¡Reserva Confirmada!</h2>
                    <p className="text-xl text-stone-600 font-light mb-8">¡Gracias por tu confianza!</p>

                    {!isHomeService && (
                        <div className="bg-stone-50 p-6 rounded-2xl mb-8 border border-stone-100 transform transition hover:scale-105 duration-300">
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                                <MapPin size={14} /> Dirección del Servicio
                            </h3>
                            <p className="text-xl font-medium text-stone-800">Diagonal Vicuña Mackenna 2004</p>
                            <p className="text-lg text-stone-600">Torre B, Santiago</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button
                            onClick={onGoHome}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition-colors w-full sm:w-auto"
                        >
                            <Home size={20} />
                            Regresar al Inicio
                        </button>

                        <button
                            onClick={onGoCatalog}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-transform hover:-translate-y-1 shadow-lg w-full sm:w-auto"
                        >
                            <ShoppingBag size={20} />
                            <span>Venta de Perfumes <span className="block text-[10px] font-normal opacity-80 leading-none mt-0.5">Formatos 5ml y 10ml</span></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
