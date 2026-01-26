import React, { useState, useEffect } from 'react';
import { Shield, Search, QrCode, X, Scissors, PlusCircle, Save } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { classifyExpenseStatic } from '../../services/staticChatService';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { PERFUMES } from '../../constants';

interface ServicePanelProps {
    onLogout: () => void;
}

const InventoryRow: React.FC<{ perfume: any, onSell: (amount: number, desc: string) => void }> = ({ perfume, onSell }) => {
    const [stock, setStock] = useState<number | null>(null);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        const { data } = await supabase.from('inventory').select('quantity').eq('product_id', perfume.id).single();
        if (data) setStock(data.quantity);
        else setStock(perfume.stock ? 5 : 0); // Fallback
    };

    const handleSell = async () => {
        if (!window.confirm(`¿Confirmar venta de ${perfume.name}?`)) return;

        // 1. Decrement Stock using centralized RPC
        const { data, error } = await supabase.rpc('adjust_inventory', {
            p_product_id: perfume.id,
            p_delta: -1,
            p_reason: 'sale'
        });

        if (error) {
            alert('Error: ' + error.message);
        } else if (data.success) {
            setStock(data.new_quantity);
            // 2. Record Transaction
            onSell(perfume.price10ml, `Venta: ${perfume.name}`);
            alert('Venta exitosa. Nuevo stock: ' + data.new_quantity);
        } else {
            alert('Error: ' + data.message);
        }
    };

    return (
        <tr className="border-b border-stone-700 hover:bg-stone-700/20">
            <td className="px-3 py-2 font-medium text-white">{perfume.name}</td>
            <td className="px-3 py-2 text-center">
                <span className={`px-2 py-1 rounded text-xs font-bold ${stock !== null && stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stock !== null ? stock : '...'}
                </span>
            </td>
            <td className="px-3 py-2 text-center text-green-400">${perfume.price10ml.toLocaleString()}</td>
            <td className="px-3 py-2 text-right">
                <button
                    onClick={handleSell}
                    disabled={stock !== null && stock <= 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-stone-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-bold shadow-lg"
                >
                    Vender
                </button>
            </td>
        </tr>
    );
};

const ServicePanel: React.FC<ServicePanelProps> = ({ onLogout }) => {
    // Auth state removed, passed as prop
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [scannerActive, setScannerActive] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);

    // Hair Service State
    const [activeTab, setActiveTab] = useState<'loyalty' | 'hair' | 'inventory' | 'agenda' | 'clients' | 'expenses'>('loyalty');
    const [serviceType, setServiceType] = useState('Corte');
    const [servicePrice, setServicePrice] = useState('7000');
    const [visitAmount, setVisitAmount] = useState('0'); // New: Amount for loyalty visits
    const [bookings, setBookings] = useState<any[]>([]); // New: Agendas

    const [client, setClient] = useState<any>(null);

    useEffect(() => {
        if (activeTab === 'agenda') {
            fetchBookings();
        }
    }, [activeTab]);

    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Expenses State
    const [expenses, setExpenses] = useState<any[]>([]);
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expensesLoading, setExpensesLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'agenda') {
            fetchBookings();
        } else if (activeTab === 'clients') {
            fetchClients();
        } else if (activeTab === 'expenses') {
            fetchExpenses();
        }
    }, [activeTab]);

    const fetchExpenses = async () => {
        const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
        if (error) console.error('Error fetching expenses:', error);
        else setExpenses(data || []);
    };

    const handleAddExpense = async () => {
        if (!expenseDesc || !expenseAmount) {
            alert("Ingrese descripción y monto");
            return;
        }

        setExpensesLoading(true);
        try {
            // 1. Auto Classify
            const category = classifyExpenseStatic(expenseDesc);

            // 2. Save
            const { error } = await supabase.from('expenses').insert({
                description: expenseDesc,
                amount: parseInt(expenseAmount),
                category: category,
                date: new Date()
            });

            if (error) throw error;

            alert(`Gasto registrado como: ${category}`);
            setExpenseDesc('');
            setExpenseAmount('');
            fetchExpenses();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setExpensesLoading(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!window.confirm("¿Eliminar este gasto?")) return;
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) fetchExpenses();
    };

    const fetchBookings = async () => {
        const today = new Date().toISOString().split('T')[0];
        // Fetch bookings from today onwards
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .gte('date', today)
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) console.error('Error fetching bookings:', error);
        else setBookings(data || []);
    };

    const fetchClients = async () => {
        let query = supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(50);

        if (searchTerm) {
            query = query.ilike('phone', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching clients:', error);
        else setClients(data || []);
    };

    useEffect(() => {
        if (activeTab === 'clients') {
            const delayDebounceFn = setTimeout(() => {
                fetchClients();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTerm]);

    const handleDeleteClient = async (id: string, phone: string) => {
        if (!window.confirm(`¿ESTÁS SEGURO? Esto eliminará al cliente ${phone} y todo su historial. Esta acción no se puede deshacer.`)) return;

        // Verify cascading deletes or manually delete related
        // Assuming cascade is NOT reliable without checking schema, let's try direct delete. 
        // If it fails due to FK, we'd need to delete children first.
        // But for "User Request: simple delete", let's try standard delete and catch error.

        const { error } = await supabase.from('clients').delete().eq('id', id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Cliente eliminado correctamente.');
            fetchClients();
        }
    };

    useEffect(() => {
        if (scannerActive && !scanResult) {
            const html5QrCode = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanFailure
            ).catch(err => {
                console.error("Error starting scanner:", err);
                setMessage("Error iniciando cámara: " + err);
            });

            return () => {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
            };
        }
    }, [scannerActive, scanResult]);

    const recordTransaction = async (clientId: string, amount: number, type: string, description: string) => {
        if (amount <= 0) return;
        const { error } = await supabase.from('transactions').insert({
            client_id: clientId,
            amount: amount,
            type: type,
            description: description
        });
        if (error) console.error("Error recording transaction:", error);
    };

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (scanResult) return;
        setScanResult(decodedText);
        setScannerActive(false);

        try {
            setMessage("Procesando...");
            // 1. Register Visit
            const { data, error } = await supabase.rpc('register_visit', { token_input: decodedText });

            if (error) throw error;

            if (data.success) {
                setMessage('OK: ' + data.message + ' Visitas: ' + data.new_visits);

                // 2. Record Transaction if Hair Service
                if (activeTab === 'hair') {
                    const price = parseInt(servicePrice) || 0;
                    // Need client ID to record transaction linked to client. 
                    // register_visit might not return ID directly in all versions, let's fetch client.
                    const { data: clientData } = await supabase.from('clients').select('id').eq('member_token', decodedText).single();
                    if (clientData) {
                        await recordTransaction(clientData.id, price, 'service', `Servicio: ${serviceType}`);
                    }
                }
            } else {
                setMessage('Error: ' + data.message);
            }

            setTimeout(() => {
                setScanResult(null);
                setMessage('');
            }, 4000);

        } catch (err) {
            console.error(err);
            setMessage("Error al procesar el código.");
            setScanResult(null);
        }
    };

    const onScanFailure = (error: any) => {
        console.warn(error);
    };

    const handleRedeemDiscount = async () => {
        if (!client) return;
        if (!window.confirm('¿Confirmar canje del 10% de Descuento?')) return;

        const { data, error } = await supabase.rpc('redeem_discount_5th', { token_input: client.member_token });
        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage(data.message);
            if (data.success) {
                const { data: updated } = await supabase.from('clients').select('*').eq('id', client.id).single();
                setClient(updated);
            }
        }
    };

    const handleRedeemFreeCut = async () => {
        if (!client) return;
        if (!window.confirm('¿Confirmar canje del Corte Gratis?')) return;

        const { data, error } = await supabase.rpc('redeem_free_cut', { token_input: client.member_token });
        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage(data.message);
            if (data.success) {
                const { data: updated } = await supabase.from('clients').select('*').eq('id', client.id).single();
                setClient(updated);
            }
        }
    };

    const handleAddVisit = async () => {
        if (phone.length < 8) {
            alert("Ingrese un número válido (ej: +569...)");
            return;
        }

        try {
            setMessage("Procesando...");

            if (activeTab === 'hair') {
                // Use new specific RPC for Hair Service Manual Entry
                const price = parseInt(servicePrice) || 0;
                const { data, error } = await supabase.rpc('add_hair_service_by_phone', {
                    phone_input: phone,
                    service_type: serviceType,
                    service_price: price,
                    notes_input: 'Ingreso Manual desde Admin'
                });

                if (error) throw error;

                if (data.success) {
                    setMessage(`✅ Servicio registrado. Total: ${data.new_total_services}. ${data.discount_5th_unlocked ? '¡DESCUENTO 10% DESBLOQUEADO!' : ''} ${data.free_cut_unlocked ? '¡CORTE GRATIS DESBLOQUEADO!' : ''}`);
                    setPhone('');
                } else {
                    setMessage('Error: ' + data.message);
                }

            } else {
                // Legacy / Generic Visits Logic
                const { data: existingClient, error: fetchError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('phone', phone)
                    .single();

                // If not found, create new (simple logic for now, or rely on upsert)
                let currentVisits = 0;
                if (existingClient) currentVisits = existingClient.visits;

                const newVisits = currentVisits + 1;

                const { data: upsertData, error: upsertError } = await supabase
                    .from('clients')
                    .upsert({
                        phone: phone,
                        visits: newVisits,
                        last_visit: new Date().toISOString()
                    }, { onConflict: 'phone' })
                    .select()
                    .single();

                if (upsertError) throw upsertError;

                // Record Transaction
                const amount = (parseInt(visitAmount) || 0);
                await recordTransaction(upsertData.id, amount, 'service', 'Manual: Visita');

                setMessage('Visita registrada para ' + phone + '. Total: ' + newVisits);
                setPhone('');
            }

        } catch (err: any) {
            console.error(err);
            setMessage("Error: " + (err.message || "Error desconocido"));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 py-12">
            <h2 className="text-3xl serif text-stone-900 mb-8 border-b pb-4 flex justify-between items-center">
                <span>Panel de Atención</span>
                <button onClick={onLogout} className="text-sm bg-stone-200 px-3 py-1 rounded hover:bg-stone-300 transition">Salir</button>
            </h2>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-8">
                <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <PlusCircle className="text-green-600" />
                    Registrar Visita Manual
                </h3>
                <p className="text-sm text-stone-500 mb-6">
                    Ingrese número y monto para registrar.
                </p>

                <div className="flex gap-4 mb-4 flex-wrap">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+569..."
                        className="flex-1 min-w-[150px] px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-600 outline-none"
                    />
                    {activeTab === 'loyalty' && (
                        <input
                            type="number"
                            value={visitAmount}
                            onChange={(e) => setVisitAmount(e.target.value)}
                            placeholder="Monto ($)"
                            className="w-32 px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-600 outline-none"
                        />
                    )}
                    <button
                        onClick={handleAddVisit}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Save size={18} />
                        Registrar
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-stone-800 p-1 rounded-xl inline-flex">
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'loyalty' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'}`}
                        >
                            Visitas
                        </button>
                        <button
                            onClick={() => setActiveTab('hair')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'hair' ? 'bg-purple-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Peluquería
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Inventario
                        </button>
                        <button
                            onClick={() => setActiveTab('agenda')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'agenda' ? 'bg-pink-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Agenda
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'clients' ? 'bg-red-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Clientes
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'expenses' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Compras
                        </button>
                    </div>
                </div>

                <div className="bg-stone-800 p-6 rounded-2xl shadow-xl border border-white/5">
                    <h3 className="serif text-xl mb-4 text-center text-white">
                        {activeTab === 'loyalty' ? 'Registrar Visita' : activeTab === 'hair' ? 'Registrar Servicio Peluquería' : activeTab === 'inventory' ? 'Gestión de Inventario' : activeTab === 'clients' ? 'Gestión de Clientes' : activeTab === 'expenses' ? 'Control de Inversión y Compras' : 'Agenda Semanal'}
                    </h3>

                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            {/* Input Form */}
                            <div className="bg-stone-700/50 p-4 rounded-xl space-y-3">
                                <h4 className="text-white font-bold text-sm">Registrar Nueva Compra</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={expenseDesc}
                                        onChange={(e) => setExpenseDesc(e.target.value)}
                                        placeholder="Descripción (ej: Tijeras, Sillas...)"
                                        className="flex-1 bg-stone-900 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        placeholder="Monto"
                                        className="w-24 bg-stone-900 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    />
                                    <button
                                        onClick={handleAddExpense}
                                        disabled={expensesLoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-sm disabled:opacity-50"
                                    >
                                        {expensesLoading ? '...' : 'Guardar'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-400 italic">* La categoría se asigna automáticamente con IA.</p>
                            </div>

                            {/* Investment Summary */}
                            <div className="grid grid-cols-2 gap-3">
                                {['Materiales', 'Herramientas', 'Mobiliario', 'Insumos Recepción', 'Otros'].map(cat => { // Explicit order
                                    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
                                    return (
                                        <div key={cat} className="bg-stone-900 p-3 rounded-lg border border-white/5">
                                            <div className="text-stone-400 text-[10px] uppercase font-bold">{cat}</div>
                                            <div className="text-emerald-400 font-mono text-lg font-bold">${total.toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                                <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-500/30 col-span-2">
                                    <div className="text-emerald-200 text-xs uppercase font-bold">Inversión Total</div>
                                    <div className="text-white font-mono text-2xl font-bold">
                                        ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Recent List */}
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-xs text-left text-stone-300">
                                    <thead className="sticky top-0 bg-stone-800">
                                        <tr className="text-stone-500 border-b border-stone-700">
                                            <th className="pb-2">Desc</th>
                                            <th className="pb-2">Cat</th>
                                            <th className="pb-2 text-right">Monto</th>
                                            <th className="pb-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-700">
                                        {expenses.map(e => (
                                            <tr key={e.id}>
                                                <td className="py-2">{e.description}</td>
                                                <td className="py-2"><span className="bg-stone-700 px-1 rounded text-[10px]">{e.category}</span></td>
                                                <td className="py-2 text-right text-emerald-400">${e.amount.toLocaleString()}</td>
                                                <td className="py-2 text-right">
                                                    <button onClick={() => handleDeleteExpense(e.id)} className="text-red-500 hover:text-red-400"><X size={12} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Buscar por teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-stone-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-xs text-left text-stone-300">
                                    <thead className="text-xs text-stone-400 uppercase bg-stone-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2">Teléfono</th>
                                            <th className="px-3 py-2 text-center">Visitas</th>
                                            <th className="px-3 py-2 text-center">Peluquería</th>
                                            <th className="px-3 py-2 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((c) => (
                                            <tr key={c.id} className="border-b border-stone-700 hover:bg-stone-700/20">
                                                <td className="px-3 py-2 text-white font-mono">{c.phone}</td>
                                                <td className="px-3 py-2 text-center">{c.visits}</td>
                                                <td className="px-3 py-2 text-center text-purple-400 font-bold">{c.hair_service_count || 0}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <button
                                                        onClick={() => handleDeleteClient(c.id, c.phone)}
                                                        className="bg-red-600/20 hover:bg-red-600 hover:text-white text-red-500 p-1.5 rounded transition"
                                                        title="Eliminar Cliente"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clients.length === 0 && <p className="text-center text-stone-500 py-4">No se encontraron clientes.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-stone-300">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-700/50">
                                    <tr>
                                        <th className="px-3 py-2">Perfume</th>
                                        <th className="px-3 py-2 text-center">Stock</th>
                                        <th className="px-3 py-2 text-center">Precio 10ml</th>
                                        <th className="px-3 py-2 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERFUMES.map((p) => {
                                        // We need to fetch real stock here as well, but for now we might rely on a unified fetch or just prop drilling?
                                        // For simplicity in this component, let's fetch inventory once on load
                                        return (
                                            <InventoryRow key={p.id} perfume={p} onSell={(amount, desc) => recordTransaction(client?.id || 'anon', amount, 'product', desc)} />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'agenda' && (
                        <div className="overflow-x-auto">
                            {bookings.length === 0 ? (
                                <p className="text-center text-stone-400 py-8">No hay horas agendadas próximas.</p>
                            ) : (
                                <table className="w-full text-xs text-left text-stone-300">
                                    <thead className="text-xs text-stone-400 uppercase bg-stone-700/50">
                                        <tr>
                                            <th className="px-3 py-2">Fecha/Hora</th>
                                            <th className="px-3 py-2">Cliente</th>
                                            <th className="px-3 py-2">Servicio</th>
                                            <th className="px-3 py-2">Contacto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.id} className="border-b border-stone-700 hover:bg-stone-700/20">
                                                <td className="px-3 py-2">
                                                    <div className="font-bold text-white">{b.date}</div>
                                                    <div className="text-amber-400">{b.time}</div>
                                                </td>
                                                <td className="px-3 py-2 font-medium text-white">{b.name}</td>
                                                <td className="px-3 py-2">
                                                    {b.is_home_service ? (
                                                        <span className="text-blue-400 flex items-center gap-1"><span className="text-[10px]">🏠</span> Domicilio</span>
                                                    ) : (
                                                        <span className="text-purple-400">Salon</span>
                                                    )}
                                                    {b.address && <div className="text-[10px] text-stone-500 truncate max-w-[100px]">{b.address}</div>}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <a href={`https://wa.me/${b.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline flex items-center gap-1">
                                                        {b.phone}
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'hair' && (
                        <div className="mb-4 space-y-3">
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="Corte">Corte ($7.000+)</option>
                                <option value="Lavado">Lavado ($5.000)</option>
                                <option value="Tintura">Tintura ($10.000+)</option>
                                <option value="Masaje">Masaje ($5.000)</option>
                            </select>
                            <input
                                type="number"
                                value={servicePrice}
                                onChange={(e) => setServicePrice(e.target.value)}
                                placeholder="Precio Real"
                                className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    )}

                    {activeTab !== 'inventory' && activeTab !== 'clients' && activeTab !== 'expenses' && (
                        <button
                            onClick={() => setScannerActive(true)}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition ${activeTab === 'hair' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-stone-900'}`}
                        >
                            <QrCode size={24} />
                            {activeTab === 'hair' ? 'Escanear para Servicio' : 'Escanear Tarjeta'}
                        </button>
                    )}


                    {message && (
                        <div className="mt-4 p-3 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium whitespace-pre-wrap">
                            {message}
                        </div>
                    )}

                    {/* Client display logic (same as before) */}
                    {client && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h3 className="font-bold text-white mb-3">Cliente: {client.phone}</h3>
                            {/* ... Discount buttons ... */}
                            <div className="space-y-3">
                                {client.discount_5th_visit_available ? (
                                    <button onClick={handleRedeemDiscount} className="w-full bg-purple-600 text-white py-2 rounded">Canjear 10%</button>
                                ) : <div className="text-stone-500 text-xs text-center">Sin descuento disponible</div>}
                            </div>
                        </div>
                    )}
                </div>

                {scannerActive && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-white p-4 rounded-2xl w-full max-w-sm relative">
                            <button onClick={() => setScannerActive(false)} className="absolute -top-12 right-0 text-white p-2">
                                <X size={32} />
                            </button>
                            <h3 className="text-center font-bold mb-4">Escanea el Código del Cliente</h3>
                            <div id="reader" className="w-full bg-stone-100 rounded-lg overflow-hidden"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicePanel;
