import React, { useState, useEffect } from 'react';
import { BookingData } from '../types';
import { SERVICES, HOME_SERVICE_FEE, HOME_SERVICE_EXTRA_MINUTES, COVERAGE_AREAS, PHONE_NUMBER, EMAIL_ADDRESS } from '../constants';
import { Calendar as CalendarIcon, MapPin, Clock, CheckCircle, Smartphone, AlertCircle, Loader2, Info, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface BookingFormProps {
    onSuccess?: (data: BookingData) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSuccess }) => {
    const service = SERVICES[0];

    const [formData, setFormData] = useState<BookingData>({
        name: '',
        email: '',
        phone: '+569 ',
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
    const [existingBooking, setExistingBooking] = useState<any | null>(null);
    const [showModifyModal, setShowModifyModal] = useState(false);

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

    // Check for existing booking when Name and Phone are entered
    useEffect(() => {
        const checkExisting = () => {
            if (formData.name.length > 3 && formData.phone.length > 8) {
                // Try LocalStorage first (for Demo/MVP)
                const stored = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
                const found = stored.find((b: any) =>
                    b.phone.replace(/\s/g, '') === formData.phone.replace(/\s/g, '') &&
                    b.name.toLowerCase() === formData.name.toLowerCase()
                );

                if (found) {
                    setExistingBooking(found);
                    setShowModifyModal(true);
                }
            }
        };

        const timeoutId = setTimeout(checkExisting, 1000); // Debounce check
        return () => clearTimeout(timeoutId);
    }, [formData.name, formData.phone]);


    const fetchBookingsForDate = async (date: string) => {
        setFetchingSlots(true);
        try {
            let slots: { start: number, end: number }[] = [];

            // 1. Try Supabase
            if (supabase) {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('time, duration_minutes')
                    .eq('date', date);

                if (!error && data) {
                    slots = data.map((b: any) => {
                        const [hours, minutes] = b.time.split(':').map(Number);
                        const startMinutes = hours * 60 + minutes;
                        return { start: startMinutes, end: startMinutes + b.duration_minutes };
                    });
                }
            }

            // 2. Merge with LocalStorage (for Demo)
            const stored = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
            const localForDate = stored.filter((b: any) => b.date === date);
            const localSlots = localForDate.map((b: any) => {
                const [hours, minutes] = b.time.split(':').map(Number);
                const startMinutes = hours * 60 + minutes;
                // Provide default duration if missing in legacy data
                const duration = b.duration_minutes || 60;
                return { start: startMinutes, end: startMinutes + duration };
            });

            setBookedSlots([...slots, ...localSlots]);

        } catch (e) {
            console.warn("Error fetching slots", e);
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
        if (!formData.phone || formData.phone.trim() === '+569') newErrors.phone = 'El teléfono es obligatorio';
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

    const saveBooking = async () => {
        // 1. Save to LocalStorage (Always, for MVP/Demo redundancy)
        const stored = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
        const newBooking = {
            id: Date.now(),
            ...formData,
            duration_minutes: currentDuration,
            created_at: new Date().toISOString()
        };
        stored.push(newBooking);
        localStorage.setItem('mock_bookings', JSON.stringify(stored));

        // 2. Try Supabase (Real DB)
        if (supabase) {
            try {
                // A. Guardar/Actualizar Lead (Cliente)
                // Usamos 'phone' como identificador único para upsert
                const { error: leadError } = await supabase
                    .from('leads')
                    .upsert({
                        phone: formData.phone,
                        name: formData.name,
                        email: formData.email,
                        last_booking_date: formData.date,
                        // Incrementamos contador manualmente o dejamos que un trigger lo haga (simplificado aquí user update)
                    }, { onConflict: 'phone' });

                if (leadError) console.warn("Error saving lead:", leadError);

                // B. Guardar Reserva
                await supabase.from('bookings').insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    date: formData.date,
                    time: formData.time,
                    is_home_service: formData.isHomeService,
                    address: formData.address || null,
                    duration_minutes: currentDuration
                }]);

            } catch (err) {
                console.warn("Supabase save failed, relying on local:", err);
            }
        }
    };

    const deleteBooking = (bookingId: number) => {
        const stored = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
        const filtered = stored.filter((b: any) => b.id !== bookingId);
        localStorage.setItem('mock_bookings', JSON.stringify(filtered));
        // Note: We are not deleting from Supabase here as we don't have the ID reliably mapped without real keys
    };

    const handleConfirmModify = () => {
        if (existingBooking) {
            deleteBooking(existingBooking.id);
            setExistingBooking(null);
            setShowModifyModal(false);
            // User can now proceed to book normally
        }
    };

    const handleCancelModify = () => {
        setShowModifyModal(false);
        setFormData(prev => ({ ...prev, name: '', phone: '+569 ' })); // Reset fields to avoid loop
        alert(`Entendido. Tu cita anterior (${existingBooking.date} a las ${existingBooking.time}) se mantiene. ¡Gracias!`);
    };


    const handleBooking = async (method: 'whatsapp' | 'email') => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Save Data
        await saveBooking();

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

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);

        // Call success callback to close the form/change view
        if (onSuccess) {
            onSuccess(formData);
        }

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start fade-in pb-12 relative">

            {/* Modify Booking Modal Overly */}
            {showModifyModal && existingBooking && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm rounded-2xl animate-in fade-in zoom-in-95">
                    <div className="bg-white border border-stone-200 shadow-2xl p-8 rounded-2xl max-w-sm text-center">
                        <AlertCircle className="mx-auto text-amber-500 mb-4 h-12 w-12" />
                        <h3 className="serif text-2xl font-bold text-stone-900 mb-2">Ya tienes una reserva</h3>
                        <p className="text-stone-600 mb-6 text-sm">
                            Hemos encontrado una cita para <strong>{existingBooking.name}</strong> el día <strong>{existingBooking.date}</strong> a las <strong>{existingBooking.time}</strong>.
                        </p>
                        <p className="font-bold text-stone-900 mb-6 text-lg">¿Deseas cambiar tu reserva?</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleConfirmModify}
                                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-700 transition"
                            >
                                Sí, cambiar cita
                            </button>
                            <button
                                onClick={handleCancelModify}
                                className="w-full bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200 transition"
                            >
                                No, mantener la anterior
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        <span className="text-lg">{loading ? 'Procesando...' : 'Confirmar y Enviar WhatsApp'}</span>
                    </button>
                    <p className="text-xs text-center text-stone-400 mt-3 px-4">
                        Al confirmar, volverás al inicio y se abrirá WhatsApp.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default BookingForm;