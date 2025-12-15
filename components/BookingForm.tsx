import React, { useState, useEffect } from 'react';
import { BookingData } from '../types';
import { SERVICES, HOME_SERVICE_FEE, HOME_SERVICE_EXTRA_MINUTES, COVERAGE_AREAS, PHONE_NUMBER, EMAIL_ADDRESS } from '../constants';
import { Calendar as CalendarIcon, MapPin, Clock, CheckCircle, Smartphone, AlertCircle, Loader2, Info } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BookingForm: React.FC = () => {
    const service = SERVICES[0];

    const [formData, setFormData] = useState<BookingData>({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        isHomeService: false,
        address: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<{ start: number, end: number }[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Calculate duration: Base + 30 mins if home service
    const currentDuration = service.durationMin + (formData.isHomeService ? HOME_SERVICE_EXTRA_MINUTES : 0);
    const totalPrice = service.price + (formData.isHomeService ? HOME_SERVICE_FEE : 0);

    // Load bookings when date changes
    useEffect(() => {
        if (formData.date) {
            fetchBookingsForDate(formData.date);
        }
    }, [formData.date]);

    // Recalculate available slots when bookings, duration, or date changes
    useEffect(() => {
        if (formData.date) {
            calculateAvailableSlots();
        }
    }, [formData.date, bookedSlots, currentDuration]);

    const fetchBookingsForDate = async (date: string) => {
        setFetchingSlots(true);
        try {
            // Safe check for Supabase client
            if (!supabase) {
                // Demo Mode or No Config: Assume no bookings to allow testing the UI
                setBookedSlots([]);
                setFetchingSlots(false);
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select('time, duration_minutes')
                .eq('date', date);

            if (error) {
                console.warn('Supabase fetch error:', error.message);
                setBookedSlots([]);
            } else if (data) {
                const slots = data.map((b: any) => {
                    const [hours, minutes] = b.time.split(':').map(Number);
                    const startMinutes = hours * 60 + minutes;
                    return {
                        start: startMinutes,
                        end: startMinutes + b.duration_minutes
                    };
                });
                setBookedSlots(slots);
            }
        } catch (e) {
            console.warn("Supabase connection skipped or failed", e);
            setBookedSlots([]);
        } finally {
            setFetchingSlots(false);
        }
    };

    const calculateAvailableSlots = () => {
        // Working hours: 09:00 to 20:00
        const startHour = 9;
        const endHour = 20;
        const slots: string[] = [];

        // Generate slots every 30 minutes
        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                const timeInMinutes = h * 60 + m;
                const endTimeInMinutes = timeInMinutes + currentDuration;

                // Check if slot exceeds working hours
                if (endTimeInMinutes > endHour * 60) continue;

                // Check overlap
                const isOverlapping = bookedSlots.some(booked => {
                    return (
                        (timeInMinutes >= booked.start && timeInMinutes < booked.end) || // Starts inside existing
                        (endTimeInMinutes > booked.start && endTimeInMinutes <= booked.end) || // Ends inside existing
                        (timeInMinutes <= booked.start && endTimeInMinutes >= booked.end) // Encloses existing
                    );
                });

                if (!isOverlapping) {
                    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    slots.push(timeString);
                }
            }
        }
        setAvailableSlots(slots);

        // Clear selected time if it's no longer valid
        if (formData.time && !slots.includes(formData.time)) {
            setFormData(prev => ({ ...prev, time: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = 'El nombre es obligatorio';
        if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio';
        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El formato del email no es válido';
        }
        if (!formData.date) newErrors.date = 'Selecciona una fecha';
        if (!formData.time) newErrors.time = 'Selecciona una hora';
        if (formData.isHomeService && !formData.address) newErrors.address = 'La dirección es obligatoria para servicio a domicilio';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked; // Only for checkbox

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr[name];
                return newErr;
            });
        }
    };

    const handleTimeSelect = (time: string) => {
        setFormData(prev => ({ ...prev, time }));
        if (errors.time) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr.time;
                return newErr;
            });
        }
    };

    const saveBookingToSupabase = async () => {
        if (!supabase) return; // Skip if in Demo mode

        try {
            const { error } = await supabase.from('bookings').insert([
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    date: formData.date,
                    time: formData.time,
                    is_home_service: formData.isHomeService,
                    address: formData.address || null,
                    duration_minutes: currentDuration
                }
            ]);

            if (error) {
                console.error("Supabase Error:", error);
            }
        } catch (err) {
            console.warn("Could not save to Supabase:", err);
        }
    };

    const handleBooking = async (method: 'whatsapp' | 'email') => {
        if (!validateForm()) {
            const firstError = Object.values(errors)[0] || "Por favor completa los campos requeridos"; // Fallback message
            // Optionally scroll to top or show toast, but field errors are visible
            return;
        }

        setLoading(true);

        // Try to save to database but don't block WhatsApp if it fails
        await saveBookingToSupabase();

        const serviceName = `${service.name}${formData.isHomeService ? ' + Domicilio' : ' (En Studio)'}`;
        const formattedPrice = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice);

        const messageBody = `
Hola Tus3B Style, acabo de reservar en la web.
--------------------------------
*Cliente:* ${formData.name}
*Teléfono:* ${formData.phone}
*Servicio:* ${serviceName}
*Fecha:* ${formData.date}
*Hora:* ${formData.time}
*Duración:* ${currentDuration} min
${formData.isHomeService ? `*Dirección:* ${formData.address}` : ''}
*Total:* ${formattedPrice}
--------------------------------
Espero su confirmación final. Gracias.
    `.trim();

        // Small delay for UX feeling
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);

        if (method === 'whatsapp') {
            const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(messageBody)}`;
            window.open(url, '_blank');
        } else {
            const subject = `Reserva Confirmada - ${formData.name}`;
            const mailto = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
            window.location.href = mailto;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start fade-in pb-12">

            {/* Col 1: Service Info & Personal Data */}
            <div className="space-y-6">

                {/* Service Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden">

                    {/* Demo Mode Badge */}
                    {!supabase && (
                        <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                            <Info size={12} /> MODO DEMO
                        </div>
                    )}

                    <h3 className="serif text-2xl text-stone-900 mb-2">{service.name}</h3>
                    <p className="text-stone-500 font-light text-sm mb-4">{service.description}</p>

                    <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl mb-4">
                        <div>
                            <span className="block text-2xl font-semibold text-stone-900">
                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice)}
                            </span>
                            <span className="text-xs text-stone-500 uppercase tracking-wide">Precio Estimado</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-lg font-medium text-stone-900">{currentDuration} min</span>
                            <span className="text-xs text-stone-500 uppercase tracking-wide">Duración</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-start bg-blue-50/50 p-3 rounded-lg border border-blue-100 relative">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="isHomeService"
                                    name="isHomeService"
                                    type="checkbox"
                                    checked={formData.isHomeService}
                                    onChange={handleChange}
                                    className="focus:ring-stone-500 h-5 w-5 text-stone-900 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="isHomeService" className="font-bold text-stone-900 cursor-pointer">
                                    ¿Servicio a Domicilio? (+ $3.000)
                                </label>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                    Vamos a tu casa en {COVERAGE_AREAS.join(', ')}. <br />
                                    <span className="text-blue-600 font-medium">Incluye +30 min de tiempo de traslado/montaje.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 font-bold mt-6">Incluye</h4>
                    <ul className="space-y-2">
                        {service.includes.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm text-stone-700">
                                <CheckCircle size={14} className="text-stone-900 mr-2" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Personal Data Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="serif text-xl text-stone-900 mb-4 flex items-center gap-2">
                        <span className="bg-stone-900 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-sans">1</span>
                        Tus Datos
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre y Apellido</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg bg-stone-50 border ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'} focus:ring-1 outline-none transition-all`}
                                placeholder="Ej: María Pérez"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg bg-stone-50 border ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'} focus:ring-1 outline-none transition-all`}
                                    placeholder="+569..."
                                    inputMode="numeric"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg bg-stone-50 border ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'} focus:ring-1 outline-none transition-all`}
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        {formData.isHomeService && (
                            <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Dirección (Comuna y Calle)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg bg-amber-50 border ${errors.address ? 'border-red-300 focus:border-red-500' : 'border-amber-200 focus:border-amber-500'} focus:ring-1 pl-10 outline-none transition-all`}
                                        placeholder="Av. Irarrázaval 1234, Ñuñoa"
                                    />
                                    <MapPin size={18} className="absolute left-3 top-3.5 text-amber-500" />
                                </div>
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Col 2: Calendar & Confirmation */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="serif text-xl text-stone-900 mb-4 flex items-center gap-2">
                        <span className="bg-stone-900 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-sans">2</span>
                        Fecha y Hora
                    </h3>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Selecciona un día</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.date}
                                onChange={handleChange}
                                className={`w-full px-4 py-4 rounded-xl bg-stone-50 border ${errors.date ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'} text-lg font-medium shadow-sm outline-none`}
                            />
                            <CalendarIcon size={20} className="absolute right-4 top-4.5 text-stone-400 pointer-events-none" />
                        </div>
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>

                    {formData.date && (
                        <div className="animate-in fade-in">
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-3 flex justify-between">
                                <span>Horas Disponibles</span>
                                {fetchingSlots && <span className="flex items-center text-stone-400"><Loader2 size={12} className="animate-spin mr-1" /> Buscando...</span>}
                            </label>

                            {availableSlots.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-3">
                                        {availableSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => handleTimeSelect(time)}
                                                className={`py-3 px-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 ${formData.time === time
                                                        ? 'bg-stone-900 text-white shadow-md scale-105 ring-2 ring-offset-2 ring-stone-900'
                                                        : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-900 hover:bg-stone-50'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.time && <p className="text-red-500 text-xs mt-2 text-center bg-red-50 p-2 rounded">{errors.time}</p>}
                                </>
                            ) : (
                                <div className="bg-stone-50 p-4 rounded-lg text-center text-stone-500 text-sm">
                                    {!fetchingSlots ? "No hay horas disponibles para este día. Intenta otra fecha." : "Cargando..."}
                                </div>
                            )}
                        </div>
                    )}

                    {!formData.date && (
                        <div className="text-center py-8 text-stone-400 text-sm italic">
                            <Clock size={32} className="mx-auto mb-2 opacity-20" />
                            Selecciona una fecha para ver disponibilidad
                        </div>
                    )}
                </div>

                {/* Confirmation Actions */}
                <div className="pt-2 sticky bottom-4 z-10">
                    <button
                        onClick={() => handleBooking('whatsapp')}
                        disabled={loading}
                        className="w-full flex justify-center items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Smartphone size={22} />}
                        <span className="text-lg">{loading ? 'Procesando...' : 'Confirmar Reserva'}</span>
                    </button>
                    <p className="text-xs text-center text-stone-400 mt-3 px-4">
                        Al confirmar, tus datos quedarán registrados y se abrirá WhatsApp para finalizar el contacto directo.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default BookingForm;