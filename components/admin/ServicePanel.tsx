import React, { useState, useEffect } from 'react';
import { Shield, Search, QrCode, X, Scissors, PlusCircle, Save } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { classifyExpenseStatic } from '../../services/staticChatService';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { PERFUMES, GIFTS } from '../../constants';

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
    const [activeTab, setActiveTab] = useState<'loyalty' | 'hair' | 'inventory' | 'agenda' | 'clients' | 'expenses' | 'ventas'>('loyalty');
    const [serviceType, setServiceType] = useState('Corte');
    const [servicePrice, setServicePrice] = useState('7000');
    const [extraCost, setExtraCost] = useState(''); // Costos adicionales (luz, insumos, etc)
    const [extraCostDetail, setExtraCostDetail] = useState('');
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

    // POS State
    const [cart, setCart] = useState<any[]>([]);
    const [posClient, setPosClient] = useState<any>(null);
    const [posSearchTerm, setPosSearchTerm] = useState('');
    const [posProductSearch, setPosProductSearch] = useState('');
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const addToCart = (product: any, type: 'product' | 'gift') => {
        const existing = cart.find(item => item.id === product.id && item.type === type);
        if (existing) {
            setCart(cart.map(item => item.id === product.id && item.type === type ? { ...item, qty: item.qty + 1 } : item));
        } else {
            // Determine price
            let price = 0;
            if (type === 'product') price = product.price10ml || 0; // Default to 10ml for now or add 5ml selector later
            if (type === 'gift') price = product.price || 0;

            setCart([...cart, { ...product, type, qty: 1, price, variant: type === 'product' ? '10ml' : 'standard' }]);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateCartQty = (id: string, qty: number) => {
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, qty } : item));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("El carrito está vacío");
        if (!window.confirm(`¿Confirmar venta por $${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}?`)) return;

        setIsCheckoutLoading(true);
        try {
            const clientId = posClient ? posClient.id : null;
            // Note: If transactions require client_id, sure to handle nullable or specific ID.

            for (const item of cart) {
                // 1. Inventory Logic (if product/perfume)
                if (item.type === 'product' && item.stock !== false) { // stock: false means no tracking needed? check constant
                    const { error: invError } = await supabase.rpc('adjust_inventory', {
                        p_product_id: item.id,
                        p_delta: -item.qty,
                        p_reason: 'sale_pos'
                    });
                    if (invError) console.error("Inventory error", invError);
                }

                // 2. Transaction Logic
                // We'll insert one transaction per line item for better tracking for now, or aggregate?
                // Per item allows detailed analysis.
                const { error: txError } = await supabase.from('transactions').insert({
                    client_id: clientId, // nullable?
                    amount: item.price * item.qty,
                    type: item.type === 'service' ? 'service' : 'product',
                    description: `POS: ${item.name} (${item.variant}) x${item.qty}`,
                    additional_cost: 0
                });

                if (txError) {
                    console.error("Tx Error", txError);
                    // If client_id is mandatory and we sent null, this will fail.
                    // We might need a catch here to alert.
                    throw txError;
                }
            }

            alert("✅ Venta registrada con éxito!");
            setCart([]);
            setPosClient(null);
            setPosSearchTerm('');
        } catch (err: any) {
            alert("Error procesando venta: " + err.message);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

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

        try {
            // Manual Cascade Delete
            await supabase.from('hair_service_log').delete().eq('client_id', id);
            await supabase.from('transactions').delete().eq('client_id', id);
            await supabase.from('visit_registrations').delete().eq('client_id', id);

            const { error } = await supabase.from('clients').delete().eq('id', id);

            if (error) throw error;

            alert('Cliente eliminado correctamente.');
            fetchClients();
        } catch (error: any) {
            alert('Error al eliminar: ' + error.message);
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
                } else if (activeTab === 'ventas') {
                    const { data: clientData } = await supabase.from('clients').select('*').eq('member_token', decodedText).single();
                    if (clientData) {
                        setPosClient(clientData);
                        // alert(`Cliente seleccionado: ${clientData.name || clientData.phone}`); // Optional feedback
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
                const cost = parseInt(extraCost) || 0;

                // Note: RPC might need update to accept extra costs, or we update transaction after?
                // For now, let's update the transaction immediately after if RPC returns success/transaction_id
                // OR better: Just rely on recording transaction separately if RPC doesn't handle it fully?
                // Actually, add_hair_service_by_phone creates a 'hair_service_log' entry but maybe not 'transactions'?
                // Checking previous code: we rely on separate transaction recording usually?
                // Wait, in handleAddVisit for 'hair' tab, we called the RPC.
                // Let's check if the RPC creates a transaction. If not, we do it here.

                // Assuming we want to record the transaction with details:

                const { data, error } = await supabase.rpc('add_hair_service_by_phone', {
                    phone_input: phone,
                    service_type: serviceType,
                    service_price: price,
                    notes_input: `Ingreso Manual. Extras: ${extraCostDetail} ($${cost})`
                });

                if (error) throw error;

                if (data.success) {
                    // Record financial transaction separately to ensure costs are tracked
                    // First get client ID from phone (RPC should ideally return it or we fetch)
                    const { data: clientData } = await supabase.from('clients').select('id').eq('phone', phone).single();

                    if (clientData) {
                        await supabase.from('transactions').insert({
                            client_id: clientData.id,
                            amount: price,
                            type: 'service',
                            description: `Servicio: ${serviceType}`,
                            additional_cost: cost,
                            additional_cost_detail: extraCostDetail
                        });
                    }

                    setMessage(`✅ Servicio registrado. Total: ${data.new_total_services}. ${data.discount_5th_unlocked ? '¡DESCUENTO 10% DESBLOQUEADO!' : ''} ${data.free_cut_unlocked ? '¡CORTE GRATIS DESBLOQUEADO!' : ''}`);
                    setPhone('');
                    setExtraCost('');
                    setExtraCostDetail('');
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
        <div className="max-w-2xl mx-auto p-4 py-12 md:pt-24">
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
                        <button
                            onClick={() => setActiveTab('ventas')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'ventas' ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Ventas (POS)
                        </button>
                    </div>
                </div>

                <div className="bg-stone-800 p-6 rounded-2xl shadow-xl border border-white/5">
                    <h3 className="serif text-xl mb-4 text-center text-white">
                        {activeTab === 'loyalty' ? 'Registrar Visita' : activeTab === 'hair' ? 'Registrar Servicio Peluquería' : activeTab === 'inventory' ? 'Gestión de Inventario' : activeTab === 'clients' ? 'Gestión de Clientes' : activeTab === 'expenses' ? 'Control de Inversión y Compras' : activeTab === 'ventas' ? 'Punto de Venta' : 'Agenda Semanal'}
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
                                            <th className="px-3 py-2">Nombre</th>
                                            <th className="px-3 py-2">Teléfono</th>
                                            <th className="px-3 py-2 text-center">Visitas</th>
                                            <th className="px-3 py-2 text-center">Peluquería</th>
                                            <th className="px-3 py-2 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((c) => (
                                            <tr key={c.id} className="border-b border-stone-700 hover:bg-stone-700/20">
                                                <td className="px-3 py-2 text-white font-medium">{c.name || 'Sin nombre'}</td>
                                                <td className="px-3 py-2 text-stone-300 font-mono">{c.phone}</td>
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
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={extraCost}
                                    onChange={(e) => setExtraCost(e.target.value)}
                                    placeholder="Costo Extra ($)"
                                    className="w-1/3 bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                                <input
                                    type="text"
                                    value={extraCostDetail}
                                    onChange={(e) => setExtraCostDetail(e.target.value)}
                                    placeholder="Detalle (ej: Luz, Café)"
                                    className="w-2/3 bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'ventas' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Col: Catalog */}
                            <div className="space-y-4">
                                {/* Product Search */}
                                <div className="bg-stone-700/30 p-3 rounded-xl border border-white/5">
                                    <h4 className="text-stone-400 text-xs font-bold uppercase mb-2">Catálogo</h4>
                                    <input
                                        type="text"
                                        placeholder="Buscar producto..."
                                        className="w-full bg-stone-900 border border-white/10 rounded px-3 py-2 text-white text-sm mb-3"
                                        value={posProductSearch}
                                        onChange={e => setPosProductSearch(e.target.value)}
                                    />
                                    <div className="h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {/* Perfumes */}
                                        {PERFUMES.filter(p => p.name.toLowerCase().includes(posProductSearch.toLowerCase())).map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-stone-800 p-2 rounded hover:bg-stone-700 cursor-pointer" onClick={() => addToCart(p, 'product')}>
                                                <div>
                                                    <div className="text-white text-sm font-medium">{p.name}</div>
                                                    <div className="text-stone-400 text-[10px]">${p.price10ml.toLocaleString()} (10ml)</div>
                                                </div>
                                                <button className="text-green-400 hover:text-green-300"><PlusCircle size={16} /></button>
                                            </div>
                                        ))}
                                        {/* Gifts */}
                                        {GIFTS.filter(g => g.name.toLowerCase().includes(posProductSearch.toLowerCase())).map(g => (
                                            <div key={g.id} className="flex items-center justify-between bg-stone-800 p-2 rounded hover:bg-stone-700 cursor-pointer" onClick={() => addToCart(g, 'gift')}>
                                                <div>
                                                    <div className="text-white text-sm font-medium">{g.name}</div>
                                                    <div className="text-stone-400 text-[10px]">${g.price.toLocaleString()}</div>
                                                </div>
                                                <button className="text-green-400 hover:text-green-300"><PlusCircle size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Cart & Client */}
                            <div className="space-y-4">
                                {/* Client Selection */}
                                <div className="bg-stone-700/30 p-3 rounded-xl border border-white/5">
                                    <h4 className="text-stone-400 text-xs font-bold uppercase mb-2">Cliente</h4>
                                    {posClient ? (
                                        <div className="flex justify-between items-center bg-green-500/20 text-green-400 p-2 rounded">
                                            <span className="font-bold">{posClient.name || posClient.phone}</span>
                                            <button onClick={() => setPosClient(null)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar cliente (Tel o Nombre)..."
                                                className="w-full bg-stone-900 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                                value={posSearchTerm}
                                                onChange={e => setPosSearchTerm(e.target.value)}
                                            />
                                            {/* Minimal dropdown results */}
                                            {posSearchTerm.length > 2 && (
                                                <div className="absolute top-full left-0 right-0 bg-stone-800 border border-stone-600 rounded-b shadow-xl z-10 max-h-40 overflow-y-auto">
                                                    {clients.filter(c => c.phone.includes(posSearchTerm) || (c.name && c.name.toLowerCase().includes(posSearchTerm.toLowerCase()))).map(c => (
                                                        <div
                                                            key={c.id}
                                                            className="p-2 hover:bg-stone-700 cursor-pointer text-sm text-white"
                                                            onClick={() => { setPosClient(c); setPosSearchTerm(''); }}
                                                        >
                                                            {c.name ? `${c.name} (${c.phone})` : c.phone}
                                                        </div>
                                                    ))}
                                                    {clients.filter(c => c.phone.includes(posSearchTerm) || (c.name && c.name.toLowerCase().includes(posSearchTerm.toLowerCase()))).length === 0 && (
                                                        <div className="p-2 text-stone-500 text-xs">No encontrado</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <div className="bg-white p-3 rounded-xl shadow-lg">
                                    <h4 className="text-stone-900 text-xs font-bold uppercase mb-2 border-b pb-1">Carrito de Compras</h4>
                                    {cart.length === 0 ? (
                                        <div className="text-center text-stone-400 py-6 text-sm">Carrito Vacío</div>
                                    ) : (
                                        <div className="space-y-2 mb-4">
                                            {cart.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-stone-100 pb-2">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-stone-800">{item.name}</div>
                                                        <div className="text-xs text-stone-500">${item.price.toLocaleString()} x {item.qty}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-stone-900">${(item.price * item.qty).toLocaleString()}</div>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-between items-center pt-2 border-t border-stone-200 mt-2">
                                                <span className="font-bold text-stone-900 text-lg">Total</span>
                                                <span className="font-bold text-green-600 text-xl">
                                                    ${cart.reduce((sum, i) => sum + (i.price * i.qty), 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCheckoutLoading || cart.length === 0}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
                                    >
                                        {isCheckoutLoading ? 'Procesando...' : (
                                            <>
                                                <Save size={18} /> Confirmar Venta
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
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
