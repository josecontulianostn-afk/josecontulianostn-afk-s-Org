import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES } from '../../constants';
import { Download, TrendingUp, Users, DollarSign, Package } from 'lucide-react';

interface Transaction {
    id: string;
    amount: number;
    created_at: string;
    client_id: string;
    type: string;
}

interface ClientStat {
    id: string;
    phone: string;
    total_spent: number;
    visit_count: number;
}

const ManagementDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

    // KPIs
    const [totalNet, setTotalNet] = useState(0);
    const [avgTicket, setAvgTicket] = useState(0);
    const [topClients, setTopClients] = useState<ClientStat[]>([]);

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Transactions
            const rangeDate = new Date();
            if (timeRange === 'week') rangeDate.setDate(rangeDate.getDate() - 7);
            else rangeDate.setDate(rangeDate.getDate() - 30);

            const { data: transData, error: transError } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', rangeDate.toISOString());

            if (transError) throw transError;

            const trans = transData as Transaction[] || [];
            setTransactions(trans);

            // Calculate KPIs
            const total = trans.reduce((sum, t) => sum + t.amount, 0);
            setTotalNet(total);
            setAvgTicket(trans.length ? Math.round(total / trans.length) : 0);

            // 2. Calculate Top Clients
            const clientMap = new Map<string, ClientStat>();

            // We need to fetch client details for the IDs in transactions
            // For simplicity in this view, let's group by ID first
            trans.forEach(t => {
                if (!t.client_id) return;
                const current = clientMap.get(t.client_id) || { id: t.client_id, phone: 'Cargando...', total_spent: 0, visit_count: 0 };
                current.total_spent += t.amount;
                current.visit_count += 1;
                clientMap.set(t.client_id, current);
            });

            // Fetch phones for top clients
            const topClientIds = Array.from(clientMap.keys());
            if (topClientIds.length > 0) {
                const { data: clientsData } = await supabase.from('clients').select('id, phone').in('id', topClientIds);
                clientsData?.forEach(c => {
                    const stat = clientMap.get(c.id);
                    if (stat) stat.phone = c.phone;
                });
            }

            setTopClients(Array.from(clientMap.values()).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        const headers = ['ID Transaccion', 'Fecha', 'Monto', 'Tipo', 'ID Cliente'];
        const rows = transactions.map(t => [t.id, t.created_at, t.amount, t.type, t.client_id || 'Anónimo']);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-900 serif">Panel de Gestión</h1>
                <div className="flex gap-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="week">Última Semana</option>
                        <option value="month">Último Mes</option>
                    </select>
                    <button onClick={onLogout} className="bg-stone-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-300">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                    <div>
                        <p className="text-stone-500 text-sm uppercase tracking-wider mb-1">Monto Neto</p>
                        <h3 className="text-3xl font-bold text-green-600">${totalNet.toLocaleString()}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                        <DollarSign className="text-green-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                    <div>
                        <p className="text-stone-500 text-sm uppercase tracking-wider mb-1">Ticket Promedio</p>
                        <h3 className="text-3xl font-bold text-blue-600">${avgTicket.toLocaleString()}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                        <TrendingUp className="text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                    <div>
                        <p className="text-stone-500 text-sm uppercase tracking-wider mb-1">Transacciones</p>
                        <h3 className="text-3xl font-bold text-purple-600">{transactions.length}</h3>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                        <TrendingUp className="text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Clients */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users size={20} /> Top 10 Clientes (Gasto)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-stone-50 text-stone-500">
                                <tr>
                                    <th className="px-4 py-2">Cliente</th>
                                    <th className="px-4 py-2 text-right">Visitas</th>
                                    <th className="px-4 py-2 text-right">Total Gastado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topClients.map((client, idx) => (
                                    <tr key={client.id} className="border-b border-stone-100">
                                        <td className="px-4 py-3 font-medium">
                                            {idx + 1}. {client.phone}
                                        </td>
                                        <td className="px-4 py-3 text-right">{client.visit_count}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-600">
                                            ${client.total_spent.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {topClients.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-stone-400">
                                            No hay suficientes datos
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Snapshot */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Package size={20} /> Inventario Perfumes
                        </h3>
                        {/* Placeholder for future inventory logic */}
                        <button onClick={downloadCSV} className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                            <Download size={14} /> Exportar CSV
                        </button>
                    </div>
                    <div className="overflow-y-auto max-h-[300px]">
                        <table className="w-full text-xs text-left">
                            <thead className="text-xs uppercase bg-stone-50 text-stone-500 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Producto</th>
                                    <th className="px-4 py-2 text-center">Stock</th>
                                    <th className="px-4 py-2 text-right">Margen 10ml</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PERFUMES.map((p) => (
                                    <tr key={p.id} className="border-b border-stone-100">
                                        <td className="px-4 py-2">{p.name}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {p.stock ? 'OK' : 'AGOTADO'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right text-blue-600 font-medium">
                                            ${(p.margin10ml || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementDashboard;
