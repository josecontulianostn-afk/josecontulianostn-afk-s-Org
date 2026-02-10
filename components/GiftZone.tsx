import React from 'react';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { GIFTS, PHONE_NUMBER } from '../constants';

const GiftZone: React.FC = () => {
    const handleReserve = (giftName: string) => {
        const message = encodeURIComponent(`Hola, me gustaría reservar el "${giftName}".`);
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="text-center mb-12">
                <span className="text-sm font-bold tracking-widest text-rose-400 uppercase">Detalles con Amor</span>
                <h2 className="serif text-4xl md:text-5xl mt-3 text-rose-500">Amor Amor</h2>
                <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
                    Sorprende a quien más quieres con nuestra selección exclusiva.
                </p>
            </div>

            <div className="space-y-8">
                {GIFTS.map((gift) => (
                    <div key={gift.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
                        {/* Hero Image for gifts with images */}
                        {gift.image && (
                            <div className="relative">
                                <img
                                    src={gift.image}
                                    alt={gift.name}
                                    className="w-full h-96 object-contain bg-neutral-50"
                                />
                                <div className="absolute top-4 right-4 bg-rose-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                    ${gift.price.toLocaleString('es-CL')}
                                </div>
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={20} className="text-amber-500" />
                                <h3 className="serif text-2xl md:text-3xl text-stone-900">{gift.name}</h3>
                            </div>

                            {!gift.image && (
                                <div className="text-3xl font-light text-stone-800 mb-4 font-serif">
                                    {gift.price > 0 ? `$${gift.price.toLocaleString('es-CL')}` : 'A medida'}
                                </div>
                            )}

                            {/* Description */}
                            {gift.description && (
                                <p className="text-stone-600 mb-6 italic leading-relaxed">
                                    "{gift.description}"
                                </p>
                            )}

                            {/* Includes */}
                            <div className="bg-rose-50 rounded-xl p-4 mb-6">
                                <p className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-3">Incluye:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {gift.includes.map((item, idx) => (
                                        <div key={idx} className="flex items-start text-stone-700">
                                            <Heart size={14} className="text-rose-400 mt-1 mr-2 flex-shrink-0 fill-current" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            {gift.note && (
                                <p className="text-center text-sm text-amber-600 bg-amber-50 py-2 px-4 rounded-lg mb-4">
                                    💡 {gift.note}
                                </p>
                            )}

                            <button
                                onClick={() => handleReserve(gift.name)}
                                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:from-rose-600 hover:to-rose-700 transition shadow-lg shadow-rose-200"
                            >
                                <MessageCircle size={20} />
                                Reservar por WhatsApp
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GiftZone;
