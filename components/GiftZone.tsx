import React from 'react';
import { Gift, Heart } from 'lucide-react';
import { GIFTS, PHONE_NUMBER } from '../constants';

const GiftZone: React.FC = () => {
    const handleReserve = (giftName: string) => {
        const message = encodeURIComponent(`Hola, me gustaría reservar el "${giftName}".`);
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, '_blank');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh]">
            <div className="text-center mb-16">
                <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Detalles con Amor</span>
                <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Zona de Regalitos</h2>
                <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
                    Sorprende a quien más quieres con nuestra selección exclusiva.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {GIFTS.map((gift) => (
                    <div key={gift.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-100 hover:shadow-xl transition-shadow flex flex-col">
                        <div className="bg-amber-50 p-8 flex justify-center items-center h-48 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-amber-100 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            <Gift size={64} className="text-amber-500 relative z-10" />
                        </div>

                        <div className="p-8 flex-grow flex flex-col">
                            <h3 className="serif text-2xl text-stone-900 mb-2">{gift.name}</h3>
                            <div className="text-3xl font-light text-stone-800 mb-6 font-serif">
                                {gift.price > 0 ? `$${gift.price.toLocaleString('es-CL')}` : 'A medida'}
                            </div>

                            <div className="space-y-3 mb-8 flex-grow">
                                {gift.includes.map((item, idx) => (
                                    <div key={idx} className="flex items-start text-stone-600">
                                        <Heart size={16} className="text-amber-400 mt-1 mr-2 flex-shrink-0 fill-current" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleReserve(gift.name)}
                                className="w-full bg-stone-900 text-white py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-stone-800 transition shadow-md"
                            >
                                Reservar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GiftZone;
