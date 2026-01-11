import React, { useState } from 'react';
import { Sparkles, X, MessageCircle, Send, Search } from 'lucide-react';
import { PERFUMES } from '../constants';
import { Perfume } from '../types';

interface RecommenderProps {
    onSelectPerfume: (perfumeId: string) => void;
}

const PerfumeRecommender: React.FC<RecommenderProps> = ({ onSelectPerfume }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ perfume: Perfume, score: number, matches: string[] }[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const terms = query.toLowerCase().split(/[\s,]+/).filter(t => t.length > 2);
        const scored = PERFUMES.map(perfume => {
            let score = 0;
            const matches: string[] = [];

            // Helper to check and score
            const check = (text: string, weight: number) => {
                terms.forEach(term => {
                    if (text.toLowerCase().includes(term)) {
                        score += weight;
                        if (!matches.includes(term)) matches.push(term);
                    }
                });
            };

            check(perfume.name, 3);
            check(perfume.description, 1);
            check(perfume.brand, 2);
            perfume.notes.forEach(note => check(note, 2));
            check(perfume.category === 'arab' ? 'arabe' : 'clasico', 2);

            return { perfume, score, matches };
        });

        // Filter relevant results and sort
        const top = scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        setResults(top);
        setHasSearched(true);
    };

    const handleReset = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2"
            >
                <Sparkles size={24} className="animate-pulse" />
                <span className="font-bold pr-1 hidden md:block">Asesor IA</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                                <Sparkles className="text-yellow-300" /> Asesor de Aromas
                            </h2>
                            <p className="text-white/80 text-sm">
                                Cuéntame qué te gusta y te recomendaré tu perfume ideal.
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            {!hasSearched ? (
                                <div className="text-center py-8">
                                    <div className="bg-purple-50 inline-flex p-4 rounded-full mb-4">
                                        <MessageCircle size={48} className="text-purple-400" />
                                    </div>
                                    <h3 className="font-bold text-stone-700 mb-2">¿Qué buscas hoy?</h3>
                                    <p className="text-stone-500 text-sm mb-6">
                                        Ejemplos: <br />
                                        "Algo dulce con vainilla"<br />
                                        "Fresco y cítrico para el día"<br />
                                        "Intenso y sexy para fiesta"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {results.length > 0 ? (
                                        <>
                                            <h3 className="font-bold text-stone-700 text-sm uppercase tracking-wider mb-2">
                                                Mejores Coincidencias:
                                            </h3>
                                            {results.map(({ perfume, matches }, idx) => (
                                                <div
                                                    key={perfume.id}
                                                    onClick={() => {
                                                        onSelectPerfume(perfume.id);
                                                        setIsOpen(false);
                                                    }}
                                                    className="border border-stone-200 rounded-xl p-3 flex gap-3 hover:border-purple-500 hover:shadow-md transition cursor-pointer bg-white group"
                                                >
                                                    <div className="w-16 h-16 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                                                        {idx === 0 && (
                                                            <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                                                                #1
                                                            </div>
                                                        )}
                                                        <img src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-stone-900 truncate group-hover:text-purple-700">{perfume.name}</h4>
                                                        <p className="text-xs text-stone-500 mb-2 truncate">{perfume.brand}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {matches.map(m => (
                                                                <span key={m} className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                                    ✓ {m}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={handleReset}
                                                className="w-full text-center text-sm text-stone-400 hover:text-stone-600 mt-4 underline"
                                            >
                                                Probar otra búsqueda
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-stone-500 mb-4">No encontré coincidencias exactas. 🤷‍♂️</p>
                                            <button
                                                onClick={handleReset}
                                                className="bg-stone-100 text-stone-700 px-4 py-2 rounded-lg font-bold"
                                            >
                                                Intentar de nuevo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer (Input) */}
                        <form onSubmit={handleSearch} className="p-4 border-t border-stone-100 bg-stone-50">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Escribe aquí..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!query.trim()}
                                    className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg disabled:bg-stone-300 disabled:cursor-not-allowed transition"
                                >
                                    {hasSearched ? <Search size={20} /> : <Send size={20} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PerfumeRecommender;
