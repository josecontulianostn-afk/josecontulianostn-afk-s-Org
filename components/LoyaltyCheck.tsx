import React, { useState } from 'react';
import { Gift, Star, UserCheck, Search, Loader2, Scissors } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import DigitalCard from './DigitalCard';
import { Reward } from '../types';

const LoyaltyCheck: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{
        name?: string;
        visits: number;
        referrals: number;
        nextReward: number;
        token?: string;
        tier?: string;
        // Hair Stats
        hair_service_count?: number;
        discount_5th_visit_available?: boolean;
        free_cut_available?: boolean;
    } | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);

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

            // Parallel fetch for rewards
            const { data: rewardsData } = await supabase
                .from('rewards')
                .select('*')
                .eq('is_active', true);

            if (rewardsData) setRewards(rewardsData);

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
                    tier: data.tier,
                    // Hair Mapping
                    hair_service_count: data.hair_service_count || 0,
                    discount_5th_visit_available: data.discount_5th_visit_available,
                    free_cut_available: data.free_cut_available
                });
            } else if (!tokenParam) {
                // Only show "new client" for phone search, not invalid token
                setStats({
                    visits: 0,
                    referrals: 0,
                    nextReward: 5,
                    token: 'new-client',
                    tier: 'Silver',
                    hair_service_count: 0
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
                            {/* HAIR SERVICE PROGRESS */}
                            <div className="mb-6 bg-white/5 p-4 rounded-xl border border-purple-500/20">
                                <h4 className="text-purple-300 font-bold mb-3 flex items-center justify-center gap-2">
                                    <Scissors size={18} />
                                    Peluquería & Estilo
                                </h4>

                                {/* 5th Visit Discount */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-stone-300">Desc. 10% (Cada 5)</span>
                                        <span className={stats.discount_5th_visit_available ? "text-green-400 font-bold" : "text-stone-400"}>
                                            {stats.discount_5th_visit_available ? "¡DISPONIBLE!" : `${(stats.hair_service_count || 0) % 5} / 5`}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stats.discount_5th_visit_available ? "bg-green-500" : "bg-purple-500"}`}
                                            style={{ width: stats.discount_5th_visit_available ? '100%' : `${((stats.hair_service_count || 0) % 5) * 20}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* 10th Service Free Cut */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-stone-300">Corte Gratis (Cada 10)</span>
                                        <span className={stats.free_cut_available ? "text-amber-400 font-bold" : "text-stone-400"}>
                                            {stats.free_cut_available ? "¡CANJEAR!" : `${(stats.hair_service_count || 0) % 10} / 10`}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stats.free_cut_available ? "bg-amber-500" : "bg-purple-400/60"}`}
                                            style={{ width: stats.free_cut_available ? '100%' : `${((stats.hair_service_count || 0) % 10) * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

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
                    <h3 className="serif text-xl mb-4 text-center">Canjes Disponibles</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {rewards.length > 0 ? (
                            rewards.map((reward) => {
                                const isRestricted = reward.allowed_perfume_segment === 'arab';
                                const canAfford = (stats?.visits || 0) >= reward.cost_visits;

                                return (
                                    <div key={reward.id} className={`bg-white/5 p-4 rounded-xl border ${canAfford ? 'border-amber-500/50' : 'border-white/5'} relative`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-white text-sm flex items-center gap-1">
                                                    {reward.name}
                                                    {isRestricted && <span className="text-amber-400 text-xs">*</span>}
                                                </h4>
                                                <p className="text-xs text-stone-400 mt-0.5">{reward.description}</p>
                                                {isRestricted && (
                                                    <p className="text-[10px] text-amber-500/80 italic mt-1">* Válido solo para perfumería árabe</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className={`block font-mono font-bold ${canAfford ? 'text-amber-400' : 'text-stone-500'}`}>
                                                    {reward.cost_visits} PTS
                                                </span>
                                                {canAfford && (
                                                    <button className="text-[10px] bg-amber-500 text-stone-900 px-2 py-0.5 rounded mt-1 font-bold hover:bg-amber-400 transition" onClick={() => alert("Solicita este canje en caja mostrando tu QR")}>
                                                        CANJEAR
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            // Fallback if no rewards loaded yet (or table empty)
                            <div className="flex items-start gap-4">
                                <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 mt-1">
                                    <Star size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">5ta Visita con Descuento</h4>
                                    <p className="text-xs text-stone-400 mt-0.5">Completa 4 visitas y la 5ta tiene un precio especial.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyCheck;
