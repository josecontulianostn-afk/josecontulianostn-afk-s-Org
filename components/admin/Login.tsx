import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface LoginProps {
    onLogin: (role: 'service' | 'management', email?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Authenticate with Supabase
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (!data.user) throw new Error('No user found');

            // 2. Fetch Role from Profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                // Determine role via email fallback if profile missing (legacy/safety)
                const role = email === 'jacontulianoc@gmail.com' ? 'management' : 'service';
                onLogin(role as any, email);
            } else {
                // Map DB role to App role
                // DB: 'admin' | 'staff' -> App: 'management' | 'service'
                const appRole = profile.role === 'admin' ? 'management' : 'service';
                onLogin(appRole, email);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-stone-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-100 max-w-sm w-full text-center">
                <Shield className="w-12 h-12 text-stone-900 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-stone-900 mb-6">Acceso Seguro</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo (@tus3b.cl)"
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold disabled:bg-stone-500"
                    >
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                    <p className="text-xs text-stone-400 mt-4">
                        * Sistema protegido con Supabase Auth
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
