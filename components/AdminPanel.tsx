import React, { useState } from 'react';
import { UserCheck, Shield, PlusCircle, Save } from 'lucide-react';

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin2026') {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleAddVisit = () => {
        if (phone.length < 8) return;

        // Mock Logic: In real app, this would call Supabase RPC
        setMessage(`Visita registrada para ${phone}. ¡Puntos actualizados!`);
        setPhone('');
        setTimeout(() => setMessage(''), 3000);
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

                <div className="flex gap-4">
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
