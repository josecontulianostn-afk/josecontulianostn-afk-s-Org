import React, { useState, useEffect } from 'react';
import { Shield, Users, Search, QrCode, X, Scissors, PlusCircle, Save } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { PERFUMES } from '../constants';
// import QrReader from 'react-qr-scanner';

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [scannerActive, setScannerActive] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);

    // Hair Service State
    const [activeTab, setActiveTab] = useState<'loyalty' | 'hair' | 'inventory'>('loyalty');
    const [serviceType, setServiceType] = useState('Corte');
    const [servicePrice, setServicePrice] = useState('7000');

    // const [serviceNotes, setServiceNotes] = useState('');
    const [client, setClient] = useState<any>(null); // State to hold looked-up client for actions

    useEffect(() => {
        if (scannerActive && !scanResult) {
            const html5QrCode = new Html5Qrcode("reader");

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            // Start the scanner specifically requesting the back camera (environment)
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
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => {
                    console.error("Failed to stop scanner", err);
                });
            };
        }
    }, [scannerActive, scanResult]);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (scanResult) return; // Already processed
        setScanResult(decodedText);
        setScannerActive(false);

        // Call RPC function
        try {
            setMessage("Procesando visita...");
            const { data, error } = await supabase
                .rpc('register_visit', { token_input: decodedText });

            if (error) throw error;

            if (data.success) {
                setMessage('OK: ' + data.message + ' Visitas: ' + data.new_visits);
            } else {
                setMessage('Error: ' + data.message);
            }

            // Reset after delay
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
        // Handle failure silently usually, but for debugging prompt:
        console.warn(error);
        // Only set message if it's a critical initialization error, otherwise scanning noise causes too many updates
        if (typeof error === 'string' && (error.includes("NotAllowedError") || error.includes("NotFoundError"))) {
            setMessage("Error de Cámara: " + error);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin2026') {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
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
            // Verificar si el cliente existe
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

            // Upsert (Insertar o Actualizar)
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

            setClient(upsertData); // Update persistent client state
            setMessage('Visita registrada para ' + phone + '. Total visitas: ' + newVisits);
            setPhone('');
            // setTimeout(() => setMessage(''), 3000); // Keep message/client visible

        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-stone-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-100 max-w-sm w-full text-center">
                    <Shield className="w-12 h-12 text-stone-900 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-stone-900 mb-6">Acceso Administrativo</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-900 outline-none"
                        />
                        <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold">
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 py-12">
            <h2 className="text-3xl serif text-stone-900 mb-8 border-b pb-4 flex justify-between">
                Panel de Control
            </h2>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-8">
                <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <PlusCircle className="text-green-600" />
                    Registrar Visita Manual
                </h3>
                <p className="text-sm text-stone-500 mb-6">
                    Usa esto para clientes que agendaron por WhatsApp o en persona.
                </p>

                <div className="flex gap-4 mb-4">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+569..."
                        className="flex-1 px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-600 outline-none"
                    />
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
                            Visitas (General)
                        </button>
                        <button
                            onClick={() => setActiveTab('hair')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'hair' ? 'bg-purple-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Peluquería (Servicios)
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
                    <h3 className="serif text-xl mb-4 text-center">
                        {activeTab === 'loyalty' ? 'Registrar Visita' : activeTab === 'hair' ? 'Registrar Servicio Peluquería' : 'Gestión de Inventario'}
                    </h3>

                    {activeTab === 'inventory' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-stone-300">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-700/50">
                                    <tr>
                                        <th className="px-3 py-2">Perfume</th>
                                        <th className="px-3 py-2 text-center">5ml (Venta/Costo)</th>
                                        <th className="px-3 py-2 text-center">10ml (Venta/Costo)</th>
                                        <th className="px-3 py-2 text-right">Margen Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERFUMES.map((p) => (
                                        <tr key={p.id} className="border-b border-stone-700 hover:bg-stone-700/20">
                                            <td className="px-3 py-2 font-medium text-white">{p.name}</td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="text-green-400">${p.price5ml.toLocaleString()}</div>
                                                <div className="text-stone-500 text-[10px]">${(p.price5ml - (p.margin5ml || 0)).toLocaleString()}</div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="text-green-400">${p.price10ml.toLocaleString()}</div>
                                                <div className="text-stone-500 text-[10px]">${(p.price10ml - (p.margin10ml || 0)).toLocaleString()}</div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="text-blue-400 font-bold">+${((p.margin5ml || 0) + (p.margin10ml || 0)).toLocaleString()}</div>
                                                {/* Note: This is just summing margins for display, real total depends on sales volume which we don't track yet */}
                                                <div className="text-[10px] text-stone-500">Unitario (5+10)</div>
                                            </td>
                                        </tr>
                                    ))}
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

                    <button
                        onClick={() => setScannerActive(true)}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition ${activeTab === 'hair' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-stone-900'}`}
                    >
                        <QrCode size={24} />
                        {activeTab === 'hair' ? 'Escanear para Servicio' : 'Escanear Tarjeta'}
                    </button>

                    {message && (
                        <div className="mt-4 p-3 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium whitespace-pre-wrap">
                            {message}
                        </div>
                    )}

                    {client && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h3 className="font-bold text-white mb-3">Cliente: {client.phone}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-stone-300 mb-4">
                                <div>Visitas: {client.visits}</div>
                                <div>Peluquería: {client.hair_service_count || 0}</div>
                            </div>

                            <div className="space-y-3">
                                {client.discount_5th_visit_available ? (
                                    <button
                                        onClick={handleRedeemDiscount}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 animate-pulse"
                                    >
                                        <span>💎 Canjear 10% Descuento</span>
                                    </button>
                                ) : (
                                    <div className="p-2 bg-stone-900/50 rounded text-center text-stone-500 text-xs">
                                        Descuento 10%: {5 - ((client.hair_service_count || 0) % 5)} para desbloquear
                                    </div>
                                )}

                                {client.free_cut_available ? (
                                    <button
                                        onClick={handleRedeemFreeCut}
                                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 animate-pulse shadow-lg"
                                    >
                                        <span>✂️ Canjear Corte Gratis</span>
                                    </button>
                                ) : (
                                    <div className="p-2 bg-stone-900/50 rounded text-center text-stone-500 text-xs">
                                        Corte Gratis: {10 - ((client.hair_service_count || 0) % 10)} para desbloquear
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {scannerActive && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-white p-4 rounded-2xl w-full max-w-sm relative">
                            <button
                                onClick={() => setScannerActive(false)}
                                className="absolute -top-12 right-0 text-white p-2"
                            >
                                <X size={32} />
                            </button>
                            <h3 className="text-center font-bold mb-4">Escanea el Código del Cliente</h3>
                            <div id="reader" className="w-full bg-stone-100 rounded-lg overflow-hidden"></div>
                            <p className="text-center text-xs text-stone-500 mt-4">Apunta la cámara al QR de la tarjeta digital</p>
                        </div>
                    </div>
                )}

                {message && (
                    <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm font-medium animate-in fade-in">
                        {message}
                    </div>
                )}
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <h3 className="text-lg font-bold text-stone-700 mb-2">Estadísticas Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <span className="block text-2xl font-bold text-stone-900">12</span>
                        <span className="text-xs text-stone-500 uppercase">Visitas Hoy</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <span className="block text-2xl font-bold text-purple-600">3</span>
                        <span className="text-xs text-stone-500 uppercase">Nuevos Referidos</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
