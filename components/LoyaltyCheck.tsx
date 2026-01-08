import React, { useState } from 'react';
import { Gift, Star, UserCheck, Search, Loader2 } from 'lucide-react';

const LoyaltyCheck: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ visits: number; referrals: number; nextReward: number } | null>(null);

    const checkLoyalty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 8) return;

        setLoading(true);
        // Simulate API call / Mock logic
        // In a real app, query 'leads' or 'loyalty' table in Supabase
        await new Promise(r => setTimeout(r, 1000));

        // Mock Logic: deterministic based on last digit of phone
        // If last digit is even -> 2 visits. If odd -> 4 visits (close to reward!)
        const lastDigit = parseInt(phone.replace(/\D/g, '').slice(-1));
        const visits = isNaN(lastDigit) ? 0 : (lastDigit % 2 === 0 ? 2 : 4);
        const referrals = isNaN(lastDigit) ? 0 : (lastDigit > 5 ? 1 : 0);

        setStats({
            visits: visits,
            referrals: referrals,
            nextReward: 5
        });
        setLoading(false);
    };

    return (
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500 rounded-full blur-[60px] opacity-30"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500 rounded-full blur-[60px] opacity-30"></div>

            <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
                    <Gift size={32} className="text-amber-400" />
                </div>

                <h3 className="serif text-3xl mb-2">Club Fidelidad</h3>
                <p className="text-stone-300 font-light mb-8 max-w-sm mx-auto">
                    Tu preferencia tiene recompensas. Acumula visitas y gana descuentos exclusivos.
                </p>

                {!stats ? (
                    <form onSubmit={checkLoyalty} className="max-w-xs mx-auto">
                        <div className="relative">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ingresa tu teléfono..."
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                            />
                            <Search size={18} className="absolute left-3 top-3.5 text-stone-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || phone.length < 8}
                            className="w-full mt-4 bg-white text-stone-900 font-bold py-3 rounded-xl hover:bg-amber-50 transition flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Consultar Puntos'}
                        </button>
                    </form>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
                                <span className="block text-3xl font-bold text-amber-400 mb-1">{stats.visits}</span>
                                <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">Visitas</span>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
                                <span className="block text-3xl font-bold text-purple-400 mb-1">{stats.referrals}</span>
                                <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">Referidos</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-white/5 rounded-full h-4 mb-2 overflow-hidden relative">
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out"
                                style={{ width: `${(stats.visits / 5) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-stone-300 mb-6">
                            {stats.visits >= 5
                                ? "¡Felicidades! Tienes un descuento disponible para tu próxima cita."
                                : `Te faltan ${5 - stats.visits} visitas para tu recompensa.`
                            }
                        </p>

                        <button
                            onClick={() => setStats(null)}
                            className="text-sm text-stone-400 hover:text-white underline decoration-stone-600 underline-offset-4"
                        >
                            Consultar otro número
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-white/10 text-left space-y-3">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 mt-1">
                            <Star size={16} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">5ta Visita con Descuento</h4>
                            <p className="text-xs text-stone-400 mt-0.5">Completa 4 visitas y la 5ta tiene un precio especial.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 mt-1">
                            <UserCheck size={16} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Programa de Referidos</h4>
                            <p className="text-xs text-stone-400 mt-0.5">Dile a tus amigas que indiquen tu número al agendar.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyCheck;
