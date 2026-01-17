import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ShoppingBag, Gift, Calendar, QrCode, ArrowRight } from 'lucide-react';

const HomeSelection: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-950 text-white flex flex-col relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Content Container */}
            <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full z-10 space-y-8">

                {/* 1. BRAND HEADER */}
                {/* 1. BRAND HEADER */}
                <div className="text-center space-y-2 mb-4">
                    <h1 className="font-serif italic text-5xl md:text-6xl text-white tracking-tighter">
                        Tus3B <span className="text-amber-500">Hub</span>
                    </h1>
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-medium">
                        Belleza &bull; Aroma &bull; Regalos
                    </p>
                </div>

                {/* 2. THE 3 PILLARS (Category Cards) */}
                <div className="w-full space-y-4">

                    {/* STYLE PILLAR */}
                    <Link to="/style" className="group block relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/40 hover:bg-stone-900/60 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-white border border-stone-700 group-hover:border-white/50 transition-colors">
                                    <Scissors size={24} />
                                </div>
                                <div>
                                    <h2 className="font-serif text-2xl italic">Style</h2>
                                    <p className="text-[10px] text-stone-500 uppercase tracking-widest">Peluquería & Color</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-stone-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>

                    {/* PERFUM PILLAR */}
                    <Link to="/perfum" className="group block relative overflow-hidden rounded-2xl border border-amber-900/30 bg-stone-900/40 hover:bg-amber-950/20 transition-all duration-300">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-900/20 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h2 className="font-serif text-2xl text-amber-500">Perfum</h2>
                                    <p className="text-[10px] text-amber-800/80 uppercase tracking-widest">Decants Exclusivos</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-amber-900/50 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </Link>

                    {/* LOVE PILLAR */}
                    <Link to="/regalos" className="group block relative overflow-hidden rounded-2xl border border-rose-900/30 bg-stone-900/40 hover:bg-rose-950/20 transition-all duration-300">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-rose-900/20 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:border-rose-500/50 transition-colors">
                                    <Gift size={24} />
                                </div>
                                <div>
                                    <h2 className="font-serif text-2xl text-rose-400">Amor Amor</h2>
                                    <p className="text-[10px] text-rose-800/80 uppercase tracking-widest">Detalles Especiales</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-rose-900/50 group-hover:text-rose-400 transition-colors" />
                        </div>
                    </Link>

                </div>

                {/* 3. LOYALTY TEASER */}
                <div className="w-full mt-4">
                    <Link to="/loyalty" className="block relative bg-gradient-to-r from-stone-900 to-stone-800 p-1 rounded-2xl shadow-xl group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative bg-stone-950 rounded-xl p-5 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="bg-white text-black p-2 rounded-lg">
                                    <QrCode size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 font-medium">Tus3B Club</p>
                                    <p className="text-sm font-bold text-white">Mi Tarjeta Digital</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-stone-800 px-2 py-1 rounded text-stone-300 group-hover:bg-stone-700 transition">Ver Puntos</span>
                        </div>
                    </Link>
                </div>

                {/* 4. MAIN CTA - REMOVED AS REQUESTED */}
                <div className="w-full pt-4">
                    <p className="text-center text-[10px] text-stone-600 mt-3">
                        Toca una categoría para explorar
                    </p>
                </div>

            </div>

            <div className="text-center py-6 z-10">
                <p className="text-[9px] text-stone-700 uppercase tracking-widest">Estilo &bull; Confianza &bull; Calidad</p>
            </div>
        </div>
    );
};

export default HomeSelection;
