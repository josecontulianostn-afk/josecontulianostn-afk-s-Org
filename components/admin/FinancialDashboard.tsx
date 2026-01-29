import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES, SERVICES } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, PieChart, Activity, Calendar, Users, Edit2, Save, RefreshCw } from 'lucide-react';

interface FinancialDashboardProps {
    transactions: any[];
    expenses: any[];
    timeRange: 'day' | 'week' | 'month';
    onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ transactions, expenses, timeRange, onTimeRangeChange }) => {
    // Aggregated Data State
    const [areaStats, setAreaStats] = useState<any[]>([]);
    const [investmentStats, setInvestmentStats] = useState<any>({ invested: 0, recovered: 0 });
    const [trendData, setTrendData] = useState<any[]>([]);

    // Service Costs State (editable)
    const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
    const [editingService, setEditingService] = useState<string | null>(null);
    const [tempCost, setTempCost] = useState<string>('');

    // Client Stats State
    const [clientStats, setClientStats] = useState<any[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);

    useEffect(() => {
        calculateStats();
        loadServiceCosts();
        loadClientStats();
    }, [transactions, expenses]);

    const loadServiceCosts = async () => {
        // Intentar cargar costos guardados desde localStorage
        const saved = localStorage.getItem('serviceCosts');
        if (saved) {
            setServiceCosts(JSON.parse(saved));
        } else {
            // Inicializar con 0
            const initial: Record<string, number> = {};
            SERVICES.forEach(s => { initial[s.id] = 0; });
            setServiceCosts(initial);
        }
    };

    const saveServiceCost = (serviceId: string, cost: number) => {
        const updated = { ...serviceCosts, [serviceId]: cost };
        setServiceCosts(updated);
        localStorage.setItem('serviceCosts', JSON.stringify(updated));
        setEditingService(null);
    };

    const loadClientStats = async () => {
        setLoadingClients(true);
        try {
            // Obtener clientes con sus estadísticas
            const { data: clients, error: clientError } = await supabase
                .from('clients')
                .select('id, name, phone, visits, created_at')
                .order('visits', { ascending: false });

            if (clientError) throw clientError;

            // Obtener totales de transacciones por cliente
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('client_id, amount');

            if (txError) throw txError;

            // Calcular totales por cliente
            const totalsByClient = new Map<string, { total: number, count: number }>();
            txData?.forEach(tx => {
                if (tx.client_id) {
                    const current = totalsByClient.get(tx.client_id) || { total: 0, count: 0 };
                    current.total += tx.amount;
                    current.count += 1;
                    totalsByClient.set(tx.client_id, current);
                }
            });

            // Combinar datos
            const combined = clients?.map(client => ({
                ...client,
                totalSpent: totalsByClient.get(client.id)?.total || 0,
                transactionCount: totalsByClient.get(client.id)?.count || 0,
                avgTicket: totalsByClient.get(client.id)
                    ? Math.round(totalsByClient.get(client.id)!.total / totalsByClient.get(client.id)!.count)
                    : 0
            })) || [];

            setClientStats(combined);
        } catch (err) {
            console.error('Error loading client stats:', err);
        } finally {
            setLoadingClients(false);
        }
    };

    const calculateStats = () => {
        // 1. Area Stats (Style, Perfum, Amor Amor)
        const stats = {
            Style: { sales: 0, cost: 0, extras: 0, count: 0 },
            Perfum: { sales: 0, cost: 0, extras: 0, count: 0 },
            'Amor Amor': { sales: 0, cost: 0, extras: 0, count: 0 }
        };

        transactions.forEach(t => {
            let area = 'Style'; // Default
            let unitCost = 0;

            // Determine Area & Unit Cost
            if (t.type === 'product') {
                // Try to match product to get category (Perfum or Amor Amor?)
                // Simple heuristic: if description contains "Regalito" -> Amor Amor, else Perfum
                if (t.description?.includes('Regalito') || t.description?.includes('Amor')) {
                    area = 'Amor Amor';
                    // We need cost for gifts. Assuming fixed margin or cost for now? 
                    // Let's assume 70% cost for gifts if not found? Or better, 0 if unknown.
                } else {
                    area = 'Perfum';
                    // Find perfume cost
                    // Heuristic: match price? or description name?
                    const p = PERFUMES.find(p => t.description?.includes(p.name));
                    if (p) {
                        // We need raw cost. 'priceFullBottle' is retail. 
                        // We don't have unit cost in constants easily accessibly mapped to transactions without ID.
                        // But we can try. 
                        // *Improvement*: Store product_id in transaction metadata for exact cost lookup.
                        // For now: assume 50% margin if unknown, or 0 cost.
                    }
                }
            } else {
                area = 'Style';
                // Service costs are usually Labor + Supplies. 
                // We rely on 'additional_cost' for supplies. Labor is internal.
                // So Unit Cost = 0 (unless we define fixed costs per service).
            }

            // Sum up
            if (stats[area as keyof typeof stats]) {
                const current = stats[area as keyof typeof stats];
                current.sales += t.amount;
                current.extras += (t.additional_cost || 0);
                current.count += 1;
                // Add estimated unit cost if logic allowed, for now 0
                current.cost += 0;
            }
        });

        const formattedAreaStats = Object.keys(stats).map(key => {
            const s = stats[key as keyof typeof stats];
            const netMargin = s.sales - s.cost - s.extras;
            const marginPercent = s.sales > 0 ? (netMargin / s.sales) * 100 : 0;
            return {
                name: key,
                Ventas: s.sales,
                'Costo Extra': s.extras,
                Margen: netMargin,
                'Margen %': Math.round(marginPercent)
            };
        });

        setAreaStats(formattedAreaStats);

        // 2. Investment Stats
        // Invested: Sum of all expenses (Category: 'Materiales', 'Insumos', 'Productos', etc)
        // Recovered: Sum of all Sales (Revenue)
        const totalInvested = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalRecovered = transactions.reduce((sum, t) => sum + t.amount, 0);
        setInvestmentStats({ invested: totalInvested, recovered: totalRecovered });


        // 3. Trend Data (Daily/Weekly based on filter?)
        // Let's show Daily trend for the selected period
        // ... (Simplified for now to just show area stats logic)
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Filters */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <Activity className="text-emerald-600" />
                    Resumen Financiero
                </h2>
                <div className="flex gap-2">
                    {['day', 'week', 'month'].map((r) => (
                        <button
                            key={r}
                            onClick={() => onTimeRangeChange(r as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${timeRange === r ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                        >
                            {r === 'day' ? 'Hoy' : r === 'week' ? 'Semana' : 'Mes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Investment Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Inversión Total (Gastos)</p>
                        <h3 className="text-4xl font-mono font-bold text-red-400 mb-1">
                            ${investmentStats.invested.toLocaleString()}
                        </h3>
                        <p className="text-xs text-stone-500">Acumulado histórico de compras/gastos</p>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <DollarSign size={120} />
                    </div>
                </div>

                <div className="bg-emerald-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-emerald-200 text-sm font-bold uppercase tracking-wider mb-2">Recuperado (Ventas)</p>
                        <h3 className="text-4xl font-mono font-bold text-emerald-400 mb-1">
                            ${investmentStats.recovered.toLocaleString()}
                        </h3>
                        <p className="text-xs text-emerald-200/50">
                            {investmentStats.invested > 0
                                ? `${((investmentStats.recovered / investmentStats.invested) * 100).toFixed(1)}% de la inversión recuperada`
                                : 'Calculando retorno...'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart: Sales vs Margin by Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <TrendingUp size={20} /> Rendimiento por Área
                    </h3>
                    <div className="h-[300px] w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={areaStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Margen" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Costo Extra" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <PieChart size={20} /> Detalle de Márgenes
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-stone-400 bg-stone-50">
                                <tr>
                                    <th className="px-2 py-2 text-left">Área</th>
                                    <th className="px-2 py-2 text-right">Margen $</th>
                                    <th className="px-2 py-2 text-right">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {areaStats.map((area: any) => (
                                    <tr key={area.name}>
                                        <td className="px-2 py-3 font-medium">{area.name}</td>
                                        <td className={`px-2 py-3 text-right font-bold ${area.Margen > 0 ? 'text-emerald-600' : 'text-stone-500'}`}>
                                            ${area.Margen.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-3 text-right text-stone-500">
                                            {area['Margen %']}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-xl text-xs text-blue-700">
                        <p className="font-bold mb-1">💡 Tip:</p>
                        <p>El "Margen" descuenta los Costos Extra ingresados (luz, café, etc). Para aumentar el margen en "Style", asegúrate de registrar todos los insumos variables.</p>
                    </div>
                </div>
            </div>

            {/* ========== NUEVA SECCIÓN: GESTIÓN DE SERVICIOS Y CLIENTES ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gestión de Costos de Servicios */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Edit2 size={20} className="text-purple-600" /> Costos de Servicios
                    </h3>
                    <p className="text-xs text-stone-400 mb-4">Ingresa el costo de insumos por servicio para calcular márgenes reales.</p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-stone-400 bg-stone-50">
                                <tr>
                                    <th className="px-2 py-2 text-left">Servicio</th>
                                    <th className="px-2 py-2 text-right">Precio</th>
                                    <th className="px-2 py-2 text-right">Costo</th>
                                    <th className="px-2 py-2 text-right">Margen</th>
                                    <th className="px-2 py-2 text-right">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {SERVICES.map(service => {
                                    const cost = serviceCosts[service.id] || 0;
                                    const margin = service.price - cost;
                                    const marginPercent = service.price > 0 ? Math.round((margin / service.price) * 100) : 0;

                                    return (
                                        <tr key={service.id} className="hover:bg-stone-50">
                                            <td className="px-2 py-3 font-medium text-stone-700">{service.name}</td>
                                            <td className="px-2 py-3 text-right text-stone-600">${service.price.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right">
                                                {editingService === service.id ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <input
                                                            type="number"
                                                            value={tempCost}
                                                            onChange={(e) => setTempCost(e.target.value)}
                                                            className="w-16 border rounded px-1 py-0.5 text-right text-sm"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => saveServiceCost(service.id, parseInt(tempCost) || 0)}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingService(service.id);
                                                            setTempCost(cost.toString());
                                                        }}
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        ${cost.toLocaleString()}
                                                    </button>
                                                )}
                                            </td>
                                            <td className={`px-2 py-3 text-right font-bold ${margin > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                ${margin.toLocaleString()}
                                            </td>
                                            <td className="px-2 py-3 text-right text-stone-500">{marginPercent}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Estadísticas de Clientes */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Users size={20} className="text-blue-600" /> Gestión de Clientes
                        </h3>
                        <button
                            onClick={loadClientStats}
                            disabled={loadingClients}
                            className="text-stone-400 hover:text-stone-600 p-1"
                        >
                            <RefreshCw size={16} className={loadingClients ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <p className="text-xs text-stone-400 mb-4">Retornos y totales acumulados por cliente.</p>

                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-stone-400 bg-stone-50 sticky top-0">
                                <tr>
                                    <th className="px-2 py-2 text-left">Cliente</th>
                                    <th className="px-2 py-2 text-center">Visitas</th>
                                    <th className="px-2 py-2 text-right">Total $</th>
                                    <th className="px-2 py-2 text-right">Ticket Prom.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {clientStats.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-stone-400">
                                            {loadingClients ? 'Cargando...' : 'No hay clientes registrados'}
                                        </td>
                                    </tr>
                                )}
                                {clientStats.map(client => (
                                    <tr key={client.id} className="hover:bg-stone-50">
                                        <td className="px-2 py-3">
                                            <div className="font-medium text-stone-700">{client.name || 'Sin nombre'}</div>
                                            <div className="text-xs text-stone-400">{client.phone}</div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${client.visits >= 5 ? 'bg-green-100 text-green-700' :
                                                    client.visits >= 2 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-stone-100 text-stone-600'
                                                }`}>
                                                {client.visits || 0}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-right font-bold text-emerald-600">
                                            ${client.totalSpent.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-3 text-right text-stone-500">
                                            ${client.avgTicket.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {clientStats.length > 0 && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-stone-600">Total Clientes: <strong>{clientStats.length}</strong></span>
                                <span className="text-emerald-600 font-bold">
                                    Ingresos Totales: ${clientStats.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialDashboard;

