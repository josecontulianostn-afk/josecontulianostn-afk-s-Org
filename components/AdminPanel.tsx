import React, { useState } from 'react';
import { UserCheck, Shield, PlusCircle, Save, QrCode, X, Search } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Html5QrcodeScanner } from 'html5-qrcode';
// import QrReader from 'react-qr-scanner';

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);

    React.useEffect(() => {
        if (showScanner && !scanResult) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
            };
        }
    }, [showScanner, scanResult]);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (scanResult) return; // Already processed
        setScanResult(decodedText);
        setShowScanner(false);

        // Call RPC function
        try {
            setMessage("Procesando visita...");
            const { data, error } = await supabase
                .rpc('register_visit', { token_input: decodedText });

            if (error) throw error;

            if (data.success) {
                setMessage(`✅ ${data.message}. Visitas: ${data.new_visits}`);
            } else {
                setMessage(`❌ ${data.message}`);
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
        // console.warn(`Code scan error = ${error}`);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin2026') {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
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
            const { error: upsertError } = await supabase
                .from('clients')
                .upsert({
                    phone: phone,
                    visits: newVisits,
                    last_visit: new Date().toISOString()
                }, { onConflict: 'phone' });

            if (upsertError) {
                console.error(upsertError);
                alert("Error al actualizar visita");
                return;
            }

            setMessage(`Visita registrada para ${phone}. Total visitas: ${newVisits}`);
            setPhone('');
            setTimeout(() => setMessage(''), 3000);

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
            <h2 className="text-3xl serif text-stone-900 mb-8 border-b pb-4">Panel de Control</h2>

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

                <button
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-stone-100 text-stone-700 py-3 rounded-lg font-bold hover:bg-stone-200 transition flex items-center justify-center gap-2 border border-stone-200"
                >
                    <QrCode size={18} />
                    Escanear QR
                </button>

                {showScanner && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-white p-4 rounded-2xl w-full max-w-sm relative">
                            <button
                                onClick={() => setShowScanner(false)}
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
