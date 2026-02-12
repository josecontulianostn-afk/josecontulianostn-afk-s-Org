import React, { useState, useEffect } from 'react';
import { Search, Plus, X, ShoppingCart, CreditCard, RotateCcw, RefreshCw, Trash2, Edit2, Package, User, ShoppingBag, UserPlus, Crown } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES, SERVICES } from '../../constants';

interface POSModuleProps {
    initialClient?: any;
}

const POSModule: React.FC<POSModuleProps> = ({ initialClient }) => {
    // POS State
    const [cart, setCart] = useState<any[]>([]);
    const [posClient, setPosClient] = useState<any>(initialClient || null);
    const [posSearchTerm, setPosSearchTerm] = useState('');
    const [posProductSearch, setPosProductSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [message, setMessage] = useState('');

    // Inventory products from DB
    const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);

    // Manual Item State
    const [manualItemName, setManualItemName] = useState('');
    const [manualItemPrice, setManualItemPrice] = useState('');

    // Recent Transactions State
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (initialClient) setPosClient(initialClient);
        fetchInventoryProducts();
        loadRecentTransactions();
    }, [initialClient]);

    const fetchInventoryProducts = async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .gt('quantity', 0)
            .order('name', { ascending: true });
        if (data) setInventoryProducts(data);
    };

    const loadRecentTransactions = async () => {
        setLoadingHistory(true);
        // Cargar ventas de los últimos 7 días para dar margen de corrección
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 7);

        const { data, error } = await supabase
            .from('transactions')
            .select('*, clients(name)')
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setRecentTransactions(data);
        }
        setLoadingHistory(false);
    };

    const fetchClients = async (search: string) => {
        if (!search || search.length < 2) {
            setClients([]);
            return;
        }
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .or(`phone.ilike.%${search}%,name.ilike.%${search}%`)
            .limit(10);

        if (data) setClients(data);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchClients(posSearchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [posSearchTerm]);

    const addToCart = (product: any, type: 'product' | 'gift' | 'service', variant?: string, customPrice?: number) => {
        const variantKey = variant || (type === 'product' ? '10ml' : 'standard');
        const cartId = `${product.id}-${variantKey}`;

        const existing = cart.find(item => item.cartId === cartId);
        if (existing) {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item));
        } else {
            let price = customPrice || 0;
            if (!customPrice) {
                if (type === 'product') { // Perfumes from constants
                    if (variant === '5ml') price = product.price5ml || product.price || 0;
                    else if (variant === '10ml') price = product.price10ml || 0;
                    else if (variant === 'Botella') price = product.priceFullBottle || 0;
                    else price = product.price || 0;
                }
                if (type === 'gift') price = product.price || 0;
                if (type === 'service') price = product.price || 0;
            }

            setCart([...cart, { ...product, cartId, type, qty: 1, price, variant: variantKey }]);
        }
        setMessage(`Agregado: ${product.name} (${variantKey})`);
        setTimeout(() => setMessage(''), 2000);
    };

    const addManualItem = () => {
        if (!manualItemName || !manualItemPrice) {
            alert("Por favor ingrese nombre y precio del item.");
            return;
        }
        const price = parseInt(manualItemPrice);
        if (isNaN(price)) {
            alert("El precio debe ser un número válido.");
            return;
        }

        const newItem = {
            id: 'manual-' + Date.now(),
            name: manualItemName,
            price: price,
            type: 'service',
            qty: 1,
            variant: 'manual',
            stock: false,
            cartId: 'manual-' + Date.now()
        };

        setCart(prev => [...prev, newItem]);
        setManualItemName('');
        setManualItemPrice('');
        setMessage(`Item "${manualItemName}" agregado al carrito ($${price})`);
        setTimeout(() => setMessage(''), 3000);
    };

    const removeFromCart = (cartId: string) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const updateCartQty = (cartId: string, qty: number) => {
        if (qty < 1) return;
        setCart(cart.map(item => item.cartId === cartId ? { ...item, qty } : item));
    };

    const updateCartPrice = (cartId: string, newPrice: string) => {
        if (newPrice === '') {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, price: 0 } : item));
            return;
        }
        const price = parseInt(newPrice);
        if (isNaN(price)) return;
        setCart(cart.map(item => item.cartId === cartId ? { ...item, price } : item));
    };

    const handleQuickCreateClient = async () => {
        const phone = prompt(`Ingresa el teléfono para el nuevo cliente "${posSearchTerm}":`, "+569");
        if (!phone) return;

        try {
            // Verificar si existe por si acaso
            const { data: existing } = await supabase.from('clients').select('id, name, phone').eq('phone', phone).single();
            if (existing) {
                alert(`El cliente ya existe: ${existing.name}`);
                setPosClient(existing);
                setPosSearchTerm('');
                return;
            }

            const generateToken = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            const { data: newClient, error } = await supabase
                .from('clients')
                .insert({
                    name: posSearchTerm,
                    phone: phone,
                    visits: 1,
                    member_token: generateToken()
                })
                .select()
                .single();

            if (error) throw error;

            alert(`✅ Cliente creado: ${newClient.name}`);
            setPosClient(newClient);
            setPosSearchTerm('');
        } catch (err: any) {
            alert("Error creando cliente: " + err.message);
        }
    };

    const handleAssignClientToTransaction = async (txId: string) => {
        if (!posClient || !posClient.id) {
            alert("⚠️ Primero selecciona un cliente en el panel 'Venta Actual' (derecha).\n\n1. Busca y selecciona el cliente arriba a la derecha.\n2. Vuelve aquí y presiona este botón para asignarlo a esta venta.");
            return;
        }

        if (!confirm(`¿Asignar cliente "${posClient.name}" a esta venta?`)) return;

        try {
            const { error } = await supabase
                .from('transactions')
                .update({ client_id: posClient.id })
                .eq('id', txId);

            if (error) throw error;

            alert("✅ Cliente asignado correctamente.");
            loadRecentTransactions();
            setPosClient(null); // Reset after assign
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };


    const handleCheckout = async () => {
        if (cart.length === 0) return alert("El carrito está vacío");
        if (!window.confirm(`¿Confirmar venta por $${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}?`)) return;

        setIsCheckoutLoading(true);
        try {
            let clientId = posClient?.id || null;

            // Si tenemos datos de cliente (de agenda) pero sin ID, buscar/crear
            if (posClient && !posClient.id && posClient.phone) {
                const phoneToSearch = posClient.phone.startsWith('+') ? posClient.phone : '+569' + posClient.phone;
                const { data: existingClient } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('phone', phoneToSearch)
                    .single();

                if (existingClient) {
                    clientId = existingClient.id;
                } else {
                    const generateToken = () => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            const r = Math.random() * 16 | 0;
                            const v = c === 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    };

                    const { data: newClient, error: createError } = await supabase
                        .from('clients')
                        .insert({
                            name: posClient.name || 'Cliente',
                            phone: phoneToSearch,
                            visits: 1,
                            member_token: generateToken()
                        })
                        .select('id')
                        .single();

                    if (createError) {
                        console.error('Error creando cliente:', createError);
                    } else if (newClient) {
                        clientId = newClient.id;
                    }
                }
            }

            for (const item of cart) {
                // 1. Inventory Logic
                if (item.type === 'product' && item.stock !== false) {
                    const { error: invError } = await supabase.rpc('adjust_inventory', {
                        p_product_id: item.id,
                        p_delta: -item.qty,
                        p_reason: 'sale_pos'
                    });
                    if (invError) console.error("Inventory error", invError);
                }

                // 2. Transaction Logic
                const { error: txError } = await supabase.from('transactions').insert({
                    client_id: clientId,
                    amount: item.price * item.qty,
                    type: item.type === 'service' ? 'service' : 'product',
                    description: `POS: ${item.name} (${item.variant}) x${item.qty}`,
                    additional_cost: 0,
                    // Si la migración se aplica, esto funcionará, si no, se ignorarán si supabase está en modo lax o fallará
                    // Para seguridad: no enviamos product_id por ahora si no estamos seguros de la migración,
                    // o asumimos que el usuario la ejecutará pronto.
                    // product_id: item.type === 'product' ? item.id : null,
                    // quantity: item.qty
                });

                if (txError) throw txError;
            }

            alert("✅ Venta registrada con éxito!");
            setCart([]);
            setPosClient(null);
            setPosSearchTerm('');
            loadRecentTransactions(); // Recargar historial
        } catch (err: any) {
            alert("Error procesando venta: " + err.message);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const handleDeleteTransaction = async (tx: any) => {
        if (!confirm(`¿Eliminar venta de $${tx.amount.toLocaleString()}?\n\nEsta acción eliminará el registro financiero.`)) return;

        // Opcional: Sugerir ajustar stock
        const shouldAdjustStock = tx.type === 'product' && confirm("¿Deseas intentar devolver el stock automáticamente?\n(Solo funciona si el sistema puede identificar el producto)");

        try {
            const { error } = await supabase.from('transactions').delete().eq('id', tx.id);
            if (error) throw error;

            alert("Venta eliminada correctamente.");
            loadRecentTransactions();
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
        }
    };

    // Filter Logic
    const filteredPerfumes = PERFUMES.filter(p =>
        (activeCategory === 'todos' || activeCategory === 'perfumes' || (activeCategory === 'arabes' && p.category === 'arab')) &&
        p.name?.toLowerCase().includes(posProductSearch.toLowerCase())
    );
    const filteredServices = SERVICES.filter(s =>
        (activeCategory === 'todos' || activeCategory === 'servicios') &&
        s.name?.toLowerCase().includes(posProductSearch.toLowerCase())
    );
    const filteredInventory = inventoryProducts.filter(p =>
        (activeCategory === 'todos' || activeCategory === 'productos') &&
        p.name?.toLowerCase().includes(posProductSearch.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Left Column: Product Selection */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-20">
                {message && <div className="bg-green-600 text-white p-2 rounded text-center text-sm font-bold sticky top-0 z-50 animate-in slide-in-from-top duration-300 shadow-lg">{message}</div>}

                {/* Search & Tabs */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 z-10 sticky top-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar servicio o producto..."
                            value={posProductSearch}
                            onChange={(e) => setPosProductSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                    </div>

                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {['todos', 'servicios', 'perfumes', 'arabes', 'productos'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeCategory === cat
                                    ? 'bg-black text-white shadow-lg scale-105'
                                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                    }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Manual Item Entry */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <h4 className="font-bold text-stone-700 mb-2 text-sm flex items-center gap-2"><Edit2 size={14} /> Item Manual</h4>
                    <div className="flex gap-2">
                        <input
                            placeholder="Nombre Item"
                            className="flex-1 border p-2 rounded text-sm"
                            value={manualItemName}
                            onChange={e => setManualItemName(e.target.value)}
                        />
                        <input
                            placeholder="Precio"
                            type="number"
                            className="w-24 border p-2 rounded text-sm"
                            value={manualItemPrice}
                            onChange={e => setManualItemPrice(e.target.value)}
                        />
                        <button onClick={addManualItem} className="bg-stone-800 text-white px-3 rounded-lg font-bold text-sm hover:bg-black transition flex items-center gap-1">
                            <Plus size={16} /> Agregar
                        </button>
                    </div>
                </div>

                {/* GRIDS */}
                <div className="space-y-8">
                    {/* Services */}
                    {filteredServices.length > 0 && (
                        <div>
                            <h4 className="font-bold text-stone-500 mb-3 uppercase text-xs">Servicios</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredServices.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => addToCart(service, 'service')}
                                        className="bg-white p-4 rounded-xl border border-stone-100 hover:shadow-md hover:border-purple-200 transition-all text-left group relative overflow-hidden"
                                    >
                                        <div className="mb-2">
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                                Servicio
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-stone-800 leading-tight mb-1">{service.name}</h3>
                                        <div className="font-mono font-bold text-lg text-emerald-600 mt-2">
                                            ${service.price.toLocaleString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inventory */}
                    {filteredInventory.length > 0 && (
                        <div>
                            <h4 className="font-bold text-stone-500 mb-3 uppercase text-xs flex items-center gap-2">
                                <Package size={14} /> Inventario
                            </h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredInventory.map(product => (
                                    <div
                                        key={product.product_id}
                                        className="bg-white p-4 rounded-xl border border-stone-100 hover:shadow-md hover:border-emerald-200 transition-all text-left relative overflow-hidden"
                                    >
                                        <div className="font-bold text-stone-800 text-sm mb-1 truncate">{product.name}</div>
                                        <div className="text-stone-400 text-[10px] mb-3">Stock: {product.quantity}</div>
                                        <button
                                            onClick={() => addToCart({ ...product, id: product.product_id }, 'product', 'unidad', product.sale_price || product.price || 0)}
                                            className="w-full bg-emerald-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                                        >
                                            <Plus size={14} /> ${(product.sale_price || product.price || 0).toLocaleString()}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Perfumes Catalog */}
                    {filteredPerfumes.length > 0 && (
                        <div>
                            <h4 className="font-bold text-stone-500 mb-3 uppercase text-xs">Catálogo de Perfumes</h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {filteredPerfumes.map(perfume => (
                                    <div key={perfume.id} className="bg-white p-4 rounded-xl border border-stone-100 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-stone-800 text-sm">{perfume.name}</h3>
                                                <p className="text-xs text-stone-400">{perfume.brand}</p>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                                {perfume.category}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            <button onClick={() => addToCart(perfume, 'product', '5ml', perfume.price5ml)} className="bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs py-2 rounded-lg font-bold transition">
                                                5ml<br /><span className="text-emerald-600">${perfume.price5ml.toLocaleString()}</span>
                                            </button>
                                            <button onClick={() => addToCart(perfume, 'product', '10ml', perfume.price10ml)} className="bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs py-2 rounded-lg font-bold transition">
                                                10ml<br /><span className="text-emerald-600">${perfume.price10ml.toLocaleString()}</span>
                                            </button>
                                            {perfume.priceFullBottle && (
                                                <button onClick={() => addToCart(perfume, 'product', 'Botella', perfume.priceFullBottle)} className="bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs py-2 rounded-lg font-bold transition border border-amber-200">
                                                    Botella<br /><span className="text-emerald-600">${perfume.priceFullBottle.toLocaleString()}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SECCIÓN: HISTORIAL DE VENTAS --- */}
                <div className="mt-12 pt-8 border-t border-stone-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-stone-800 flex items-center gap-2">
                            <RotateCcw size={18} /> Últimas Ventas (24h)
                        </h3>
                        <button onClick={loadRecentTransactions} className="text-stone-400 hover:text-black p-2 hover:bg-stone-100 rounded-full transition">
                            <RefreshCw size={16} className={loadingHistory ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-stone-50 text-stone-400 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Hora</th>
                                    <th className="px-4 py-3 text-left">Descripción</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                    <th className="px-4 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-stone-400">
                                            No hay ventas recientes hoy.
                                        </td>
                                    </tr>
                                ) : (
                                    recentTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                                                {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-stone-800 line-clamp-1">{tx.description}</div>
                                                <div className="text-xs text-stone-400">{tx.clients?.name || 'Cliente Casual'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600">
                                                ${tx.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {!tx.clients && (
                                                        <button
                                                            onClick={() => handleAssignClientToTransaction(tx.id)}
                                                            className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Asignar cliente seleccionado (en panel derecho)"
                                                        >
                                                            <UserPlus size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteTransaction(tx)}
                                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Eliminar venta"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Cart & Checkout */}
            <div className="bg-white p-6 rounded-3xl shadow-xl h-fit border border-stone-100 lg:sticky lg:top-4 flex flex-col max-h-[90vh]">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <ShoppingBag /> Venta Actual
                </h3>

                {/* Client Selector */}
                <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Cliente</label>
                    {posClient ? (
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${posClient.visits >= 10 ? 'bg-amber-50 border-amber-200 text-amber-800' : (posClient.visits >= 5 ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700')}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${posClient.visits >= 10 ? 'bg-amber-100' : (posClient.visits >= 5 ? 'bg-slate-200' : 'bg-emerald-100')}`}>
                                    {posClient.visits >= 10 ? <Crown size={16} className="text-amber-600" /> : <User size={16} />}
                                </div>
                                <div>
                                    <span className="font-bold block">{posClient.name}</span>
                                    {posClient.visits >= 10 && <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Cliente VIP Gold</span>}
                                    {posClient.visits >= 5 && posClient.visits < 10 && <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cliente Plata</span>}
                                </div>
                            </div>
                            <button onClick={() => setPosClient(null)} className={`p-1 rounded-full ${posClient.visits >= 10 ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-stone-100 text-stone-500'}`}>
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={posSearchTerm}
                                onChange={(e) => setPosSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all border border-transparent focus:border-stone-200"
                            />
                            {/* Create Client Shortcut */}
                            {!posClient && posSearchTerm.length > 2 && clients.length === 0 && (
                                <button
                                    onClick={handleQuickCreateClient}
                                    className="absolute top-full left-0 right-0 mt-2 w-full py-2 bg-emerald-600 text-white rounded-xl shadow-lg z-50 text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition animate-in fade-in slide-in-from-top-2"
                                >
                                    <UserPlus size={16} /> Crear "{posSearchTerm}"
                                </button>
                            )}
                            {/* Dropdown Results */}
                            {clients.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-stone-100 shadow-xl rounded-xl mt-2 z-50 max-h-48 overflow-y-auto p-2">
                                    {clients.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setPosClient(c); setPosSearchTerm(''); setClients([]); }}
                                            className="w-full text-left px-3 py-2 hover:bg-stone-50 text-sm rounded-lg flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="font-bold text-stone-800">{c.name || 'Sin Nombre'}</div>
                                                <div className="text-xs text-stone-400">{c.phone}</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {c.visits >= 10 && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                                                <span className={`text-[10px] px-2 py-1 rounded-full ${c.visits >= 10 ? 'bg-amber-100 text-amber-700 font-bold' : (c.visits >= 5 ? 'bg-slate-100 text-slate-600 font-bold' : 'bg-stone-100')}`}>
                                                    {c.visits} visitas
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Discount Buttons */}
                    {posClient && cart.some(i => i.type === 'product') && (
                        <>
                            {/* Gold Discount (10%) */}
                            {posClient.visits >= 10 && (
                                <button
                                    onClick={() => {
                                        setCart(cart.map(item => {
                                            if (item.type === 'product') {
                                                return { ...item, price: Math.floor(item.price * 0.90) };
                                            }
                                            return item;
                                        }));
                                        setMessage("💰 Descuento VIP (10%) aplicado a productos");
                                        setTimeout(() => setMessage(''), 3000);
                                    }}
                                    className="w-full py-2 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-200 transition flex items-center justify-center gap-1"
                                >
                                    <Crown size={14} /> Aplicar 10% OFF Extra (VIP)
                                </button>
                            )}

                            {/* Plata Discount (7%) */}
                            {posClient.visits >= 5 && posClient.visits < 10 && (
                                <button
                                    onClick={() => {
                                        setCart(cart.map(item => {
                                            if (item.type === 'product') {
                                                return { ...item, price: Math.floor(item.price * 0.93) };
                                            }
                                            return item;
                                        }));
                                        setMessage("💰 Descuento Plata (7%) aplicado a productos");
                                        setTimeout(() => setMessage(''), 3000);
                                    }}
                                    className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-1"
                                >
                                    <User size={14} /> Aplicar 7% OFF (Plata)
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-6 min-h-[200px]">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4">
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p className="text-sm font-medium">Carrito vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartId || `${item.id}-${item.variant}`} className="flex justify-between items-center group bg-stone-50 p-3 rounded-xl border border-transparent hover:border-stone-200 transition-all">
                                <div>
                                    <div className="font-bold text-stone-800 text-sm">{item.name}</div>
                                    <div className="text-xs text-stone-400 mb-2">{item.variant}</div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateCartQty(item.cartId, item.qty - 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-xs hover:bg-stone-100 transition">-</button>
                                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                        <button onClick={() => updateCartQty(item.cartId, item.qty + 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-xs hover:bg-stone-100 transition">+</button>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 justify-end">
                                        <span className="text-stone-400 text-xs">$</span>
                                        <input
                                            className="w-20 text-right bg-transparent border-b border-stone-300 font-bold text-stone-800 text-sm focus:outline-none focus:border-black p-0"
                                            value={item.price}
                                            onChange={(e) => updateCartPrice(item.cartId, e.target.value)}
                                            title="Click para editar precio"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.cartId)}
                                        className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Actions */}
                <div className="space-y-4 pt-6 border-t border-stone-100 mt-auto">
                    <div className="flex justify-between items-end">
                        <span className="text-stone-500 font-medium">Total</span>
                        <span className="text-4xl font-bold font-mono text-stone-900 tracking-tight">
                            ${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckoutLoading}
                        className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-xl shadow-stone-200"
                    >
                        {isCheckoutLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CreditCard size={20} /> Cobrar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSModule;
