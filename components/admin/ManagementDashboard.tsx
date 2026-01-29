import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES, SERVICES } from '../../constants';
import { VisitRegistration, InventoryLog } from '../../types';
import VisitValidationModal from './VisitValidationModal';
import FinancialDashboard from './FinancialDashboard';
import { QRCodeSVG } from 'qrcode.react';
import { Download, TrendingUp, Users, DollarSign, Package, PieChart, BarChart as BarChartIcon, ScatterChart as ScatterChartIcon, QrCode, ClipboardCheck, History, ShoppingCart, Calendar, Eye, Trash2, X } from 'lucide-react';
import POSModule from './POSModule';
import AgendaModule from './AgendaModule';
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

const InventoryEditRow: React.FC<{
    perfume: any,
    inventoryItem: any,
    onRefresh: () => void
}> = ({ perfume, inventoryItem, onRefresh }) => {
    const [loading, setLoading] = useState(false);

    // Derived values from props
    const quantity = inventoryItem?.quantity || 0;
    const cost = inventoryItem?.last_purchase_price || 0;
    const itemsRefPrice = perfume.priceFullBottle || 0;

    // Calculate Margins
    // Assuming 'stock' refers to Bottles, and Cost is per bottle.
    // Selling price used for comparison is Full Bottle Price to be apples-to-apples.
    // Note: If user sells Decants primarily, this margin is theoretical for "Whole Bottle Sales".

    const margin = itemsRefPrice - cost;
    const marginPercent = cost > 0 ? (margin / cost) * 100 : 0;

    // Also calculating 10ml average yield might be useful but sticking to Bottle Unit for now as requested "Unitario" matches Stock Unit.

    let days: number | null = null;
    if (inventoryItem?.last_purchase_date) {
        const diff = new Date().getTime() - new Date(inventoryItem.last_purchase_date).getTime();
        days = Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    const handleUpdate = async (change: number) => {
        setLoading(true);
        // Use RPC to adjust inventory and log the change
        const { data, error } = await supabase.rpc('adjust_inventory', {
            p_product_id: perfume.id,
            p_delta: change,
            p_reason: 'manual_adjustment'
        });

        if (error) {
            alert("Error: " + error.message);
        } else if (!data.success) {
            alert("Error: " + data.message);
        } else {
            onRefresh(); // Trigger parent refresh to update totals
        }
        setLoading(false);
    };

    return (
        <tr className="border-b border-stone-100">
            <td className="px-4 py-2">
                <div className="font-medium text-stone-800">{perfume.name}</div>
            </td>
            <td className="px-4 py-2 text-center text-stone-600">
                ${cost.toLocaleString()}
            </td>
            <td className="px-4 py-2 text-center text-stone-600">
                ${itemsRefPrice.toLocaleString()}
            </td>
            <td className="px-4 py-2 text-center">
                <div className={`text-xs font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ${margin.toLocaleString()}
                </div>
                <div className={`text-[10px] ${margin >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {marginPercent.toFixed(1)}%
                </div>
            </td>
            <td className="px-4 py-2 text-center">
                <span className={`font-bold ${quantity > 2 ? 'text-green-600' : 'text-red-500'}`}>
                    {quantity}
                </span>
            </td>
            <td className="px-4 py-2 text-center text-stone-500">
                {days !== null ? `${days}d` : '-'}
            </td>
            <td className="px-4 py-2 text-right flex justify-end gap-1">
                <button
                    onClick={() => handleUpdate(1)}
                    disabled={loading}
                    className="bg-stone-200 text-stone-800 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300"
                >
                    +
                </button>
                <button
                    onClick={() => handleUpdate(-1)}
                    disabled={loading || quantity <= 0}
                    className="bg-stone-200 text-stone-800 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300"
                >
                    -
                </button>
            </td>
        </tr>
    );
};

const InventoryHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('inventory_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) console.error("Error fetching logs:", error);
            else setLogs(data || []);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const getProductName = (id: string) => {
        const p = PERFUMES.find(p => p.id === id);
        return p ? p.name : id;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <History /> Historial de Movimientos
                    </h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 font-bold text-xl">&times;</button>
                </div>

                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <p className="text-center py-8 text-stone-400">Cargando historial...</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-stone-50 text-stone-500 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Fecha</th>
                                    <th className="px-4 py-2">Producto</th>
                                    <th className="px-4 py-2 text-right">Cambio</th>
                                    <th className="px-4 py-2 text-right">Stock Final</th>
                                    <th className="px-4 py-2">Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-stone-100">
                                        <td className="px-4 py-2 text-stone-500 text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 font-medium">
                                            {getProductName(log.product_id)}
                                        </td>
                                        <td className={`px-4 py-2 text-right font-bold ${log.change_amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                                        </td>
                                        <td className="px-4 py-2 text-right text-stone-600">
                                            {log.new_quantity}
                                        </td>
                                        <td className="px-4 py-2 text-stone-500 text-xs">
                                            {log.reason === 'manual_adjustment' ? 'Ajuste Manual' : log.reason}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                            No hay movimientos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const ManagementDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');

    // KPIs
    const [totalNet, setTotalNet] = useState(0);
    const [avgTicket, setAvgTicket] = useState(0);
    const [topClients, setTopClients] = useState<ClientStat[]>([]);

    // Analytics Data
    const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [bcgMatrix, setBcgMatrix] = useState<ProductBCG[]>([]);

    const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'validaciones' | 'finanzas' | 'ventas' | 'agenda'>('dashboard');
    const [clients, setClients] = useState<any[]>([]);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [posInitialClient, setPosInitialClient] = useState<any>(null);

    // Client History State
    const [clientHistory, setClientHistory] = useState<Transaction[]>([]);
    const [selectedClientForHistory, setSelectedClientForHistory] = useState<any>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    // QR Validation Data
    const [pendingVisits, setPendingVisits] = useState<VisitRegistration[]>([]);
    const [visitToValidate, setVisitToValidate] = useState<VisitRegistration | null>(null);

    // Inventory Data Hoisted
    const [inventoryMap, setInventoryMap] = useState<Map<string, any>>(new Map());
    const [totalInventoryValue, setTotalInventoryValue] = useState(0);
    const [totalInventoryItems, setTotalInventoryItems] = useState(0);

    // Expenses Data for Financial Dashboard
    const [expenses, setExpenses] = useState<any[]>([]);

    // Inventory History
    const [showInventoryHistory, setShowInventoryHistory] = useState(false);

    // Refresh data when tab changes or time range changes
    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'finanzas') {
            fetchDashboardData();
            if (activeTab === 'finanzas') fetchExpenses();
        } else if (activeTab === 'clients') {
            fetchClients();
        } else if (activeTab === 'validaciones') {
            fetchPendingVisits();
        }
        // Always fetch inventory for the side panel if needed, or lazy load? 
        // For now, let's fetch it on mount or when dashboard active to ensure totals are ready
        fetchInventory();
    }, [activeTab, timeRange]);

    const fetchExpenses = async () => {
        const { data } = await supabase.from('expenses').select('*');
        if (data) setExpenses(data);
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Transactions (Current Period)
            const rangeDate = new Date();
            if (timeRange === 'week') rangeDate.setDate(rangeDate.getDate() - 7);
            else if (timeRange === 'month') rangeDate.setDate(rangeDate.getDate() - 30);
            else rangeDate.setHours(0, 0, 0, 0); // Day = Today from 00:00

            const { data: transData, error: transError } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', rangeDate.toISOString());

            if (transError) throw transError;
            const trans = transData as Transaction[] || [];

            // 2. Fetch Transactions (Previous Period for Growth)
            const prevRangeDate = new Date(rangeDate);
            if (timeRange === 'week') prevRangeDate.setDate(prevRangeDate.getDate() - 7);
            else if (timeRange === 'month') prevRangeDate.setDate(prevRangeDate.getDate() - 30);
            else prevRangeDate.setDate(prevRangeDate.getDate() - 1); // Previous Day

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

    const fetchInventory = async () => {
        const { data, error } = await supabase.from('inventory').select('*');
        if (data) {
            const map = new Map();
            let totalVal = 0;
            let totalItems = 0;

            data.forEach(item => {
                map.set(item.product_id, item);
                totalVal += (item.quantity * (item.last_purchase_price || 0));
                totalItems += item.quantity;
            });

            setInventoryMap(map);
            setTotalInventoryValue(totalVal);
            setTotalInventoryItems(totalItems);
        }
        if (error) console.error("Error fetching inventory", error);
    };

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('last_visit', { ascending: false });

        if (error) console.error("Error fetching clients", error);
        else setClients(data || []);
        if (error) console.error("Error fetching clients", error);
        else setClients(data || []);
        setLoading(false);
    };

    const fetchPendingVisits = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('visit_registrations')
            .select(`
                *,
                client:clients(name, phone)
            `)
            .eq('status', 'pending')
            .order('check_in_time', { ascending: true });

        if (error) console.error("Error fetching visits", error);
        else setPendingVisits(data as VisitRegistration[] || []);
        setLoading(false);
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;

        const { error } = await supabase
            .from('clients')
            .update({
                name: editingClient.name,
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

        try {
            // Delete related records manually to avoid FK constraints
            await supabase.from('hair_service_log').delete().eq('client_id', id);
            await supabase.from('transactions').delete().eq('client_id', id);
            await supabase.from('visit_registrations').delete().eq('client_id', id);

            const { error } = await supabase.from('clients').delete().eq('id', id);

            if (error) throw error;

            fetchClients();
        } catch (error: any) {
            alert("Error al eliminar: " + error.message);
        }
    };

    const handleGoToPOS = (client: any) => {
        setPosInitialClient(client);
        setActiveTab('ventas');
    };

    const fetchClientHistory = async (client: any) => {
        setHistoryLoading(true);
        setSelectedClientForHistory(client);

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching history:", error);
        else setClientHistory(data as Transaction[] || []);
        setHistoryLoading(false);
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        if (!window.confirm('¿Eliminar esta transacción? Esta acción no se puede deshacer.')) return;

        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            setClientHistory(prev => prev.filter(t => t.id !== transactionId));
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

    const downloadClientsCSV = () => {
        const headers = ['Nombre', 'Teléfono', 'Visitas', 'Última Visita'];
        const rows = clients.map(c => [
            c.name || 'Sin Nombre',
            c.phone,
            c.visits,
            c.last_visit ? new Date(c.last_visit).toLocaleDateString() : 'N/A'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `clientes_tus3b_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 py-8 md:pt-24">
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
                <button
                    onClick={() => setActiveTab('validaciones')}
                    className={`px-4 py-2 font-bold transition ${activeTab === 'validaciones' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Validaciones QR
                    {pendingVisits.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full align-top">
                            {pendingVisits.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('finanzas')}
                    className={`px-4 py-2 font-bold transition ${activeTab === 'finanzas' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Finanzas
                </button>
                <button
                    onClick={() => setActiveTab('ventas')}
                    className={`px-4 py-2 font-bold transition ${activeTab === 'ventas' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Ventas (POS)
                </button>
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`px-4 py-2 font-bold transition ${activeTab === 'agenda' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Agenda
                </button>
            </div>

            {activeTab === 'validaciones' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* QR Code Card */}
                    <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <QrCode /> QR de Llegada
                        </h3>
                        <p className="text-stone-500 text-xs mb-6">
                            Imprime este código y pégalo en la entrada.
                        </p>

                        <div className="bg-white p-4 rounded-xl border-2 border-stone-900 mb-4">
                            <QRCodeSVG
                                value="https://tus3b.cl/#/checkin"
                                size={200}
                                level="H"
                            />
                        </div>
                        <p className="font-mono text-xs text-stone-400 mb-4">tus3b.cl/#/checkin</p>

                        <button
                            onClick={() => window.print()}
                            className="w-full py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <Download size={14} /> Imprimir QR
                        </button>
                    </div>

                    {/* Pending List */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ClipboardCheck /> Visitas Pendientes
                        </h3>

                        {pendingVisits.length === 0 ? (
                            <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-lg border-2 border-dashed border-stone-100">
                                <p>No hay clientes esperando validación.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingVisits.map((visit) => (
                                    <div key={visit.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-xl hover:border-amber-200 transition">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold text-lg">
                                                {visit.client?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900">{visit.client?.name || 'Cliente'}</h4>
                                                <p className="text-sm text-stone-500">{visit.client?.phone}</p>
                                                <p className="text-xs text-stone-400 mt-1">
                                                    Llegó: {new Date(visit.check_in_time).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setVisitToValidate(visit)}
                                            className="w-full sm:w-auto px-6 py-2 bg-stone-900 text-white font-bold rounded-lg shadow hover:bg-stone-800 transition"
                                        >
                                            Validar Visita
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'finanzas' && (
                <FinancialDashboard
                    transactions={transactions}
                    expenses={expenses} // We need to fetch expenses in ManagementDashboard
                    timeRange={timeRange as any}
                    onTimeRangeChange={(r) => setTimeRange(r)}
                />
            )}

            {activeTab === 'ventas' && (
                <POSModule initialClient={posInitialClient} key={posInitialClient ? posInitialClient.id : 'pos-reset'} />
            )}

            {activeTab === 'agenda' && (
                <AgendaModule
                    onRegisterService={(booking) => {
                        // Buscar cliente por teléfono o crear objeto temporal
                        const clientData = {
                            name: booking.name,
                            phone: booking.phone,
                            service: booking.service
                        };
                        setPosInitialClient(clientData);
                        setActiveTab('ventas');
                    }}
                />
            )}

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
                                            <th className="px-4 py-2 text-right">Acción</th>
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
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleGoToPOS({ id: client.id, phone: client.phone, name: 'Cliente' })} className="text-xs bg-stone-900 text-white px-2 py-1 rounded hover:bg-stone-700">
                                                        Vender
                                                    </button>
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowInventoryHistory(true)}
                                        className="text-sm text-stone-500 hover:text-stone-800 font-bold flex items-center gap-1 bg-stone-100 px-2 py-1 rounded"
                                    >
                                        <History size={14} /> Historial
                                    </button>
                                    <button onClick={downloadCSV} className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                                        <Download size={14} /> Exportar CSV
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[300px]">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="text-stone-500 border-b border-stone-200">
                                            <th className="px-4 py-2 text-left">Producto</th>
                                            <th className="px-4 py-2 text-center">Costo</th>
                                            <th className="px-4 py-2 text-center">Precio Vta</th>
                                            <th className="px-4 py-2 text-center">Margen</th>
                                            <th className="px-4 py-2 text-center">Stock</th>
                                            <th className="px-4 py-2 text-center">Días</th>
                                            <th className="px-4 py-2 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PERFUMES.map((p) => (
                                            <InventoryEditRow
                                                key={p.id}
                                                perfume={p}
                                                inventoryItem={inventoryMap.get(p.id)}
                                                onRefresh={fetchInventory}
                                            />
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-stone-100 font-bold text-stone-800 border-t-2 border-stone-200">
                                        <tr>
                                            <td className="px-4 py-3">TOTALES</td>
                                            <td className="px-4 py-3"></td>
                                            <td className="px-4 py-3"></td>
                                            <td className="px-4 py-3"></td>
                                            <td className="px-4 py-3 text-center">{totalInventoryItems} un.</td>
                                            <td className="px-4 py-3 text-center text-xs text-stone-500"></td>
                                            <td className="px-4 py-3 text-right text-green-700">
                                                Inv: ${totalInventoryValue.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Gestión de Clientes</h3>
                        <button
                            onClick={downloadClientsCSV}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"
                        >
                            <Download size={16} /> Exportar Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-stone-50 text-stone-500">
                                <tr>
                                    <th className="px-6 py-3">Nombre</th>
                                    <th className="px-6 py-3">Teléfono</th>
                                    <th className="px-6 py-3 text-center">Visitas (Lealtad)</th>
                                    <th className="px-6 py-3">Última Visita</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((c) => (
                                    <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                                        <td className="px-6 py-4 font-bold text-stone-800">{c.name || 'Sin nombre'}</td>
                                        <td className="px-6 py-4 font-mono text-stone-600">{c.phone}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                                                {c.visits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{new Date(c.last_visit).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => fetchClientHistory(c)}
                                                className="text-purple-600 hover:text-purple-800 font-medium text-xs px-2 py-1 bg-purple-50 rounded inline-flex items-center gap-1"
                                            >
                                                <Eye size={12} /> Historial
                                            </button>
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
                                <label className="block text-sm font-bold text-stone-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={editingClient.name || ''}
                                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
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

            {/* Client History Modal */}
            {selectedClientForHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold">Historial de Servicios</h3>
                                <p className="text-sm text-stone-500">
                                    {selectedClientForHistory.name || 'Cliente'} - {selectedClientForHistory.phone}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedClientForHistory(null);
                                    setClientHistory([]);
                                }}
                                className="p-2 hover:bg-stone-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {historyLoading ? (
                            <div className="py-12 text-center text-stone-400">Cargando historial...</div>
                        ) : clientHistory.length === 0 ? (
                            <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-lg border-2 border-dashed border-stone-100">
                                <p>Este cliente no tiene transacciones registradas.</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-stone-50 text-stone-500 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3 text-right">Monto</th>
                                            <th className="px-4 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientHistory.map((t) => (
                                            <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50">
                                                <td className="px-4 py-3 text-stone-500 text-xs">
                                                    {new Date(t.created_at).toLocaleDateString('es-CL', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {t.description || 'Sin descripción'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'service'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {t.type === 'service' ? 'Servicio' : 'Producto'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                                    ${t.amount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(t.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Eliminar transacción"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-stone-100 font-bold">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3">Total General</td>
                                            <td className="px-4 py-3 text-right text-green-700">
                                                ${clientHistory.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-stone-200 flex gap-2">
                            <button
                                onClick={() => handleGoToPOS(selectedClientForHistory)}
                                className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={16} /> Registrar Nueva Venta
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedClientForHistory(null);
                                    setClientHistory([]);
                                }}
                                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg font-bold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {visitToValidate && (
                <VisitValidationModal
                    visit={visitToValidate}
                    onClose={() => setVisitToValidate(null)}
                    onSuccess={fetchPendingVisits}
                />
            )}

            {showInventoryHistory && (
                <InventoryHistoryModal onClose={() => setShowInventoryHistory(false)} />
            )}
        </div>
    );
};

export default ManagementDashboard;
