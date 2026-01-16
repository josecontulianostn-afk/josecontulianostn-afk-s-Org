import React, { useState } from 'react';
import { Gift, Star, UserCheck, Search, Loader2, Scissors, UserPlus } from 'lucide-react';
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
        hair_service_count?: number;
    } | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // Registration Form State
    const [regName, setRegName] = useState('');
    const [regSurname, setRegSurname] = useState('');
    const [regRUT, setRegRUT] = useState('');

    const formatRUT = (value: string) => {
        // Remove dots and dashes
        let cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();
        // Replace K with 0 (as per user request "el K lo cambie por un 0")
        cleaned = cleaned.replace('K', '0');
        // Limit length? Usually RUT is 8-9 chars. User said "sin puntos ni digito verificador"? 
        // User request: "el rut que no tenga puntos ni digito verificador" 
        // This implies just the number part? Or they meant "without validation digits"? 
        // "que el K lo cambie por un 0" implies the verifier IS entered or handled.
        // Let's assume standard input but we strip formatting.
        return cleaned;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 8) {
            setPhone(val);
        }
    };

    const checkLoyalty = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');

        if (!tokenParam && phone.length < 8) return;

        setLoading(true);

        try {
            let query = supabase.from('clients').select('*');
            if (tokenParam) query = query.eq('member_token', tokenParam);
            else query = query.eq('phone', '+569' + phone);

            const { data, error } = await query.single();

            if (data) {
                // Client exists
                const currentVisits = data.visits || 0;
                let calculatedTier: 'Bronce' | 'Plata' | 'Gold' = 'Bronce';
                if (currentVisits >= 10) calculatedTier = 'Gold';
                else if (currentVisits >= 5) calculatedTier = 'Plata';

                setStats({
                    name: data.name,
                    visits: currentVisits,
                    referrals: data.referrals,
                    nextReward: currentVisits < 5 ? 5 : (currentVisits < 10 ? 10 : 15),
                    token: data.member_token,
                    tier: calculatedTier,
                    hair_service_count: data.hair_service_count || 0
                });
                setIsRegistering(false);
            } else if (!tokenParam) {
                // Client NOT found -> Allow Registration
                setIsRegistering(true);
            }

        } catch (err) {
            console.error("Error checking loyalty:", err);
            // alert("Error al conectar. Intenta nuevamente."); // Silenced for cleaner UX
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate Inputs
            const finalRUT = formatRUT(regRUT);
            const fullPhone = '+569' + phone;

            const { data, error } = await supabase.from('clients').insert([
                {
                    name: `${regName} ${regSurname}`,
                    phone: fullPhone,
                    rut: finalRUT,
                    visits: 0,
                    referrals: 0,
                    hair_service_count: 0
                }
            ]).select();

            if (error) throw error;

            if (data && data[0]) {
                const newClient = data[0];
                setStats({
                    name: newClient.name,
                    visits: 0,
                    referrals: 0,
                    nextReward: 5,
                    token: newClient.member_token,
                    tier: 'Bronce',
                    hair_service_count: 0
                });
                setIsRegistering(false);
            }

        } catch (err) {
            console.error("Error registering:", err);
            alert("No se pudo registrar. Verifica si ya existe el número o RUT.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-check on mount
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('token')) checkLoyalty();
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

                {!stats && !isRegistering && (
                    <div className="bg-stone-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-xl">
                        <p className="text-stone-400 text-center mb-6 text-sm">
                            Consulta tus puntos, beneficios y acceso a tu tarjeta digital.
                        </p>
                        <form onSubmit={checkLoyalty} className="space-y-4">
                            <div className="relative group">
                                <span className="absolute left-4 top-4.5 text-stone-500 font-mono text-lg">+569</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="87654321"
                                    maxLength={8}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-4 pl-16 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/50 transition duration-300 font-mono tracking-widest text-lg"
                                />
                                <Search size={18} className="absolute right-4 top-4.5 text-stone-600 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length < 8}
                                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-stone-900 font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-shadow flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Entrar a mi Wallet'}
                            </button>
                        </form>
                    </div>
                )}

                {!stats && isRegistering && (
                    <div className="bg-stone-900/50 backdrop-blur-md p-8 rounded-2xl border border-amber-500/20 shadow-xl animate-in slide-in-from-right-8">
                        <div className="text-center mb-6">
                            <div className="bg-amber-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                                <UserPlus size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-white">Crear Cuenta</h4>
                            <p className="text-stone-400 text-xs mt-1">
                                No encontramos el número <span className="text-amber-400 font-mono">+569 {phone}</span>. Regístrate para acumular puntos.
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    required
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    className="bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    required
                                    value={regSurname}
                                    onChange={(e) => setRegSurname(e.target.value)}
                                    className="bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="RUT (Sin puntos ni guión)"
                                required
                                value={regRUT}
                                onChange={(e) => setRegRUT(e.target.value)}
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-stone-900 font-bold py-4 rounded-xl hover:bg-stone-100 transition-colors flex justify-center items-center mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Registrarme'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="w-full text-stone-500 text-xs hover:text-white transition-colors py-2"
                            >
                                Volver / Usar otro número
                            </button>
                        </form>
                    </div>
                )}

                {stats && (
                    <div className="animate-in fade-in zoom-in-95 duration-700">
                        {/* THE WALLET CARD */}
                        <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-500">
                            <DigitalCard
                                clientName={stats.name || "Miembro Exclusivo"}
                                token={stats.token || "pending-token"}
                                visits={stats.visits}
                                nextReward={5}
                                tier={stats.tier as any}
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
                                onClick={() => {
                                    setStats(null);
                                    setPhone('');
                                    setIsRegistering(false);
                                }}
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
