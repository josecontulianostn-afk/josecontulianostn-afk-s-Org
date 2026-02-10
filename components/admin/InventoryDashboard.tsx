import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../../services/supabaseClient';
import { Product, InventoryRequest } from '../../types';
import { Scan, Search, Archive, AlertTriangle, CheckCircle, X, LogOut, Camera, Image as ImageIcon, List, ArrowLeft, TrendingUp, Plus, Minus, PackagePlus, PackageMinus } from 'lucide-react';

interface InventoryDashboardProps {
    onLogout: () => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ onLogout }) => {
    const [view, setView] = useState<'scan' | 'product_details' | 'new_product' | 'list'>('scan');
    const [barcode, setBarcode] = useState('');
    const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [manualSaleQty, setManualSaleQty] = useState(1);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [inventoryList, setInventoryList] = useState<Product[]>([]);

    // Adjustment type: 'in' for stock entry, 'out' for sales/exit
    const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
    const [adjustmentQty, setAdjustmentQty] = useState(1);

    // Search state for name-based search
    const [searchQuery, setSearchQuery] = useState('');

    // Scanner Custom UI State
    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // New Product Form State
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        category: 'perfume',
        gender: 'unisex',
        cost_price: 0,
        sale_price: 0,
        stock: 0
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const html5QrCode = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef(false); // Flag to prevent multiple scan callbacks
    const [isSaving, setIsSaving] = useState(false); // Separate state for save button

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    // Load Inventory List when view changes to 'list'
    useEffect(() => {
        if (view === 'list') {
            fetchInventory();
        }
    }, [view]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setInventoryList(data || []);
        } catch (err: any) {
            console.error("Error fetching inventory", err);
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        setCameraError(null);
        try {
            if (!html5QrCode.current) {
                html5QrCode.current = new Html5Qrcode("reader");
            }

            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                // Prefer back camera
                const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;

                await html5QrCode.current.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        handleScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // ignore failures for user experience
                    }
                );
                setIsScanning(true);
            } else {
                setCameraError("No se encontraron cámaras.");
            }
        } catch (err: any) {
            console.error(err);
            setCameraError("Error al iniciar cámara: " + err.message);
            setIsScanning(false);
        }
    };

    const stopCamera = async () => {
        if (html5QrCode.current && isScanning) {
            try {
                await html5QrCode.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        // Prevent multiple callbacks from the scanner
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        await stopCamera();
        await handleSearch(decodedText);

        // Reset after a delay to allow for new scans
        setTimeout(() => {
            isProcessingRef.current = false;
        }, 1000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const imageFile = e.target.files[0];
            if (!html5QrCode.current) {
                html5QrCode.current = new Html5Qrcode("reader");
            }

            html5QrCode.current.scanFile(imageFile, true)
                .then(decodedText => {
                    handleSearch(decodedText);
                })
                .catch(err => {
                    setMessage({ type: 'error', text: "No se pudo leer el código de la imagen." });
                });
        }
    };

    const handleSearch = async (code: string) => {
        if (!code.trim()) return;

        setLoading(true);
        setMessage(null);
        setBarcode(code);

        try {
            // First try exact barcode match
            let { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('barcode', code)
                .single();

            if (error && error.code === 'PGRST116') {
                // No barcode match, try searching by name (case insensitive)
                const { data: nameData, error: nameError } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('name', `%${code}%`)
                    .limit(1)
                    .single();

                if (!nameError && nameData) {
                    data = nameData;
                    error = null;
                }
            }

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setScannedProduct(data);
                setView('product_details');
            } else {
                setScannedProduct(null);
                setNewProduct(prev => ({ ...prev, barcode: code, name: '', stock: 0 }));
                setView('new_product');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    // Select product from list to view/edit
    const handleSelectProduct = (product: Product) => {
        setScannedProduct(product);
        setBarcode(product.barcode || '');
        setAdjustmentQty(1);
        setView('product_details');
    };

    // Filter inventory list based on search
    const filteredInventory = searchQuery
        ? inventoryList.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchQuery))
        )
        : inventoryList;

    const handleSaveNewProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent double submission
        if (isSaving) return;
        setIsSaving(true);
        setLoading(true);

        try {
            if (!newProduct.name || !newProduct.sale_price) {
                throw new Error("Faltan datos obligatorios");
            }

            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select()
                .single();

            if (error) throw error;

            setScannedProduct(data);
            setView('product_details');
            setMessage({ type: 'success', text: 'Producto registrado correctamente' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
            setIsSaving(false);
        }
    };

    const handleRequestSale = async () => {
        if (!scannedProduct) return;
        setLoading(true);
        try {
            // Record manual sale request
            const { error } = await supabase
                .from('inventory_requests')
                .insert({
                    product_id: scannedProduct.id,
                    quantity: -manualSaleQty, // Negative for sale
                    status: 'pending',
                });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Venta solicitada. Esperando validación del Admin.' });
            setTimeout(() => {
                setView('scan');
                setBarcode('');
                setScannedProduct(null);
                setMessage(null);
            }, 2000);

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    // New function: Handle stock adjustment (both IN and OUT)
    const handleAdjustStock = async () => {
        if (!scannedProduct) return;
        setLoading(true);
        try {
            // Calculate the actual quantity change
            const quantityChange = adjustmentType === 'in' ? adjustmentQty : -adjustmentQty;
            const newStock = scannedProduct.stock + quantityChange;

            if (newStock < 0) {
                throw new Error('Stock insuficiente para esta operación');
            }

            // Update product stock directly
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', scannedProduct.id);

            if (updateError) throw updateError;

            // Log the adjustment in inventory_logs table
            const { error: logError } = await supabase
                .from('inventory_logs')
                .insert({
                    product_id: scannedProduct.id,
                    quantity_change: quantityChange,
                    reason: adjustmentType === 'in' ? 'Ingreso de mercadería' : 'Venta registrada',
                    previous_stock: scannedProduct.stock,
                    new_stock: newStock
                });

            // Log error but don't fail the operation (table might not exist)
            if (logError) console.warn('Could not log inventory change:', logError);

            const actionText = adjustmentType === 'in'
                ? `+${adjustmentQty} unidades ingresadas`
                : `-${adjustmentQty} unidades vendidas`;

            setMessage({ type: 'success', text: `${actionText}. Stock actualizado: ${newStock}` });

            // Update local state with new stock
            setScannedProduct({ ...scannedProduct, stock: newStock });
            setAdjustmentQty(1);

            // Auto-reset after delay
            setTimeout(() => {
                setMessage(null);
            }, 3000);

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    // Calculate margin
    const margin = newProduct.sale_price && newProduct.cost_price
        ? ((newProduct.sale_price - newProduct.cost_price) / newProduct.sale_price * 100).toFixed(1)
        : '0.0';

    // Totals for List View
    const totalStock = inventoryList.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalCost = inventoryList.reduce((acc, p) => acc + (p.stock || 0) * (p.cost_price || 0), 0);
    const totalValue = inventoryList.reduce((acc, p) => acc + (p.stock || 0) * (p.sale_price || 0), 0);

    return (
        <div className="min-h-screen bg-stone-100 pb-40">
            {/* Header - Removed sticky to avoid keyboard layout jitter on mobile */}
            <div className="bg-stone-900 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    {view !== 'scan' ? (
                        <button onClick={() => setView('scan')} className="bg-stone-800 p-2 rounded-full hover:bg-stone-700 transition">
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                    ) : (
                        <div className="bg-amber-500/20 p-2 rounded-lg">
                            <Scan className="text-amber-500" size={24} />
                        </div>
                    )}

                    <div>
                        <h1 className="font-bold text-lg leading-none">Inventario</h1>
                        <p className="text-[10px] text-stone-400">Scanner & Control</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {view !== 'list' && (
                        <button onClick={() => setView('list')} className="text-stone-400 hover:text-white p-2">
                            <List size={24} />
                        </button>
                    )}
                    <button onClick={onLogout} className="text-stone-400 hover:text-white p-2">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">

                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {view === 'scan' && (
                    <div className="space-y-4">
                        {/* Navigation Tabs */}
                        <div className="flex rounded-xl overflow-hidden border border-stone-200 bg-white">
                            <button
                                onClick={() => setView('scan')}
                                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold bg-stone-900 text-white"
                            >
                                <Scan size={18} />
                                Escanear
                            </button>
                            <button
                                onClick={() => { setView('list'); fetchInventory(); }}
                                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold bg-white text-stone-600 hover:bg-stone-50 transition"
                            >
                                <List size={18} />
                                Listado ({inventoryList.length})
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-200 text-center space-y-4">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Scan size={32} className="text-stone-400" />
                            </div>
                            <h2 className="text-xl font-bold text-stone-800">Escanear Producto</h2>

                            {/* Scanner Area */}
                            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-stone-300 bg-black min-h-[300px] flex flex-col justify-center">
                                <div id="reader" className="w-full h-full"></div>

                                {!isScanning && !cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-300/10 backdrop-blur-sm z-10">
                                        <button
                                            onClick={startCamera}
                                            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
                                        >
                                            <Camera size={20} /> Activar Cámara
                                        </button>
                                        <p className="mt-4 text-xs text-white bg-black/50 px-3 py-1 rounded-full">
                                            Permite el acceso a tu cámara
                                        </p>
                                    </div>
                                )}

                                {cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4 z-10">
                                        <AlertTriangle className="text-red-500 w-12 h-12 mb-2" />
                                        <p className="text-red-600 text-center text-sm font-bold">{cameraError}</p>
                                        <button
                                            onClick={startCamera}
                                            className="mt-4 text-stone-600 underline text-sm"
                                        >
                                            Intentar de nuevo
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Secondary File Upload Option */}
                            <div className="flex justify-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-stone-400 text-xs flex items-center gap-1 hover:text-stone-600 transition"
                                >
                                    <ImageIcon size={14} /> ¿Problemas con la cámara? <span className="underline">Subir una foto del código</span>
                                </button>
                            </div>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-stone-400">O ingresar manual</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Código o nombre del producto..."
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-center font-medium outline-none focus:ring-2 focus:ring-black"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(barcode)}
                                />
                                <button
                                    onClick={() => handleSearch(barcode)}
                                    disabled={loading || !barcode.trim()}
                                    className="bg-stone-900 text-white p-3 rounded-xl hover:bg-black transition disabled:opacity-50"
                                >
                                    <Search size={24} />
                                </button>
                            </div>
                            <p className="text-xs text-stone-400">Busca por código de barras o nombre del producto</p>
                        </div>
                    </div>
                )}

                {view === 'new_product' && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="bg-amber-500 p-6 text-white text-center relative">
                            <button onClick={() => setView('scan')} className="absolute left-4 top-4 p-2 bg-black/10 rounded-full hover:bg-black/20 transition">
                                <X size={20} />
                            </button>
                            <PackageIcon className="mx-auto w-12 h-12 mb-2 text-white/90" />
                            <h2 className="text-2xl font-bold">Nuevo Producto</h2>
                            <p className="text-amber-100 text-sm">Código: {barcode}</p>
                        </div>

                        <form onSubmit={handleSaveNewProduct} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre Producto</label>
                                <input
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-amber-500"
                                    value={newProduct.name || ''}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="Ej: Lattafa Asad 100ml"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoría</label>
                                    <select
                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value as any })}
                                    >
                                        <option value="perfume">Perfume</option>
                                        <option value="desodorante">Desodorante</option>
                                        <option value="capilar">Capilar</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Stock Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-stone-800"
                                        value={newProduct.stock || 0}
                                        onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Costo ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                                        value={newProduct.cost_price || ''}
                                        onChange={e => setNewProduct({ ...newProduct, cost_price: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Venta ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-stone-800"
                                        value={newProduct.sale_price || ''}
                                        onChange={e => setNewProduct({ ...newProduct, sale_price: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Género</label>
                                <select
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                                    value={newProduct.gender}
                                    onChange={e => setNewProduct({ ...newProduct, gender: e.target.value as any })}
                                >
                                    <option value="unisex">Unisex</option>
                                    <option value="hombre">Hombre</option>
                                    <option value="mujer">Mujer</option>
                                </select>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-xl flex justify-between items-center border border-stone-100">
                                <span className="text-xs font-bold text-stone-500 uppercase">Margen Calculado</span>
                                <span className={`font-bold text-lg ${Number(margin) > 30 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {margin}%
                                </span>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || isSaving}
                                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {(loading || isSaving) ? 'Guardando...' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'product_details' && scannedProduct && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="h-40 bg-stone-900 relative">
                            <button onClick={() => setView('scan')} className="absolute left-4 top-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition">
                                <X size={20} />
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Archive size={64} className="text-stone-700" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <span className="inline-block px-2 py-1 bg-amber-500 text-[10px] font-bold uppercase rounded mb-2 text-black">
                                    {scannedProduct.category}
                                </span>
                                <h2 className="text-2xl font-bold leading-tight">{scannedProduct.name}</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                    <div className="text-xs text-stone-400 uppercase font-bold mb-1">Precio</div>
                                    <div className="text-xl font-bold text-stone-900">${scannedProduct.sale_price.toLocaleString()}</div>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                    <div className="text-xs text-stone-400 uppercase font-bold mb-1">Stock Actual</div>
                                    <div className={`text-xl font-bold ${scannedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {scannedProduct.stock} unidades
                                    </div>
                                </div>
                            </div>

                            {/* Operation Type Tabs */}
                            <div className="border-t border-stone-100 pt-6">
                                <div className="flex rounded-xl overflow-hidden border border-stone-200 mb-4">
                                    <button
                                        onClick={() => setAdjustmentType('in')}
                                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold transition ${adjustmentType === 'in'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                                            }`}
                                    >
                                        <PackagePlus size={18} />
                                        Ingresar
                                    </button>
                                    <button
                                        onClick={() => setAdjustmentType('out')}
                                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold transition ${adjustmentType === 'out'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                                            }`}
                                    >
                                        <PackageMinus size={18} />
                                        Vender
                                    </button>
                                </div>

                                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                                    {adjustmentType === 'in' ? (
                                        <><PackagePlus size={18} className="text-green-600" /> Ingresar Mercadería</>
                                    ) : (
                                        <><PackageMinus size={18} className="text-red-600" /> Registrar Venta</>
                                    )}
                                </h3>

                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <button
                                        onClick={() => setAdjustmentQty(Math.max(1, adjustmentQty - 1))}
                                        className="w-12 h-12 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:bg-stone-50 text-xl font-bold"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <input
                                        type="number"
                                        value={adjustmentQty}
                                        onChange={(e) => setAdjustmentQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 h-12 text-center text-2xl font-bold border-2 border-stone-200 rounded-xl outline-none focus:border-amber-500"
                                        min="1"
                                    />
                                    <button
                                        onClick={() => setAdjustmentQty(adjustmentQty + 1)}
                                        className="w-12 h-12 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:bg-stone-50 text-xl font-bold"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Quick quantity buttons */}
                                <div className="flex justify-center gap-2 mb-4">
                                    {[1, 5, 10, 20].map(qty => (
                                        <button
                                            key={qty}
                                            onClick={() => setAdjustmentQty(qty)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${adjustmentQty === qty
                                                ? 'bg-stone-900 text-white'
                                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                                }`}
                                        >
                                            {qty}
                                        </button>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleAdjustStock}
                                    disabled={loading || (adjustmentType === 'out' && adjustmentQty > scannedProduct.stock)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${adjustmentType === 'in'
                                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                                        }`}
                                >
                                    {loading ? 'Procesando...' : (
                                        adjustmentType === 'in'
                                            ? `Ingresar +${adjustmentQty} unidades`
                                            : `Registrar Venta -${adjustmentQty} ($${(scannedProduct.sale_price * adjustmentQty).toLocaleString()})`
                                    )}
                                </button>

                                {adjustmentType === 'out' && adjustmentQty > scannedProduct.stock && (
                                    <p className="text-xs text-red-500 text-center mt-2 flex items-center justify-center gap-1">
                                        <AlertTriangle size={12} /> Stock insuficiente
                                    </p>
                                )}

                                <p className="text-xs text-stone-400 text-center mt-3">
                                    {adjustmentType === 'in'
                                        ? 'El stock se actualizará automáticamente al confirmar.'
                                        : `Stock después de venta: ${scannedProduct.stock - adjustmentQty}`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'list' && (
                    <div className="space-y-4">
                        {/* Navigation Tabs */}
                        <div className="flex rounded-xl overflow-hidden border border-stone-200 bg-white">
                            <button
                                onClick={() => setView('scan')}
                                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold bg-white text-stone-600 hover:bg-stone-50 transition"
                            >
                                <Scan size={18} />
                                Escanear
                            </button>
                            <button
                                onClick={() => { setView('list'); fetchInventory(); }}
                                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold bg-stone-900 text-white"
                            >
                                <List size={18} />
                                Listado ({inventoryList.length})
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-black shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 text-center">
                                <div className="text-[10px] text-stone-400 uppercase font-bold">Unidades</div>
                                <div className="text-lg font-bold text-stone-900">{totalStock}</div>
                            </div>
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 text-center">
                                <div className="text-[10px] text-stone-400 uppercase font-bold">Costo</div>
                                <div className="text-lg font-bold text-stone-900">${totalCost.toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 text-center">
                                <div className="text-[10px] text-stone-400 uppercase font-bold">Venta</div>
                                <div className="text-lg font-bold text-stone-900">${totalValue.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3 text-center">Stock</th>
                                        <th className="px-4 py-3 text-right">Precio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {filteredInventory.map(product => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-amber-50 cursor-pointer transition"
                                            onClick={() => handleSelectProduct(product)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-stone-800">{product.name}</div>
                                                <div className="text-[10px] text-stone-400">{product.barcode || 'Sin código'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${product.sale_price.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInventory.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-stone-400">
                                                {searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'No hay productos registrados'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Icon
const PackageIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16.5 9.4 7.5 4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
);

export default InventoryDashboard;
