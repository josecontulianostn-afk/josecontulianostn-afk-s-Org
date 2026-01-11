import React, { useState, useEffect } from 'react';
import { Shield, Search, QrCode, X, Scissors, PlusCircle, Save } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
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

        // 1. Decrement Stock
        const { data, error } = await supabase.rpc('sell_product', { p_id: perfume.id, qty: 1 });

        if (error) {
            alert('Error: ' + error.message);
        } else if (data.success) {
            setStock(data.new_stock);
            // 2. Record Transaction (Assuming 10ml price for simplicity or ask?)
            // For rapid prototype, let's assume 10ml price is the standard "unit" sale or maybe full bottle?
            // "Vender" implies selling a unit. Usually decants. Let's use price10ml as default value.
            onSell(perfume.price10ml, `Venta: ${perfume.name} (10ml)`);
            alert('Venta exitosa. Nuevo stock: ' + data.new_stock);
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
    const [activeTab, setActiveTab] = useState<'loyalty' | 'hair' | 'inventory'>('loyalty');
    const [serviceType, setServiceType] = useState('Corte');
    const [servicePrice, setServicePrice] = useState('7000');
    const [visitAmount, setVisitAmount] = useState('0'); // New: Amount for loyalty visits

    const [client, setClient] = useState<any>(null);

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
        if (phone.length < 8) return;

        try {
            const { data: existingClient, error: fetchError } = await supabase
                .from('clients')
                .select('*')
                .eq('phone', phone)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                alert("Error al buscar cliente");
                return;
            }

            const currentVisits = existingClient ? existingClient.visits : 0;
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

            if (upsertError) {
                console.error(upsertError);
                alert("Error al actualizar visita");
                return;
            }

            // Record Transaction
            const amount = activeTab === 'hair' ? (parseInt(servicePrice) || 0) : (parseInt(visitAmount) || 0);
            await recordTransaction(upsertData.id, amount, 'service', activeTab === 'hair' ? `Manual: ${serviceType}` : 'Manual: Visita');

            setClient(upsertData);
            setMessage('Visita registrada para ' + phone + '. Total: ' + newVisits);
            setPhone('');

        } catch (err) {
            console.error(err);
            alert("Error de conexión");
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
                    </div>
                </div>

                <div className="bg-stone-800 p-6 rounded-2xl shadow-xl border border-white/5">
                    <h3 className="serif text-xl mb-4 text-center text-white">
                        {activeTab === 'loyalty' ? 'Registrar Visita' : activeTab === 'hair' ? 'Registrar Servicio Peluquería' : 'Gestión de Inventario'}
                    </h3>

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

                    {activeTab !== 'inventory' && (
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
