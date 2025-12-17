import React from 'react';
import { Star, Quote } from 'lucide-react';
import { REVIEWS } from '../constants';

const Reviews: React.FC = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Testimonios</span>
                    <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Lo que dicen nuestras clientas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {REVIEWS.map((review) => (
                        <div
                            key={review.id}
                            className="bg-stone-50 p-8 rounded-sm hover:shadow-lg transition-shadow duration-300 relative"
                        >
                            <Quote
                                className="absolute top-6 right-6 text-stone-200"
                                size={40}
                            />

                            <div className="flex space-x-1 mb-4 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                        className={i < review.rating ? "text-amber-500" : "text-stone-300"}
                                    />
                                ))}
                            </div>

                            <p className="text-stone-600 italic mb-6 leading-relaxed relative z-10">
                                "{review.comment}"
                            </p>

                            <div className="flex justify-between items-end border-t border-stone-200 pt-4">
                                <div>
                                    <h4 className="font-bold text-stone-900">{review.name}</h4>
                                    <span className="text-xs text-stone-400 font-medium">Cliente Verificado</span>
                                </div>
                                <span className="text-xs text-stone-400">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
