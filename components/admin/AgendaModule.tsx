import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ChevronLeft, ChevronRight, X, Calendar, Edit2, Trash2, Lock } from 'lucide-react';

const AgendaModule: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [weekStart, setWeekStart] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ date: string, time: string } | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Manual Booking Form State
    const [manualBookingName, setManualBookingName] = useState('');
    const [manualBookingPhone, setManualBookingPhone] = useState('');
    const [manualBookingService, setManualBookingService] = useState('Corte');
    const [manualBookingType, setManualBookingType] = useState<'salon' | 'domicilio' | 'bloqueo'>('salon');
    const [loading, setLoading] = useState(false);

    // Quick Block State
    const [isQuickBlockMode, setIsQuickBlockMode] = useState(false);
    const [quickBlockStart, setQuickBlockStart] = useState<string>('9:00');
    const [quickBlockEnd, setQuickBlockEnd] = useState<string>('21:00');
    const [quickBlockDate, setQuickBlockDate] = useState<string>('');

    useEffect(() => {
        fetchBookings();
    }, [weekStart]);

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) console.error('Error fetching bookings:', error);
        else setBookings(data || []);
        setLoading(false);
    };

    const getWeekDays = (start: Date) => {
        const days = [];
        // Adjust to Monday
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(start);
        monday.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(weekStart);
    const HOURS = Array.from({ length: 13 }, (_, i) => `${i + 9}:00`); // 9:00 to 21:00

    const handlePrevWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(weekStart.getDate() - 7);
        setWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(weekStart.getDate() + 7);
        setWeekStart(newDate);
    };

    const handleSlotClick = (dateStr: string, time: string) => {
        // Check if occupied
        const booking = bookings.find(b => b.date === dateStr && b.time === time);
        if (booking) {
            if (window.confirm(`¿${booking.name === 'BLOQUEADO' ? 'Desbloquear' : 'Eliminar reserva de ' + booking.name}?`)) {
                deleteBooking(booking.id);
            }
        } else {
            // Open Modal
            setSelectedSlot({ date: dateStr, time });
            setManualBookingType('salon'); // Reset
            setManualBookingName('');
            setManualBookingPhone('');
            setIsBookingModalOpen(true);
        }
    };

    const saveBooking = async () => {
        if (!selectedSlot) return;

        const isBlock = manualBookingType === 'bloqueo';
        const name = isBlock ? 'BLOQUEADO' : manualBookingName;

        if (!name && !isBlock) return alert("Ingrese nombre");

        try {
            const { error } = await supabase.from('bookings').insert({
                date: selectedSlot.date,
                time: selectedSlot.time,
                name: name,
                phone: manualBookingPhone || '00000000',
                email: 'manual@admin.com',
                service_id: isBlock ? 'block' : 'manual',
                service_name: isBlock ? 'Bloqueo' : manualBookingService,
                is_home_service: manualBookingType === 'domicilio',
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            alert(isBlock ? "Bloqueo registrado" : "Reserva creada");
            setIsBookingModalOpen(false);
            fetchBookings();
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const deleteBooking = async (id: string) => {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (!error) fetchBookings();
    };

    // Quick Block Functions
    const quickBlockDay = async (dateStr: string) => {
        if (!window.confirm(`¿Bloquear todo el día ${dateStr}?`)) return;
        setLoading(true);
        const blocks = HOURS.map(time => ({
            date: dateStr,
            time: time,
            name: 'BLOQUEADO',
            phone: '00000000',
            email: 'block@admin.com',
            service_id: 'block',
            service_name: 'Bloqueo',
            is_home_service: false,
            created_at: new Date().toISOString()
        }));

        // Filter out already booked slots
        const existingSlots = bookings.filter(b => b.date === dateStr).map(b => b.time);
        const newBlocks = blocks.filter(b => !existingSlots.includes(b.time));

        if (newBlocks.length > 0) {
            const { error } = await supabase.from('bookings').insert(newBlocks);
            if (error) alert('Error: ' + error.message);
            else fetchBookings();
        }
        setLoading(false);
    };

    const quickBlockRange = async () => {
        if (!quickBlockDate) return alert('Selecciona una fecha');
        const startIdx = HOURS.indexOf(quickBlockStart);
        const endIdx = HOURS.indexOf(quickBlockEnd);
        if (startIdx > endIdx) return alert('Hora inicio debe ser menor que fin');

        const hoursToBlock = HOURS.slice(startIdx, endIdx + 1);
        const existingSlots = bookings.filter(b => b.date === quickBlockDate).map(b => b.time);

        const blocks = hoursToBlock
            .filter(time => !existingSlots.includes(time))
            .map(time => ({
                date: quickBlockDate,
                time: time,
                name: 'BLOQUEADO',
                phone: '00000000',
                email: 'block@admin.com',
                service_id: 'block',
                service_name: 'Bloqueo',
                is_home_service: false,
                created_at: new Date().toISOString()
            }));

        if (blocks.length === 0) return alert('Todos esos horarios ya están ocupados');

        setLoading(true);
        const { error } = await supabase.from('bookings').insert(blocks);
        if (error) alert('Error: ' + error.message);
        else {
            alert(`${blocks.length} horarios bloqueados`);
            setIsQuickBlockMode(false);
            fetchBookings();
        }
        setLoading(false);
    };

    const unblockDay = async (dateStr: string) => {
        if (!window.confirm(`¿Desbloquear todo el día ${dateStr}?`)) return;
        setLoading(true);
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('date', dateStr)
            .eq('name', 'BLOQUEADO');
        if (!error) fetchBookings();
        setLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar /> Agenda Semanal
                    </h3>
                    <div className="flex items-center bg-stone-100 rounded-lg p-1">
                        <button onClick={handlePrevWeek} className="p-1 hover:bg-stone-200 rounded"><ChevronLeft size={20} /></button>
                        <span className="px-3 font-mono text-sm font-bold">
                            {weekDays[0].getDate()}/{weekDays[0].getMonth() + 1} - {weekDays[6].getDate()}/{weekDays[6].getMonth() + 1}
                        </span>
                        <button onClick={handleNextWeek} className="p-1 hover:bg-stone-200 rounded"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="flex gap-2 text-xs items-center">
                    <button
                        onClick={() => setIsQuickBlockMode(!isQuickBlockMode)}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition ${isQuickBlockMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    >
                        <Lock size={14} /> {isQuickBlockMode ? 'Cerrar' : 'Bloqueo Rápido'}
                    </button>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div> Salón</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Domicilio</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div> Bloqueado</div>
                </div>
            </div>

            {/* Quick Block Panel */}
            {isQuickBlockMode && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-in slide-in-from-top duration-200">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-xs text-red-600 font-bold block mb-1">Fecha</label>
                            <select
                                value={quickBlockDate}
                                onChange={e => setQuickBlockDate(e.target.value)}
                                className="border border-red-300 rounded px-2 py-1 text-sm"
                            >
                                <option value="">Seleccionar...</option>
                                {weekDays.map(d => (
                                    <option key={d.toISOString()} value={d.toISOString().split('T')[0]}>
                                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]} {d.getDate()}/{d.getMonth() + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-red-600 font-bold block mb-1">Desde</label>
                            <select
                                value={quickBlockStart}
                                onChange={e => setQuickBlockStart(e.target.value)}
                                className="border border-red-300 rounded px-2 py-1 text-sm"
                            >
                                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-red-600 font-bold block mb-1">Hasta</label>
                            <select
                                value={quickBlockEnd}
                                onChange={e => setQuickBlockEnd(e.target.value)}
                                className="border border-red-300 rounded px-2 py-1 text-sm"
                            >
                                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={quickBlockRange}
                            disabled={loading || !quickBlockDate}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded font-bold text-sm disabled:opacity-50"
                        >
                            {loading ? 'Bloqueando...' : 'Bloquear Rango'}
                        </button>
                        <div className="border-l border-red-300 pl-4 ml-2">
                            <span className="text-xs text-red-600 mr-2">Día completo:</span>
                            {weekDays.map(d => {
                                const dateStr = d.toISOString().split('T')[0];
                                const hasBlocks = bookings.some(b => b.date === dateStr && b.name === 'BLOQUEADO');
                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => hasBlocks ? unblockDay(dateStr) : quickBlockDay(dateStr)}
                                        className={`px-2 py-0.5 mx-0.5 rounded text-xs font-bold ${hasBlocks ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                        title={hasBlocks ? 'Desbloquear día' : 'Bloquear día'}
                                    >
                                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()]}{d.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="flex-1 overflow-auto border border-stone-200 rounded-lg">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                        <div className="p-2 text-center text-stone-500 font-bold text-xs border-r border-stone-200">Hora</div>
                        {weekDays.map((day, i) => (
                            <div key={i} className={`p-2 text-center border-r border-stone-200 ${day.toDateString() === new Date().toDateString() ? 'bg-amber-50' : ''}`}>
                                <div className="text-stone-500 text-[10px] uppercase">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.getDay()]}</div>
                                <div className="font-bold text-stone-900">{day.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time Rows */}
                    {HOURS.map(time => (
                        <div key={time} className="grid grid-cols-8 border-b border-stone-100 hover:bg-stone-50/50">
                            <div className="p-2 text-center text-stone-400 text-xs font-mono border-r border-stone-100">
                                {time}
                            </div>
                            {weekDays.map((day, i) => {
                                const dateStr = day.toISOString().split('T')[0];
                                const booking = bookings.find(b => b.date === dateStr && b.time === time);

                                let cellClass = "cursor-pointer hover:bg-stone-100 transition p-1 border-r border-stone-100 min-h-[50px]";
                                let content = null;

                                if (booking) {
                                    if (booking.name === 'BLOQUEADO') {
                                        cellClass += " bg-red-100 hover:bg-red-200 border-red-200";
                                        content = <div className="flex justify-center items-center h-full text-red-400"><Lock size={16} /></div>;
                                    } else {
                                        cellClass += booking.is_home_service ? " bg-blue-100 hover:bg-blue-200 border-blue-200" : " bg-purple-100 hover:bg-purple-200 border-purple-200";
                                        content = (
                                            <div className="text-[10px] leading-tight p-1 h-full overflow-hidden">
                                                <div className="font-bold truncate">{booking.name}</div>
                                                <div className="text-stone-500 truncate">{booking.service_name}</div>
                                            </div>
                                        );
                                    }
                                }

                                return (
                                    <div key={`${dateStr}-${time}`} className={cellClass} onClick={() => handleSlotClick(dateStr, time)}>
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && selectedSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {selectedSlot.date} - {selectedSlot.time}
                            </h3>
                            <button onClick={() => setIsBookingModalOpen(false)}><X className="text-stone-400 hover:text-stone-600" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setManualBookingType('salon')}
                                    className={`p-2 rounded border text-sm font-bold ${manualBookingType === 'salon' ? 'bg-purple-600 text-white border-purple-600' : 'border-stone-200 text-stone-500'}`}
                                >Salón</button>
                                <button
                                    onClick={() => setManualBookingType('domicilio')}
                                    className={`p-2 rounded border text-sm font-bold ${manualBookingType === 'domicilio' ? 'bg-blue-600 text-white border-blue-600' : 'border-stone-200 text-stone-500'}`}
                                >Domicilio</button>
                                <button
                                    onClick={() => setManualBookingType('bloqueo')}
                                    className={`p-2 rounded border text-sm font-bold ${manualBookingType === 'bloqueo' ? 'bg-red-600 text-white border-red-600' : 'border-stone-200 text-stone-500'}`}
                                >Bloquear</button>
                            </div>

                            {manualBookingType !== 'bloqueo' && (
                                <>
                                    <input
                                        className="w-full border border-stone-300 rounded-lg p-2 text-sm"
                                        placeholder="Nombre Cliente"
                                        value={manualBookingName}
                                        onChange={e => setManualBookingName(e.target.value)}
                                        autoFocus
                                    />
                                    <input
                                        className="w-full border border-stone-300 rounded-lg p-2 text-sm"
                                        placeholder="Teléfono (Opcional)"
                                        value={manualBookingPhone}
                                        onChange={e => setManualBookingPhone(e.target.value)}
                                    />
                                    <select
                                        className="w-full border border-stone-300 rounded-lg p-2 text-sm"
                                        value={manualBookingService}
                                        onChange={e => setManualBookingService(e.target.value)}
                                    >
                                        <option value="Corte">Corte</option>
                                        <option value="Color">Color</option>
                                        <option value="Efecto">Efecto</option>
                                        <option value="Alisado">Alisado</option>
                                        <option value="Masaje">Masaje</option>
                                    </select>
                                </>
                            )}

                            <button
                                onClick={saveBooking}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg mt-2 ${manualBookingType === 'bloqueo' ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-900 hover:bg-stone-800'}`}
                            >
                                {manualBookingType === 'bloqueo' ? 'Bloquear Horario' : 'Guardar Reserva'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaModule;
