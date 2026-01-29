import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES, SERVICES } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, PieChart, Activity, Users, Edit2, Save, RefreshCw } from 'lucide-react';

interface FinancialDashboardProps {
    transactions: any[];
    expenses: any[];
    timeRange: 'day' | 'week' | 'month';
    onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
    onRefresh?: () => void;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ transactions, expenses, timeRange, onTimeRangeChange, onRefresh }) => {
    // Aggregated Data State
    const [areaStats, setAreaStats] = useState<any[]>([]);
    const [investmentStats, setInvestmentStats] = useState<any>({ invested: 0, recovered: 0 });

    // Service Costs State (editable)
    const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
    const [editingService, setEditingService] = useState<string | null>(null);
    const [tempCost, setTempCost] = useState<string>('');

    const updateTransactionCost = async (id: string, newCost: number) => {
        try {
            const { error } = await supabase.from('transactions').update({ cost: newCost }).eq('id', id);
            if (error) throw error;
            if (onRefresh) onRefresh();
        } catch (e: any) {
            alert("Error actualizando costo: " + e.message);
        }
    };

    useEffect(() => {
        calculateStats();
        loadServiceCosts();
    }, [transactions, expenses]);

    const loadServiceCosts = async () => {
        try {
            const { data, error } = await supabase.from('service_costs').select('*');
            if (data) {
                const costs: Record<string, number> = {};
                // Initialize with 0 for all services first
                SERVICES.forEach(s => { costs[s.id] = 0; });

                // Override with DB values
                data.forEach((item: any) => {
                    costs[item.service_id] = item.cost;
                });
                setServiceCosts(costs);
            }
            if (error) console.error("Error loading service costs:", error);
        } catch (err) {
            console.error("Failed to load costs:", err);
        }
    };

    const saveServiceCost = async (serviceId: string, cost: number) => {
        try {
            const { error } = await supabase
                .from('service_costs')
                .upsert({ service_id: serviceId, cost: cost }, { onConflict: 'service_id' });

            if (error) throw error;

            const updated = { ...serviceCosts, [serviceId]: cost };
            setServiceCosts(updated);
            setEditingService(null);
        } catch (err: any) {
            alert('Error guardando costo: ' + err.message);
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

            // Determine Area
            if (t.type === 'product') {
                if (t.description?.includes('Regalito') || t.description?.includes('Amor')) {
                    area = 'Amor Amor';
                } else {
                    area = 'Perfum';
                }
            } else {
                area = 'Style';
            }

            // Sum up
            if (stats[area as keyof typeof stats]) {
                const current = stats[area as keyof typeof stats];
                current.sales += t.amount;
                current.extras += (t.additional_cost || 0);
                current.count += 1;
                // Cost uses transaction cost if available, else 0 (unless we implemented estimation logic inside calculateStats, 
                // but detailed logic is now in the table row).
                // For aggregated area stats, we should ideally sum t.cost.
                current.cost += (t.cost || 0);
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
        const totalInvested = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalRecovered = transactions.reduce((sum, t) => sum + t.amount, 0);
        setInvestmentStats({ invested: totalInvested, recovered: totalRecovered });
    };

    // Dynamic Services Logic
    const allServices = React.useMemo(() => {
        const knownIds = new Set(SERVICES.map(s => s.id));
        const knownNames = new Set(SERVICES.map(s => s.name));

        const dynamicVars: any[] = [];

        transactions.forEach(t => {
            if (t.type === 'service' && t.description) {
                const name = t.description;
                // Si no coincide exactamente con un servicio conocido
                if (!knownNames.has(name)) {
                    // Verificar si ya lo descubrimos en esta iteración
                    if (!dynamicVars.find(d => d.name === name)) {
                        dynamicVars.push({
                            id: name, // Usar nombre como ID para estos casos
                            name: name,
                            price: 0, // Precio variable, se calculará promedio en la tabla
                            isDynamic: true
                        });
                    }
                }
            }
        });

        return [...SERVICES, ...dynamicVars];
    }, [transactions]);

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

            {/* ========== NUEVA SECCIÓN: GESTIÓN DE SERVICIOS Y RENTABILIDAD ========== */}
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
                                    <th className="px-2 py-2 text-right">Precio Prom.</th>
                                    <th className="px-2 py-2 text-right">Costo</th>
                                    <th className="px-2 py-2 text-right">Margen</th>
                                    <th className="px-2 py-2 text-right">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {allServices.map(service => {
                                    const cost = serviceCosts[service.id] || 0;

                                    // Calculate average price if dynamic or static
                                    let avgPrice = service.price || 0;
                                    if (service.isDynamic || !avgPrice) {
                                        // Find transactions for this service to calculate avg
                                        const serviceTx = transactions.filter(t => t.description === service.name && t.amount > 0);
                                        if (serviceTx.length > 0) {
                                            const total = serviceTx.reduce((sum, t) => sum + t.amount, 0);
                                            avgPrice = total / serviceTx.length;
                                        }
                                    }

                                    const margin = avgPrice - cost;
                                    const marginPercent = avgPrice > 0 ? Math.round((margin / avgPrice) * 100) : 0;

                                    return (
                                        <tr key={service.id} className="hover:bg-stone-50">
                                            <td className="px-2 py-3 font-medium text-stone-700">
                                                {service.name}
                                                {service.isDynamic && <span className="text-[10px] text-blue-500 ml-1">(Nuevo)</span>}
                                            </td>
                                            <td className="px-2 py-3 text-right text-stone-600">${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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

                {/* Rentabilidad por Cliente / Visita */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Users size={20} className="text-blue-600" /> Vista de Ingreso, Costo y Margen por Cliente
                        </h3>
                    </div>
                    <p className="text-xs text-stone-400 mb-4">Detalle de visitas. Edita el costo manual si difiere del estándar.</p>

                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-stone-400 bg-stone-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-left">Servicio/Producto</th>
                                    <th className="px-4 py-3 text-right">Venta</th>
                                    <th className="px-4 py-3 text-right">Costo (Edit)</th>
                                    <th className="px-4 py-3 text-right">Margen</th>
                                    <th className="px-4 py-3 text-right">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-stone-400">
                                            No hay transacciones en este periodo.
                                        </td>
                                    </tr>
                                )}
                                {transactions.map(t => {
                                    // Heuristica para costo estandar
                                    let stdCost = 0;
                                    if (!t.cost && t.type === 'service') {
                                        const svc = SERVICES.find(s => t.description?.includes(s.name));
                                        if (svc) stdCost = serviceCosts[svc.id] || 0;
                                    }

                                    return (
                                        <ProfitabilityRow
                                            key={t.id}
                                            transaction={t}
                                            serviceCostStd={stdCost}
                                            onUpdate={updateTransactionCost}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfitabilityRow = ({ transaction, serviceCostStd, onUpdate }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cost, setCost] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCost(transaction.cost !== undefined && transaction.cost !== null ? transaction.cost : serviceCostStd);
    }, [transaction.cost, serviceCostStd]);

    const margin = transaction.amount - cost;
    const marginPercent = transaction.amount > 0 ? (margin / transaction.amount) * 100 : 0;

    const handleSave = async () => {
        setLoading(true);
        await onUpdate(transaction.id, cost);
        setLoading(false);
        setIsEditing(false);
    };

    return (
        <tr className="hover:bg-stone-50 border-b border-stone-100 last:border-0">
            <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{new Date(transaction.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-3">
                <div className="font-medium text-stone-800">{transaction.client?.name || 'Cliente Casual'}</div>
                <div className="text-xs text-stone-400">{transaction.client?.phone || ''}</div>
            </td>
            <td className="px-4 py-3 text-stone-600">
                <div className="text-sm truncate max-w-[200px]" title={transaction.description}>{transaction.description || transaction.type}</div>
            </td>
            <td className="px-4 py-3 text-right text-stone-800 font-medium">${transaction.amount.toLocaleString()}</td>
            <td className="px-4 py-3 text-right">
                {isEditing ? (
                    <div className="flex items-center justify-end gap-1">
                        <input
                            type="number"
                            value={cost}
                            onChange={e => setCost(Number(e.target.value))}
                            className="w-20 border border-stone-300 rounded px-2 py-1 text-right text-sm focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <button onClick={handleSave} disabled={loading} className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded">
                            <Save size={16} />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-stone-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors text-sm flex items-center justify-end w-full gap-1 group">
                        ${cost.toLocaleString()}
                        <Edit2 size={12} className="opacity-0 group-hover:opacity-100" />
                    </button>
                )}
            </td>
            <td className={`px-4 py-3 text-right font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                ${margin.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-right text-xs text-stone-400">
                {marginPercent.toFixed(0)}%
            </td>
        </tr>
    );
};

export default FinancialDashboard;
