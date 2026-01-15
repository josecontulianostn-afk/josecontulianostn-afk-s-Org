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
                // Logic based on User Request (Three Tiers):
                // Bronce: 0-4 visits
                // Plata: 5-9 visits
                // Gold: 10+ visits
                const currentVisits = data.visits || 0;
                let calculatedTier: 'Bronce' | 'Plata' | 'Gold' = 'Bronce';

                if (currentVisits >= 10) {
                    calculatedTier = 'Gold';
                } else if (currentVisits >= 5) {
                    calculatedTier = 'Plata';
                }

                setStats({
                    name: data.name,
                    visits: currentVisits,
                    referrals: data.referrals,
                    nextReward: currentVisits < 5 ? 5 : (currentVisits < 10 ? 10 : 15),
                    token: data.member_token,
                    tier: calculatedTier,
                    // Hair Mapping
                    hair_service_count: data.hair_service_count || 0,
                    discount_5th_visit_available: data.discount_5th_visit_available,
                    free_cut_available: data.free_cut_available
                });
            } else if (!tokenParam) {
                // New Client Default
                setStats({
                    name: 'Nuevo Cliente',
                    visits: 0,
                    referrals: 0,
                    nextReward: 5,
                    token: 'new-client',
                    tier: 'Bronce',
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
        <div className="bg-stone-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl min-h-[600px] flex flex-col items-center">
            {/* Soft Ambient Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10 w-full max-w-md">

                <div className="text-center mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">Bienvenida a tu</span>
                    <h3 className="serif text-4xl mt-2 text-white">Wallet Clientes</h3>
                </div>

                {!stats ? (
                    <div className="bg-stone-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-xl">
                        <p className="text-stone-400 text-center mb-6 text-sm">
                            Consulta tus puntos, beneficios y acceso a tu tarjeta digital.
                        </p>
                        <form onSubmit={checkLoyalty} className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Ingresa tu teléfono..."
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-4 pl-12 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/50 transition duration-300"
                                />
                                <Search size={18} className="absolute left-4 top-4.5 text-stone-600 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length < 8}
                                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-stone-900 font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-shadow flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Abrir mi Wallet'}
                            </button>
                        </form>
                        <p className="text-[10px] text-stone-600 text-center mt-6">
                            Al consultar aceptas nuestros términos de fidelización.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-700">
                        {/* THE WALLET CARD */}
                        <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-500">
                            <DigitalCard
                                clientName={stats.name || "Miembro Exclusivo"}
                                token={stats.token || "pending-token"}
                                visits={stats.visits}
                                nextReward={5}
                                tier={stats.tier}
                            />
                        </div>

                        {/* Actions Below Card */}
                        <div className="text-center space-y-4">
                            <p className="text-sm text-stone-400">
                                {stats.visits >= 5
                                    ? "✨ Tienes una recompensa disponible"
                                    : "Sigue sumando para desbloquear beneficios"
                                }
                            </p>

                            <button
                                onClick={() => setStats(null)}
                                className="text-xs text-stone-500 hover:text-stone-300 transition"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoyaltyCheck;
