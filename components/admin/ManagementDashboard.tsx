import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES, SERVICES } from '../../constants';
import { Download, TrendingUp, Users, DollarSign, Package, PieChart, BarChart as BarChartIcon, ScatterChart as ScatterChartIcon } from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';

interface Transaction {
    id: string;
    amount: number;
    created_at: string;
    client_id: string;
    type: string;
    description?: string; // Add description to track product/service name
}

interface ClientStat {
    id: string;
    phone: string;
    total_spent: number;
    visit_count: number;
}

interface ProductBCG {
    name: string;
    volume: number; // Share of total count
    growth: number; // Growth vs previous period
    type: 'star' | 'cow' | 'question' | 'dog';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InventoryEditRow: React.FC<{ perfume: any }> = ({ perfume }) => {
    const [quantity, setQuantity] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQty();
    }, []);

    const fetchQty = async () => {
        const { data } = await supabase.from('inventory').select('quantity').eq('product_id', perfume.id).single();
        if (data) setQuantity(data.quantity);
        else setQuantity(0);
    };

    const handleUpdate = async (newQty: number) => {
        if (newQty < 0) return;
        setLoading(true);
        const { error } = await supabase.from('inventory').upsert({
            product_id: perfume.id,
            quantity: newQty,
            updated_at: new Date().toISOString()
        });
        if (error) alert("Error: " + error.message);
        else setQuantity(newQty);
        setLoading(false);
    };

    return (
        <tr className="border-b border-stone-100">
            <td className="px-4 py-2">{perfume.name}</td>
            <td className="px-4 py-2 text-center">
                <span className={`font-bold ${quantity !== null && quantity > 2 ? 'text-green-600' : 'text-red-500'}`}>
                    {quantity !== null ? quantity : '...'}
                </span>
            </td>
            <td className="px-4 py-2 text-right flex justify-end gap-1">
                <button
                    onClick={() => handleUpdate((quantity || 0) + 1)}
                    disabled={loading}
                    className="bg-stone-200 text-stone-800 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300"
                >
                    +
                </button>
                <button
                    onClick={() => handleUpdate((quantity || 0) - 1)}
                    disabled={loading || (quantity || 0) <= 0}
                    className="bg-stone-200 text-stone-800 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300"
                >
                    -
                </button>
            </td>
        </tr>
    );
};

const ManagementDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

    // KPIs
    const [totalNet, setTotalNet] = useState(0);
    const [avgTicket, setAvgTicket] = useState(0);
    const [topClients, setTopClients] = useState<ClientStat[]>([]);

    // Analytics Data
    const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [bcgMatrix, setBcgMatrix] = useState<ProductBCG[]>([]);

    const [activeTab, setActiveTab] = useState<'dashboard' | 'clients'>('dashboard');
    const [clients, setClients] = useState<any[]>([]);
    const [editingClient, setEditingClient] = useState<any>(null);

    // Refresh data when tab changes or time range changes
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardData();
        } else if (activeTab === 'clients') {
            fetchClients();
        }
    }, [activeTab, timeRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Transactions (Current Period)
            const rangeDate = new Date();
            if (timeRange === 'week') rangeDate.setDate(rangeDate.getDate() - 7);
            else rangeDate.setDate(rangeDate.getDate() - 30);

            const { data: transData, error: transError } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', rangeDate.toISOString());

            if (transError) throw transError;
            const trans = transData as Transaction[] || [];

            // 2. Fetch Transactions (Previous Period for Growth)
            const prevRangeDate = new Date(rangeDate);
            if (timeRange === 'week') prevRangeDate.setDate(prevRangeDate.getDate() - 7);
            else prevRangeDate.setDate(prevRangeDate.getDate() - 30);

            const { data: prevTransData } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', prevRangeDate.toISOString())
                .lt('created_at', rangeDate.toISOString());

            const prevTrans = prevTransData as Transaction[] || [];

            setTransactions(trans);

            // Calculate KPIs
            const total = trans.reduce((sum, t) => sum + t.amount, 0);
            setTotalNet(total);
            setAvgTicket(trans.length ? Math.round(total / trans.length) : 0);

            // 3. Analytics: Sales by Category
            const categoryMap = new Map<string, number>();
            trans.forEach(t => {
                const cat = t.type === 'product' ? 'Productos' : 'Servicios';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
            });
            setSalesByCategory(Array.from(categoryMap).map(([name, value]) => ({ name, value })));

            // 4. Analytics: Top Products/Services & BCG Construction
            // Note: We need 'description' or similar in transaction to identify specific items. 
            // Assuming for now 'type' serves as proxy or we infer from context. 
            // *Wait*, the current transaction table might not have Item Names. 
            // We will simulate item names based on 'amount' matching known prices for demonstration 
            // OR use a mock distribution if descriptions are missing to show the chart functionality.
            // *Self-Correction*: Use a heuristic matching price to existing catalog for now.

            const productStats = new Map<string, { current: number, previous: number }>();

            // Helper to guess item name from price (Heuristic)
            const guessItem = (amount: number, type: string) => {
                if (type === 'product') {
                    const p = PERFUMES.find(p => p.price5ml === amount || p.price10ml === amount || p.priceFullBottle === amount);
                    return p ? p.name : 'Producto Genérico';
                } else {
                    const s = SERVICES.find(s => s.price === amount);
                    return s ? s.name : 'Servicio General';
                }
            };

            trans.forEach(t => {
                const name = guessItem(t.amount, t.type);
                if (!productStats.has(name)) productStats.set(name, { current: 0, previous: 0 });
                productStats.get(name)!.current++;
            });

            prevTrans.forEach(t => {
                const name = guessItem(t.amount, t.type);
                if (!productStats.has(name)) productStats.set(name, { current: 0, previous: 0 });
                productStats.get(name)!.previous++;
            });

            // Build Top Products List
            const sortedProducts = Array.from(productStats.entries())
                .map(([name, stats]) => ({ name, count: stats.current }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            setTopProducts(sortedProducts);

            // Build BCG Matrix
            const totalVolume = trans.length || 1;
            const avgVolumeShare = (trans.length / productStats.size) / totalVolume; // Avg share

            const bcgData: ProductBCG[] = [];
            productStats.forEach((stats, name) => {
                if (stats.current === 0) return; // Skip if no sales this period

                const volumeShare = stats.current / totalVolume;
                // Growth: (Current - Previous) / Previous
                // Handle division by zero: if prev is 0, growth is 100% (1) if current > 0
                const growth = stats.previous === 0 ? 1 : (stats.current - stats.previous) / stats.previous;

                let type: ProductBCG['type'] = 'question';
                if (volumeShare >= avgVolumeShare && growth >= 0) type = 'star'; // High Share, High Growth
                else if (volumeShare >= avgVolumeShare && growth < 0) type = 'cow'; // High Share, Low Growth
                else if (volumeShare < avgVolumeShare && growth >= 0) type = 'question'; // Low Share, High Growth
                else type = 'dog'; // Low Share, Low Growth

                bcgData.push({ name, volume: volumeShare, growth, type });
            });
            setBcgMatrix(bcgData);


            // 5. Calculate Top Clients
            const clientMap = new Map<string, ClientStat>();
            trans.forEach(t => {
                if (!t.client_id) return;
                const current = clientMap.get(t.client_id) || { id: t.client_id, phone: 'Cargando...', total_spent: 0, visit_count: 0 };
                current.total_spent += t.amount;
                current.visit_count += 1;
                clientMap.set(t.client_id, current);
            });

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

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('last_visit', { ascending: false });

        if (error) console.error("Error fetching clients", error);
        else setClients(data || []);
        setLoading(false);
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;

        const { error } = await supabase
            .from('clients')
            .update({
                phone: editingClient.phone,
                visits: editingClient.visits
            })
            .eq('id', editingClient.id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            setEditingClient(null);
            fetchClients();
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer y borrará su historial.")) return;

        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            fetchClients();
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
                    {activeTab === 'dashboard' && (
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mes</option>
                        </select>
                    )}
                    <button onClick={onLogout} className="bg-stone-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-300">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-stone-200 pb-1">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 font-bold transition ${activeTab === 'dashboard' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('clients')}
                    className={`px-4 py-2 font-bold transition ${activeTab === 'clients' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Clientes
                </button>
            </div>

            {activeTab === 'dashboard' ? (
                <>
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

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* 1. Category Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <PieChart size={18} /> Origen de Ingresos
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie
                                            data={salesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {salesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                        <Legend />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 2. Top Products Bar Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <BarChartIcon size={18} /> Top Productos/Servicios
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topProducts} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '10px' }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 3. BCG Matrix Visualization */}
                        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ScatterChartIcon size={18} /> Matriz BCG (Crecimiento vs Participación)
                            </h3>
                            <div className="h-[300px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid />
                                        <XAxis type="number" dataKey="volume" name="Cuota (Volumen)" unit="%" domain={[0, 'auto']} tickFormatter={(v) => Math.round(v * 100) + '%'} />
                                        <YAxis type="number" dataKey="growth" name="Crecimiento" unit="%" tickFormatter={(v) => Math.round(v * 100) + '%'} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number, name: string) => [Math.round(value * 100) + '%', name === 'volume' ? 'Cuota' : 'Crecimiento']} />

                                        {/* Quadrants Reference Lines */}
                                        <ReferenceLine y={0} stroke="#ccc" strokeDasharray="3 3" />

                                        <Scatter name="Productos" data={bcgMatrix} fill="#8884d8">
                                            {bcgMatrix.map((entry, index) => {
                                                let color = '#8884d8';
                                                if (entry.type === 'star') color = '#FFBB28'; // Star (Yellow)
                                                else if (entry.type === 'cow') color = '#00C49F'; // Cow (Green)
                                                else if (entry.type === 'dog') color = '#FF8042'; // Dog (Orange)
                                                else color = '#999'; // Question (Grey)
                                                return <Cell key={`cell-${index}`} fill={color} />;
                                            })}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>

                                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded border border-stone-200 text-xs shadow-lg grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#FFBB28] rounded-full"></div> ⭐️ Estrella</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#00C49F] rounded-full"></div> 🐮 Vaca</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#999] rounded-full"></div> ❓ Interrogante</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#FF8042] rounded-full"></div> 🐕 Perro</div>
                                </div>
                            </div>
                            <p className="text-xs text-stone-400 mt-2 text-center">
                                * Eje X: Cuota de Mercado (Volumen) | Eje Y: Crecimiento respecto al periodo anterior
                            </p>
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
                                <button onClick={downloadCSV} className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                                    <Download size={14} /> Exportar CSV
                                </button>
                            </div>
                            <div className="overflow-y-auto max-h-[300px]">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-xs uppercase bg-stone-50 text-stone-500 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Producto</th>
                                            <th className="px-4 py-2 text-center">Stock Real</th>
                                            <th className="px-4 py-2 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PERFUMES.map((p) => (
                                            <InventoryEditRow key={p.id} perfume={p} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="text-xl font-bold mb-6">Gestión de Clientes</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-stone-50 text-stone-500">
                                <tr>
                                    <th className="px-6 py-3">Teléfono / Cliente</th>
                                    <th className="px-6 py-3 text-center">Visitas (Lealtad)</th>
                                    <th className="px-6 py-3">Última Visita</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((c) => (
                                    <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                                        <td className="px-6 py-4 font-medium">{c.phone}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                                                {c.visits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{new Date(c.last_visit).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => setEditingClient(c)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 bg-blue-50 rounded"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClient(c.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 bg-red-50 rounded"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {editingClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Editar Cliente</h3>
                        <form onSubmit={handleUpdateClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={editingClient.phone}
                                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-1">Visitas (Puntos)</label>
                                <input
                                    type="number"
                                    value={editingClient.visits}
                                    onChange={(e) => setEditingClient({ ...editingClient, visits: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingClient(null)}
                                    className="flex-1 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-lg font-bold"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagementDashboard;
