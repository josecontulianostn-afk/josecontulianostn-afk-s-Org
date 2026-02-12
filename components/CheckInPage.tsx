import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Client, Service } from '../types';
import { SERVICES } from '../constants';
import { QrCode, CheckCircle, Search, UserPlus, Sparkles, Clock, Scissors, ChevronRight, CalendarCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DigitalCard from './DigitalCard';
import AddToWalletButtons from './AddToWalletButtons';

// Only show Style services (exclude home-only)
const STYLE_SERVICES = SERVICES.filter(s => !s.homeServiceOnly);

const CheckInPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'search' | 'register' | 'has-booking' | 'select-service' | 'confirming' | 'success'>('search');
    const [client, setClient] = useState<Client | null>(null);
    const [error, setError] = useState('');
    const [existingBooking, setExistingBooking] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [assignedTime, setAssignedTime] = useState<string>('');

    const getTodayStr = () => {
        const now = new Date();
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    const getCurrentTimeMinutes = () => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    // Find next available slot for a given duration (in minutes)
    const findNextAvailableSlot = async (durationMin: number): Promise<string> => {
        const today = getTodayStr();
        const currentMinutes = getCurrentTimeMinutes();

        // Fetch today's bookings
        const { data: todaysBookings } = await supabase
            .from('bookings')
            .select('time, duration_minutes')
            .eq('date', today);

        // Build occupied ranges
        const occupied = (todaysBookings || []).map((b: any) => {
            const [h, m] = b.time.split(':').map(Number);
            const start = h * 60 + (m || 0);
            return { start, end: start + (b.duration_minutes || 60) };
        });

        // Business hours: 10:00 - 21:00 (in minutes: 600 - 1260)
        const OPEN = 600;  // 10:00
        const CLOSE = 1260; // 21:00

        // Start from next full hour after now, or opening time
        let candidate = Math.max(OPEN, Math.ceil(currentMinutes / 60) * 60);

        while (candidate + durationMin <= CLOSE) {
            const candidateEnd = candidate + durationMin;
            const conflict = occupied.some(slot =>
                (candidate < slot.end && candidateEnd > slot.start)
            );
            if (!conflict) {
                const hours = Math.floor(candidate / 60);
                const mins = candidate % 60;
                return `${hours}:${mins.toString().padStart(2, '0')}`;
            }
            candidate += 30; // Try next 30-min slot
        }

        throw new Error('No hay horarios disponibles hoy. Intenta reservar para otro día.');
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 8) {
                throw new Error('Ingresa un número válido (8 dígitos)');
            }
            const fullPhone = '+569' + cleanPhone;

            // 1. Find client
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('phone', fullPhone)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setClient(data);
                // 2. Check for today's booking
                await checkTodaysBooking(data, fullPhone);
            } else {
                setStep('register');
            }
        } catch (err: any) {
            setError(err.message || 'Error al buscar cliente');
        } finally {
            setLoading(false);
        }
    };

    const checkTodaysBooking = async (clientData: Client, fullPhone: string) => {
        const today = getTodayStr();
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('phone', fullPhone)
            .eq('date', today)
            .order('time', { ascending: true });

        if (bookings && bookings.length > 0) {
            // Has a booking today -> auto-confirm
            setExistingBooking(bookings[0]);
            await submitCheckIn(clientData.id);
            setStep('has-booking');
        } else {
            // No booking today -> show service selector
            setStep('select-service');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const cleanPhone = phone.replace(/\D/g, '');
            const fullPhone = '+569' + cleanPhone;

            if (!name.trim()) throw new Error('Ingresa tu nombre');
            if (!termsAccepted) throw new Error('Debes aceptar los términos de uso');

            const { data: newClient, error: createError } = await supabase
                .from('clients')
                .insert([{
                    name,
                    phone: fullPhone,
                    visits: 0,
                    email: email || null,
                    birth_date: birthDate || null
                }])
                .select()
                .single();

            if (createError) throw createError;

            setClient(newClient);
            // After registration, go to service selector (new clients won't have bookings)
            setStep('select-service');
        } catch (err: any) {
            setError(err.message || 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSelect = async (service: Service) => {
        setSelectedService(service);
        setLoading(true);
        setError('');
        setStep('confirming');

        try {
            if (!client) throw new Error('Cliente no encontrado');

            // 1. Find next available slot
            const nextSlot = await findNextAvailableSlot(service.durationMin);
            setAssignedTime(nextSlot);

            // 2. Create booking in calendar
            const today = getTodayStr();
            const { error: bookingError } = await supabase
                .from('bookings')
                .insert([{
                    name: client.name,
                    phone: client.phone,
                    email: client.email || 'walkin@tus3b.cl',
                    date: today,
                    time: nextSlot,
                    duration_minutes: service.durationMin,
                    service_name: service.name,
                    is_home_service: false,
                    created_at: new Date().toISOString()
                }]);

            if (bookingError) throw bookingError;

            // 3. Register visit for loyalty
            await submitCheckIn(client.id);

            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Error al crear la reserva');
            setStep('select-service');
        } finally {
            setLoading(false);
        }
    };

    const submitCheckIn = async (clientId: string) => {
        // 1. Log the visit registration
        const { error: logError } = await supabase
            .from('visit_registrations')
            .insert([{ client_id: clientId }]);

        if (logError) {
            console.error("Error logging visit:", logError);
        }

        // 2. Auto-increment loyalty points
        // We use the current state 'visits' + 1. 
        // Ideally we would use an RPC or SQL increment to be atomic, but this works for now.
        if (client) {
            const newVisits = (client.visits || 0) + 1;
            const { data: updatedClient, error: updateError } = await supabase
                .from('clients')
                .update({
                    visits: newVisits,
                    last_visit: new Date().toISOString()
                })
                .eq('id', clientId)
                .select()
                .single();

            if (updateError) {
                console.error("Error updating loyalty points:", updateError);
            } else if (updatedClient) {
                setClient(updatedClient); // Update UI to show new progress
            }
        }
    };

    const formatTime = (time: string) => {
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${hour12}:${m || '00'} ${ampm}`;
    };

    // ─── SCREEN: Auto-confirmed booking ───
    if (step === 'has-booking' && client && existingBooking) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stone-900 to-stone-950 z-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-md w-full animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-4 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                            <CalendarCheck size={40} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-serif text-white mb-2">¡Cita Confirmada!</h2>
                        <p className="text-stone-400">
                            Bienvenida, <span className="text-amber-400 font-bold">{client.name}</span>
                        </p>
                    </div>

                    <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                <Scissors className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">{existingBooking.service_name || 'Servicio reservado'}</p>
                                <p className="text-stone-400 text-sm">Tu reserva de hoy</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-stone-950/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Hora</p>
                                <p className="text-white font-bold text-lg">{formatTime(existingBooking.time)}</p>
                            </div>
                            <div className="flex-1 bg-stone-950/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Duración</p>
                                <p className="text-white font-bold text-lg">{existingBooking.duration_minutes || 60} min</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <DigitalCard
                            clientName={client.name}
                            token={client.id}
                            visits={client.visits || 0}
                            nextReward={5 - ((client.visits || 0) % 5)}
                            tier={client.tier || 'Bronce'}
                        />
                        <div className="mt-6 max-w-sm mx-auto">
                            <AddToWalletButtons />
                        </div>
                    </div>

                    <div className="text-center">
                        <Link to="/" className="inline-block text-sm text-stone-500 hover:text-white transition-colors border-b border-transparent hover:border-stone-500">
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SCREEN: Success (walk-in booked) ───
    if (step === 'success' && client && selectedService) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stone-900 to-stone-950 z-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-md w-full animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-4 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                            <CheckCircle size={40} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-serif text-white mb-2">¡Llegada Confirmada!</h2>
                        <p className="text-stone-400">
                            Bienvenida, <span className="text-amber-400 font-bold">{client.name}</span>. Tu hora ha sido agendada.
                        </p>
                    </div>

                    <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                <Scissors className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">{selectedService.name}</p>
                                <p className="text-stone-400 text-sm">Agendado automáticamente</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-stone-950/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Hora</p>
                                <p className="text-white font-bold text-lg">{formatTime(assignedTime)}</p>
                            </div>
                            <div className="flex-1 bg-stone-950/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Duración</p>
                                <p className="text-white font-bold text-lg">{selectedService.durationMin} min</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <DigitalCard
                            clientName={client.name}
                            token={client.id}
                            visits={client.visits || 0}
                            nextReward={5 - ((client.visits || 0) % 5)}
                            tier={client.tier || 'Bronce'}
                        />
                        <div className="mt-6 max-w-sm mx-auto">
                            <AddToWalletButtons />
                        </div>
                    </div>

                    <div className="text-center">
                        <Link to="/" className="inline-block text-sm text-stone-500 hover:text-white transition-colors border-b border-transparent hover:border-stone-500">
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SCREEN: Confirming (loading) ───
    if (step === 'confirming') {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stone-900 to-stone-950 z-0" />
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-white text-xl font-serif">Agendando tu hora...</p>
                    <p className="text-stone-500 text-sm mt-2">Buscando el mejor horario disponible</p>
                </div>
            </div>
        );
    }

    // ─── SCREEN: Select Service (walk-in) ───
    if (step === 'select-service' && client) {
        return (
            <div className="min-h-screen bg-stone-950 p-6 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                <div className="w-full max-w-md relative z-10 pt-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 shadow-xl mb-4">
                            <Scissors className="w-7 h-7 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">¿Qué servicio te realizarás?</h2>
                        <p className="text-stone-400 text-sm">
                            Hola <span className="text-amber-400 font-bold">{client.name}</span>, selecciona tu servicio para agendar tu hora.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm text-center flex items-center justify-center gap-2">
                            <span className="block w-2 h-2 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        {STYLE_SERVICES.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                disabled={loading}
                                className="w-full bg-stone-900/60 backdrop-blur-sm border border-stone-800 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-500/50 hover:bg-stone-900/80 transition-all group active:scale-[0.98] disabled:opacity-50"
                            >
                                <div className="w-11 h-11 rounded-xl bg-stone-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors shrink-0">
                                    <Scissors className="w-5 h-5 text-stone-400 group-hover:text-amber-400 transition-colors" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-white font-bold">{service.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-stone-500" />
                                        <span className="text-stone-500 text-xs">{service.durationMin} min aprox.</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-amber-400 transition-colors" />
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-stone-600 text-xs mt-8">
                        Tus3B Style &bull; Check-In &bull; v3.0
                    </p>
                </div>
            </div>
        );
    }

    // ─── SCREEN: Search / Register ───
    return (
        <div className="min-h-screen bg-stone-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
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
                                <div className="relative group flex items-center gap-2">
                                    <span className="bg-stone-900 border border-stone-800 text-stone-400 rounded-2xl px-4 py-5 font-mono text-xl">+569</span>
                                    <div className="relative w-full">
                                        <input
                                            type="tel"
                                            placeholder="12345678"
                                            value={phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                if (val.length <= 8) setPhone(val);
                                            }}
                                            className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-6 py-5 text-white placeholder-stone-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-2xl tracking-widest text-center shadow-inner font-mono group-hover:border-stone-700"
                                            autoFocus
                                            maxLength={8}
                                        />
                                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-white/5 pointer-events-none" />
                                    </div>
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
                                            value={'+569' + phone}
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
                    Tus3B Style &bull; Sistema de Lealtad &bull; v3.0
                </p>
            </div>
        </div>
    );
};

export default CheckInPage;
