import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Login from './admin/Login';
import ServicePanel from './admin/ServicePanel';
import ManagementDashboard from './admin/ManagementDashboard';

type AdminRole = 'service' | 'management' | 'inventory' | null;

const AdminPanel: React.FC = () => {
    const [role, setRole] = useState<AdminRole>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    const handleLogin = (newRole: 'service' | 'management', email?: string) => {
        setRole(newRole);
        if (email) setUserEmail(email);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setUserEmail('');
    };

    if (!role) {
        return <Login onLogin={handleLogin} />;
    }

    if (role === 'management') {
        return <ManagementDashboard onLogout={handleLogout} />;
    }

    if (role === 'inventory') {
        const InventoryDashboard = React.lazy(() => import('./admin/InventoryDashboard'));
        return (
            <React.Suspense fallback={<div className="p-10 text-white">Cargando...</div>}>
                <InventoryDashboard onLogout={handleLogout} />
            </React.Suspense>
        );
    }

    return <ServicePanel onLogout={handleLogout} />;
};

export default AdminPanel;
