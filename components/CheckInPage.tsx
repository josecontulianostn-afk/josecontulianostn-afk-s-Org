import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Client } from '../types';
import { QrCode, CheckCircle, Search, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckInPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState(''); // For new registration
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
                // Auto check-in if found? or ask confirmation?
                // Let's ask confirmation or just do it. Simpler: Do it.
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

            // Create client
            const { data: newClient, error: createError } = await supabase
                .from('clients')
                .insert([{ name, phone: cleanPhone, visits: 0 }])
                .select()
                .single();

            if (createError) throw createError;

            // Check in
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
            // If error is duplicate/frequency limit, handle it. For now generic.
            throw new Error('Hubo un problema registrando la visita. Intenta de nuevo.');
        }

        setStep('success');
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
                <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-serif text-amber-100 mb-2">¡Llegada Registrada!</h2>
                    <p className="text-stone-400 mb-6">
                        Tu visita ha quedado en espera. Tu estilista validará tus servicios al finalizar para sumar tus puntos.
                    </p>
                    <Link
                        to="/"
                        className="block w-full py-3 bg-stone-800 hover:bg-stone-700 text-amber-100 rounded-lg transition-colors font-medium"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background decorative blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="w-full max-w-md bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-2xl shadow-xl overflow-hidden relative z-10">

                {/* Header */}
                <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-6 text-center border-b border-stone-800">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <QrCode className="w-6 h-6 text-amber-400" />
                    </div>
                    <h1 className="text-xl font-serif text-amber-100">Registro de Visita</h1>
                    <p className="text-sm text-stone-400 mt-1">Escanea al llegar para sumar puntos</p>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {step === 'search' ? (
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                                    Número de Teléfono
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ej: 912345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-lg tracking-widest text-center"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length < 8}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Buscar / Registrar
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4 animate-fade-in-right">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h3 className="text-amber-100 font-medium">¡Primera vez por aquí!</h3>
                                <p className="text-xs text-stone-400">Crea tu perfil para empezar a sumar.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                                    Tu Nombre
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre y Apellido"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-amber-500 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    disabled
                                    className="w-full bg-stone-950/50 border border-stone-800 rounded-lg px-4 py-3 text-stone-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('search')}
                                    className="flex-1 py-3 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 transition"
                                >
                                    Volver
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transition shadow-lg shadow-amber-900/20"
                                >
                                    {loading ? 'Registrando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer info */}
                <div className="bg-stone-950/50 p-4 text-center border-t border-stone-800">
                    <p className="text-xs text-stone-600">
                        Tus3B Style &bull; Sistema de Lealtad
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckInPage;
