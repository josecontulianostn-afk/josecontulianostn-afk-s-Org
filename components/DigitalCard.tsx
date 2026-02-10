import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GripHorizontal, Check } from 'lucide-react';
import AddToWalletButtons from './AddToWalletButtons';

interface DigitalCardProps {
    clientName: string;
    token: string;
    visits: number;
    nextReward: number;
    tier?: string;
}

const DigitalCard: React.FC<DigitalCardProps> = ({ clientName, token, visits, nextReward, tier = 'Bronce' }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Determines the visual theme based on the 3 requested levels
    const getTheme = (t: string) => {
        // Fallbacks for legacy
        if (t === 'Silver') t = 'Bronce';

        switch (t) {
            case 'Gold':
                return {
                    name: 'NIVEL GOLD',
                    bgGradient: 'bg-gradient-to-br from-amber-500 to-yellow-600', // Gold
                    stampColor: 'bg-amber-100 text-amber-700',
                    benefit: '30% OFF'
                };
            case 'Plata':
                return {
                    name: 'NIVEL PLATA',
                    bgGradient: 'bg-gradient-to-br from-slate-400 to-stone-400', // Silver/Metallic
                    stampColor: 'bg-slate-50 text-slate-900',
                    benefit: '15% OFF'
                };
            case 'Bronce':
            default:
                return {
                    name: 'NIVEL BRONCE',
                    bgGradient: 'bg-gradient-to-br from-stone-800 to-stone-950', // Dark
                    stampColor: 'bg-white text-stone-950',
                    benefit: '5% OFF'
                };
        }
    };

    const theme = getTheme(tier || 'Bronce');

    // Logic for Stamp Grid
    // We show 10 slots to visualize the full path to Gold
    const TOTAL_SLOTS = 10;

    return (
        <div className="w-full max-w-sm mx-auto perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT - STAMP CARD STYLE */}
                <div className="backface-hidden w-full bg-stone-950 rounded-[24px] overflow-hidden shadow-2xl flex flex-col relative h-[680px] border border-stone-800">

                    {/* Header: Branding & Client */}
                    <div className="p-6 pb-2 flex justify-between items-start z-10">
                        <div>
                            <h2 className="font-serif italic text-2xl text-white tracking-tight">Tus3B <span className="text-amber-500">Style</span></h2>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold block mt-1">{theme.name}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-stone-500 uppercase font-bold mb-0.5">Cliente</p>
                            <p className="text-white font-bold text-lg leading-none">{clientName.split(' ')[0]}</p>
                        </div>
                    </div>

                    {/* STAMP GRID */}
                    <div className="px-6 py-4 z-10">
                        {/* We display 2 rows of 5 circles */}
                        <div className="grid grid-cols-5 gap-3 mb-2">
                            {[...Array(TOTAL_SLOTS)].map((_, i) => {
                                // Logic: 
                                // If visits = 3, stamps 0,1,2 filled.
                                // If visits = 5. User is Plata. Stamps 0-4 filled? Or reset? Usually cumulative.
                                // Let's assume cumulative up to 10 for Gold?
                                // If user has 12 visits, 10 slots filled + maybe show +2 somewhere or reset grid?
                                // For now, linear progress 0-10.
                                const filled = i < (visits % 11);
                                if (visits >= 10) {
                                    // If Gold (10+), all filled? Or start new cycle? 
                                    // Let's assume all filled for the visual satisfaction of Gold level till next cycle logic implemented
                                }

                                return (
                                    <div key={i} className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-500 ${i < visits ? 'bg-white border-white scale-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-stone-900/50 border-stone-700 scale-90'}`}>
                                        {i < visits && <Check size={20} className="text-stone-950 stroke-[4]" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-2 px-1">
                            <span className={visits >= 5 ? "text-slate-400 font-bold" : ""}>PLATA (5)</span>
                            <span className={visits >= 10 ? "text-amber-500 font-bold" : ""}>GOLD (10)</span>
                        </div>
                    </div>

                    {/* COUNTERS */}
                    <div className="px-8 py-2 flex justify-between items-center z-10 mt-2">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Total Servicios</p>
                            <p className="text-4xl font-black text-white">{visits}</p>
                        </div>
                        <div className="w-px h-10 bg-stone-800"></div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Nivel Actual</p>
                            <p className={`text-xl font-black text-white`}>{tier || 'Bronce'}</p>
                        </div>
                    </div>

                    {/* QR CODE */}
                    <div className="flex-grow flex items-center justify-center p-6 relative">
                        <div className="absolute top-0 left-0 w-full flex justify-between items-center">
                            <div className="w-6 h-6 bg-[#1c1917] rounded-r-full -ml-3"></div>
                            <div className="w-full border-t-2 border-dashed border-stone-800 mx-2"></div>
                            <div className="w-6 h-6 bg-[#1c1917] rounded-l-full -mr-3"></div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                            <QRCodeSVG value={token} size={160} level={"M"} />
                            <p className="text-center text-[9px] font-mono mt-2 text-stone-500 tracking-widest">{token}</p>
                        </div>

                        {/* Removed AddToWalletButtons from here to place it outside */}

                    </div>

                    {/* Background Ambient Effect */}
                    <div className={`absolute top-0 left-0 w-full h-full opacity-20 ${theme.bgGradient} z-0`}></div>
                </div>

                {/* BACK - DETAILS & BENEFITS */}
                <div className="absolute top-0 left-0 backface-hidden w-full h-[680px] bg-stone-900 rounded-[24px] shadow-2xl rotate-y-180 p-8 text-white flex flex-col justify-between border border-stone-800">
                    <div>
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                            <h3 className="font-serif italic text-2xl">Beneficios</h3>
                            <GripHorizontal className="text-stone-500" />
                        </div>

                        <div className="space-y-4">
                            {/* BRONCE */}
                            <div className={`p-3 rounded-2xl border ${tier === 'Bronce' ? 'border-stone-500 bg-stone-800' : 'border-stone-800 bg-stone-900/50 opacity-50'} flex gap-4 items-center`}>
                                <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center font-bold text-stone-400">0</div>
                                <div>
                                    <h4 className="font-bold text-stone-300">Nivel Bronce</h4>
                                    <p className="text-[10px] text-stone-500">0 - 4 visitas</p>
                                    <span className="text-[10px] text-stone-400">5% OFF en productos</span>
                                </div>
                            </div>

                            {/* PLATA */}
                            <div className={`p-3 rounded-2xl border ${tier === 'Plata' ? 'border-slate-400 bg-slate-800' : 'border-stone-800 bg-stone-900/50 opacity-50'} flex gap-4 items-center`}>
                                <div className="w-10 h-10 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold shadow-lg shadow-slate-500/20">5</div>
                                <div>
                                    <h4 className="font-bold text-slate-200">Nivel Plata</h4>
                                    <p className="text-[10px] text-stone-400">5 - 9 visitas</p>
                                    <span className="text-[10px] text-slate-300 font-bold">15% OFF en servicios</span>
                                </div>
                            </div>

                            {/* GOLD */}
                            <div className={`p-3 rounded-2xl border ${tier === 'Gold' ? 'border-amber-500 bg-amber-900/20' : 'border-stone-800 bg-stone-900/50 opacity-50'} flex gap-4 items-center`}>
                                <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center font-bold shadow-lg shadow-amber-500/40">10</div>
                                <div>
                                    <h4 className="font-bold text-amber-500">Nivel Gold</h4>
                                    <p className="text-[10px] text-stone-400">10+ visitas</p>
                                    <span className="text-[10px] text-amber-400 font-bold">30% OFF + VIP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-stone-500">Muestra tu código QR para desbloquear niveles.</p>
                    </div>
                </div>

            </div>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default DigitalCard;
