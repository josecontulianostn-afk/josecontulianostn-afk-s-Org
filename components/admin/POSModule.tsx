import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, X, ShoppingCart, Percent, Save, Trash2, Edit2, Package, User, Star } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { PERFUMES, GIFTS, SERVICES } from '../../constants';

interface POSModuleProps {
    initialClient?: any;
}

const POSModule: React.FC<POSModuleProps> = ({ initialClient }) => {
    // POS State
    const [cart, setCart] = useState<any[]>([]);
    const [posClient, setPosClient] = useState<any>(initialClient || null);
    const [posSearchTerm, setPosSearchTerm] = useState('');
    const [posProductSearch, setPosProductSearch] = useState('');
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [message, setMessage] = useState('');

    // Inventory products from DB
    const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);

    // Manual Item State
    const [manualItemName, setManualItemName] = useState('');
    const [manualItemPrice, setManualItemPrice] = useState('');

    useEffect(() => {
        if (initialClient) setPosClient(initialClient);
        fetchInventoryProducts();
    }, [initialClient]);

    const fetchInventoryProducts = async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .gt('quantity', 0)
            .order('name', { ascending: true });
        if (data) setInventoryProducts(data);
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
                if (type === 'product') {
                    if (variant === '5ml') price = product.price5ml || product.price || 0;
                    else price = product.price10ml || product.price || 0;
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
            stock: false
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

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("El carrito está vacío");
        if (!window.confirm(`¿Confirmar venta por $${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}?`)) return;

        setIsCheckoutLoading(true);
        try {
            const clientId = posClient ? posClient.id : null;

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
                    additional_cost: 0
                });

                if (txError) throw txError;
            }

            alert("✅ Venta registrada con éxito!");
            setCart([]);
            setPosClient(null);
            setPosSearchTerm('');
        } catch (err: any) {
            alert("Error procesando venta: " + err.message);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const filteredPerfumes = PERFUMES.filter(p => p.name?.toLowerCase().includes(posProductSearch.toLowerCase()));
    const filteredServices = SERVICES.filter(s => s.name?.toLowerCase().includes(posProductSearch.toLowerCase()));
    const filteredInventory = inventoryProducts.filter(p => p.name?.toLowerCase().includes(posProductSearch.toLowerCase()));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh]">
            {/* Left: Product Catalog */}
            <div className="md:col-span-2 space-y-4 overflow-y-auto pr-2">
                {message && <div className="bg-green-600 text-white p-2 rounded text-center text-sm font-bold sticky top-0 z-10">{message}</div>}

                <div className="sticky top-0 bg-white z-10 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos o servicios..."
                            value={posProductSearch}
                            onChange={(e) => setPosProductSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none"
                        />
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
                        <button onClick={addManualItem} className="bg-stone-800 text-white px-3 rounded font-bold text-sm">+</button>
                    </div>
                </div>

                {/* Services Grid */}
                <div>
                    <h4 className="font-bold text-stone-500 mb-2 uppercase text-xs">Servicios</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredServices.map(service => (
                            <button
                                key={service.id}
                                onClick={() => addToCart(service, 'service')}
                                className="p-3 bg-white border border-stone-100 rounded-lg shadow-sm hover:border-purple-300 text-left transition group"
                            >
                                <div className="font-bold text-stone-800 group-hover:text-purple-600">{service.name}</div>
                                <div className="text-stone-500 text-xs">${service.price.toLocaleString()}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid - From Inventory */}
                <div>
                    <h4 className="font-bold text-stone-500 mb-2 uppercase text-xs flex items-center gap-2">
                        <Package size={14} /> Inventario ({filteredInventory.length})
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredInventory.map(product => (
                            <div
                                key={product.product_id}
                                className="p-3 bg-white border border-stone-100 rounded-lg shadow-sm hover:border-emerald-300 text-left transition group"
                            >
                                <div className="font-bold text-stone-800 text-sm group-hover:text-emerald-600 truncate">{product.name}</div>
                                <div className="text-stone-400 text-[10px] mb-2">Stock: {product.quantity}</div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => addToCart({ ...product, id: product.product_id }, 'product', 'unidad', product.sale_price || product.price || 0)}
                                        className="flex-1 bg-emerald-600 text-white text-xs py-1 rounded font-bold hover:bg-emerald-700"
                                    >
                                        ${(product.sale_price || product.price || 0).toLocaleString()}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Perfumes from Constants - With Variants */}
                <div>
                    <h4 className="font-bold text-stone-500 mb-2 uppercase text-xs">Perfumes Catálogo ({filteredPerfumes.length})</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredPerfumes.map(perfume => (
                            <div
                                key={perfume.id}
                                className="p-3 bg-white border border-stone-100 rounded-lg shadow-sm hover:border-blue-300 text-left transition group"
                            >
                                <div className="font-bold text-stone-800 text-sm group-hover:text-blue-600 truncate">{perfume.name}</div>
                                <div className="text-stone-400 text-[10px] mb-2">{perfume.brand}</div>
                                <div className="flex flex-wrap gap-1">
                                    <button
                                        onClick={() => addToCart(perfume, 'product', '5ml', perfume.price5ml)}
                                        className="flex-1 bg-blue-500 text-white text-xs py-1 rounded font-bold hover:bg-blue-600"
                                    >
                                        5ml ${perfume.price5ml.toLocaleString()}
                                    </button>
                                    <button
                                        onClick={() => addToCart(perfume, 'product', '10ml', perfume.price10ml)}
                                        className="flex-1 bg-blue-700 text-white text-xs py-1 rounded font-bold hover:bg-blue-800"
                                    >
                                        10ml ${perfume.price10ml.toLocaleString()}
                                    </button>
                                    {perfume.priceFullBottle && (
                                        <button
                                            onClick={() => addToCart(perfume, 'product', 'Botella', perfume.priceFullBottle)}
                                            className="w-full mt-1 bg-amber-600 text-white text-xs py-1 rounded font-bold hover:bg-amber-700"
                                        >
                                            🍾 Botella ${perfume.priceFullBottle.toLocaleString()}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="md:col-span-1 bg-white border-l border-stone-100 pl-6 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShoppingCart /> Carrito
                    </h3>

                    {/* Client Selector - IMPORTANTE PARA FIDELIDAD */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-dashed border-amber-300 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="text-amber-600" size={18} />
                            <span className="font-bold text-amber-800 text-sm">Cliente (Fidelidad)</span>
                        </div>
                        {posClient ? (
                            <div className="bg-white border border-green-300 p-3 rounded-lg flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-stone-800">{posClient.name || 'Sin Nombre'}</div>
                                    <div className="text-xs text-stone-500">{posClient.phone}</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="text-amber-500" size={12} fill="currentColor" />
                                        <span className="text-xs font-bold text-amber-600">{posClient.loyalty_points || 0} puntos</span>
                                    </div>
                                </div>
                                <button onClick={() => setPosClient(null)} className="text-stone-400 hover:text-red-500 p-1">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o teléfono..."
                                    value={posSearchTerm}
                                    onChange={(e) => setPosSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border-2 border-amber-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                                />
                                {clients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border-2 border-amber-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto">
                                        {clients.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setPosClient(c); setPosSearchTerm(''); setClients([]); }}
                                                className="w-full text-left px-3 py-2 hover:bg-amber-50 text-sm border-b border-stone-100 last:border-0 flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-bold">{c.name || 'Sin Nombre'}</div>
                                                    <div className="text-xs text-stone-500">{c.phone}</div>
                                                </div>
                                                <div className="text-xs text-amber-600 font-bold">{c.loyalty_points || 0} pts</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[10px] text-amber-600 mt-1">Asocia un cliente para acumular puntos</p>
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-3">
                        {cart.map((item, idx) => (
                            <div key={item.cartId || `${item.id}-${idx}`} className="flex justify-between items-start border-b border-stone-100 pb-3">
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-stone-800">{item.name}</div>
                                    <div className="text-xs text-stone-400">{item.variant}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button onClick={() => updateCartQty(item.cartId, item.qty - 1)} className="w-5 h-5 flex items-center justify-center bg-stone-100 rounded text-xs">-</button>
                                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                        <button onClick={() => updateCartQty(item.cartId, item.qty + 1)} className="w-5 h-5 flex items-center justify-center bg-stone-100 rounded text-xs">+</button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1">
                                        <span className="text-stone-400 text-xs">$</span>
                                        <input
                                            className="w-20 text-right border border-stone-200 bg-amber-50 font-bold text-stone-800 text-sm focus:ring-2 focus:ring-amber-300 rounded px-2 py-1"
                                            value={item.price}
                                            onChange={(e) => updateCartPrice(item.cartId, e.target.value)}
                                            title="Click para editar precio"
                                        />
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-500 block ml-auto mt-1"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && <p className="text-center text-stone-400 text-sm py-8">Carrito vacío</p>}
                    </div>
                </div>

                {/* Footer Totals */}
                <div className="border-t border-stone-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-stone-500 font-medium">Total</span>
                        <span className="text-2xl font-bold text-stone-900">
                            ${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckoutLoading || cart.length === 0}
                        className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
                    >
                        {isCheckoutLoading ? 'Procesando...' : (
                            <>
                                <Save size={18} /> Confirmar Venta
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSModule;
