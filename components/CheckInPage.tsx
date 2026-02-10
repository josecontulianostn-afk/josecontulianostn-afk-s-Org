import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Client } from '../types';
import { QrCode, CheckCircle, Search, UserPlus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import DigitalCard from './DigitalCard';
import AddToWalletButtons from './AddToWalletButtons';

const CheckInPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState(''); // For new registration
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'search' | 'register' | 'success'>('search');
    const [client, setClient] = useState<Client | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Clean phone
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 8) {
                throw new Error('Ingresa un número válido (ej: 912345678)');
            }

            // 2. Find client
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('phone', cleanPhone)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setClient(data);
                await submitCheckIn(data.id);
            } else {
                // Not found -> Go to Register step
                setStep('register');
            }
        } catch (err: any) {
            setError(err.message || 'Error al buscar cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const cleanPhone = phone.replace(/\D/g, '');
            if (!name.trim()) throw new Error('Ingresa tu nombre');
            if (!termsAccepted) throw new Error('Debes aceptar los términos de uso');

            // Format birth date if necessary, assuming input is YYYY-MM-DD

            // Create client
            const { data: newClient, error: createError } = await supabase
                .from('clients')
                .insert([{
                    name,
                    phone: cleanPhone,
                    visits: 0,
                    email: email || null,
                    birth_date: birthDate || null
                }])
                .select()
                .single();

            if (createError) throw createError;

            setClient(newClient);
            await submitCheckIn(newClient.id);
        } catch (err: any) {
            setError(err.message || 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const submitCheckIn = async (clientId: string) => {
        const { error } = await supabase
            .from('visit_registrations')
            .insert([{ client_id: clientId }]);

        if (error) {
            console.error(error); // Log error
            throw new Error('Hubo un problema registrando la visita. Intenta de nuevo.');
        }

        setStep('success');
    };

    if (step === 'success' && client) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Ambient */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stone-900 to-stone-950 z-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-md w-full animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                            <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-serif text-white mb-2">¡Llegada Confirmada!</h2>
                        <p className="text-stone-400">Bienvenido, <span className="text-amber-400 font-bold">{client.name}</span>. Hemos avisado a tu estilista.</p>
                    </div>

                    <div className="mb-8">
                        <DigitalCard
                            clientName={client.name}
                            token={client.id} // Using ID as token for now, or generate a specific one
                            visits={client.visits || 0}
                            nextReward={5 - ((client.visits || 0) % 5)}
                            tier={client.tier || 'Bronce'}
                        />
                        <div className="mt-6 max-w-sm mx-auto">
                            <AddToWalletButtons />
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <Link
                            to="/"
                            className="inline-block text-sm text-stone-500 hover:text-white transition-colors border-b border-transparent hover:border-stone-500"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background decorative blobs */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 shadow-xl mb-6">
                        <QrCode className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-4xl font-serif text-white mb-3">Check-in</h1>
                    <p className="text-stone-400 text-lg">Tu experiencia comienza aquí.</p>
                </div>

                <div className="bg-stone-900/50 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm text-center flex items-center justify-center gap-2">
                            <span className="block w-2 h-2 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    {step === 'search' ? (
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                                    Número de Teléfono
                                </label>
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        placeholder="9 1234 5678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-6 py-5 text-white placeholder-stone-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-2xl tracking-widest text-center shadow-inner font-mono group-hover:border-stone-700"
                                        autoFocus
                                    />
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-white/5 pointer-events-none" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length < 8}
                                className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-bold text-lg rounded-2xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="w-6 h-6 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Confirmar Llegada</span>
                                        <Sparkles className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6 animate-fade-in-right">
                            <div className="text-center mb-6 border-b border-stone-800/50 pb-6">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl text-white font-medium">¡Bienvenida!</h3>
                                <p className="text-sm text-stone-400">Crea tu perfil en segundos para sumar puntos hoy mismo.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
                                        Tu Nombre
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Carolina Muñoz"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-5 py-4 text-white placeholder-stone-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-lg"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
                                        Email (Opcional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-5 py-4 text-white placeholder-stone-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-5 py-4 text-white placeholder-stone-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            disabled
                                            className="w-full bg-stone-950/50 border border-stone-800/50 rounded-xl px-5 py-4 text-stone-500 font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="w-5 h-5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500/50"
                                    />
                                    <label htmlFor="terms" className="text-sm text-stone-400 select-none">
                                        He leído y acepto los <a href="#" className="text-amber-500 hover:underline">términos de uso</a>.
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('search')}
                                    className="px-6 py-4 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 bg-white text-stone-950 font-bold rounded-xl hover:bg-stone-200 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? 'Registrando...' : 'Crear y Entrar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center text-stone-600 text-xs mt-8">
                    Tus3B Style &bull; Sistema de Lealtad &bull; v2.0
                </p>
            </div>
        </div>
    );
};

export default CheckInPage;
