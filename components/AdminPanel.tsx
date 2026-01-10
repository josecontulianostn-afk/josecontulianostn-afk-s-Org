import React, { useState } from 'react';
import Login from './admin/Login';
import ServicePanel from './admin/ServicePanel';
import ManagementDashboard from './admin/ManagementDashboard';

type AdminRole = 'service' | 'management' | null;

const AdminPanel: React.FC = () => {
    const [role, setRole] = useState<AdminRole>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    const handleLogin = (newRole: 'service' | 'management', email?: string) => {
        setRole(newRole);
        if (email) setUserEmail(email);
    };

    const handleLogout = () => {
        setRole(null);
        setUserEmail('');
    };

    if (!role) {
        return <Login onLogin={handleLogin} />;
    }

    if (role === 'management') {
        return <ManagementDashboard onLogout={handleLogout} />;
    }

    return <ServicePanel onLogout={handleLogout} />;
};

export default AdminPanel;
