import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface LoginProps {
    onLogin: (role: 'service' | 'management', email?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password === 'admin2026') {
            onLogin('service');
        } else if (password === 'Chile2026#') {
            if (email === 'jacontulianoc@gmail.com') {
                onLogin('management', email);
            } else {
                setError('Correo no autorizado para gestión');
            }
        } else {
            setError('Contraseña incorrecta');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-stone-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-100 max-w-sm w-full text-center">
                <Shield className="w-12 h-12 text-stone-900 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-stone-900 mb-6">Acceso Administrativo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo (Solo Gestión)"
                        className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold">
                        Ingresar
                    </button>
                    <p className="text-xs text-stone-400 mt-4">
                        * Ingrese solo contraseña para Atención Clientes
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
