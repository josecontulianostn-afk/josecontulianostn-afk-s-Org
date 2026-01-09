import React, { useState } from 'react';
import { Gift, Star, UserCheck, Search, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import DigitalCard from './DigitalCard';

const LoyaltyCheck: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ name?: string; visits: number; referrals: number; nextReward: number; token?: string; tier?: string } | null>(null);

    const checkLoyalty = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Determine search method
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');

        if (!tokenParam && phone.length < 8) return;

        setLoading(true);

        try {
            let query = supabase.from('clients').select('*');

            if (tokenParam) {
                query = query.eq('member_token', tokenParam);
            } else {
                query = query.eq('phone', phone);
            }

            const { data, error } = await query.single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching loyalty:", error);
                // Only alert if manual action
                if (!tokenParam) alert("Hubo un error al consultar. Intenta de nuevo.");
                setLoading(false);
                return;
            }

            if (data) {
                setStats({
                    visits: data.visits,
                    referrals: data.referrals,
                    nextReward: 5,
                    token: data.member_token,
                    tier: data.tier
                });
            } else if (!tokenParam) {
                // Only show "new client" for phone search, not invalid token
                setStats({
                    visits: 0,
                    referrals: 0,
                    nextReward: 5,
                    token: 'new-client',
                    tier: 'Silver'
                });
            }

        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-check if token is present
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('token')) {
            checkLoyalty();
        }
    }, []);

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
                    <div className="animate-in fade-in zoom-in-95 duration-500 mb-8">
                        <DigitalCard
                            clientName={stats.name || "Miembro Exclusivo"}
                            token={stats.token || "pending-token"}
                            visits={stats.visits}
                            nextReward={5}
                            tier={stats.tier}
                        />

                        <div className="text-center mt-6">
                            <p className="text-sm text-stone-300 mb-4">
                                {stats.visits >= 5
                                    ? "¡Felicidades! Tienes un descuento disponible."
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
