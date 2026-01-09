import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Crown, Star, RefreshCw } from 'lucide-react';

interface DigitalCardProps {
    clientName: string;
    token: string;
    visits: number;
    nextReward: number;
    tier?: string;
}

const DigitalCard: React.FC<DigitalCardProps> = ({ clientName, token, visits, nextReward, tier = 'Silver' }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const getLevel = (t: string) => {
        switch (t) {
            case 'Diamante': return { name: 'Diamante', color: 'from-blue-400 to-purple-600' };
            case 'Gold': return { name: 'Gold', color: 'from-amber-300 to-amber-600' };
            default: return { name: 'Silver', color: 'from-stone-400 to-stone-600' };
        }
    };

    const level = getLevel(tier);

    return (
        <div className="perspective-1000 w-full max-w-sm mx-auto h-56 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full duration-700 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden w-full h-full rounded-2xl p-6 shadow-2xl overflow-hidden bg-stone-900 border border-stone-800 flex flex-col justify-between">
                    {/* Background Effects */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${level.color} opacity-20 rounded-full blur-3xl -mr-10 -mt-10`}></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-amber-500 font-serif italic text-lg opacity-80">Tus3B Club</h3>
                            <p className="text-white font-bold text-xl tracking-wide mt-1">{clientName || "Miembro Exclusivo"}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md`}>
                            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${level.color} font-bold text-xs uppercase tracking-wider`}>
                                {level.name}
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={`${i < (visits % 5) ? 'text-amber-400 fill-amber-400' : 'text-stone-700'}`}
                                    />
                                ))}
                            </div>
                            <div className="text-right">
                                <p className="text-stone-400 text-xs">Próxima recompensa</p>
                                <p className="text-white font-mono">{5 - (visits % 5)} visitas</p>
                            </div>
                        </div>
                        <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${level.color}`}
                                style={{ width: `${((visits % 5) / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 animate-pulse">
                        <RefreshCw size={14} className="text-stone-600" />
                    </div>
                </div>

                {/* BACK (QR) */}
                <div className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl p-6 shadow-xl rotate-y-180 flex flex-col items-center justify-center border-2 border-amber-500">
                    <div className="bg-white p-2 rounded-lg">
                        <QRCodeSVG value={token} size={150} level={"H"} />
                    </div>
                    <p className="mt-4 text-stone-900 font-bold tracking-widest text-xs">{token.slice(0, 8)}...</p>
                    <p className="text-xs text-stone-500 mt-1 uppercase">Escanea para sumar puntos</p>
                </div>

            </div>

            {/* Styles for 3D flip interaction */}
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
