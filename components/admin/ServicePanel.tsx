import React, { useState, useEffect } from 'react';
import { Shield, Search, QrCode, X, Scissors, PlusCircle, Save, ChevronLeft, ChevronRight, Calendar, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { classifyExpenseStatic } from '../../services/staticChatService';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { PERFUMES, GIFTS, SERVICES } from '../../constants';

interface ServicePanelProps {
    onLogout: () => void;
}

const InventoryRow: React.FC<{ perfume: any, onSell: (amount: number, desc: string) => void }> = ({ perfume, onSell }) => {
    const [stock, setStock] = useState<number | null>(null);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        const { data } = await supabase.from('inventory').select('quantity').eq('product_id', perfume.id).single();
        if (data) setStock(data.quantity);
        else setStock(perfume.stock ? 5 : 0); // Fallback
    };

    const handleSell = async () => {
        if (!window.confirm(`¿Confirmar venta de ${perfume.name}?`)) return;

        // 1. Decrement Stock using centralized RPC
        const { data, error } = await supabase.rpc('adjust_inventory', {
            p_product_id: perfume.id,
            p_delta: -1,
            p_reason: 'sale'
        });

        if (error) {
            alert('Error: ' + error.message);
        } else if (data.success) {
            setStock(data.new_quantity);
            // 2. Record Transaction
            onSell(perfume.price10ml, `Venta: ${perfume.name}`);
            alert('Venta exitosa. Nuevo stock: ' + data.new_quantity);
        } else {
            alert('Error: ' + data.message);
        }
    };

    return (
        <tr className="border-b border-stone-700 hover:bg-stone-700/20">
            <td className="px-3 py-2 font-medium text-white">{perfume.name}</td>
            <td className="px-3 py-2 text-center">
                <span className={`px-2 py-1 rounded text-xs font-bold ${stock !== null && stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stock !== null ? stock : '...'}
                </span>
            </td>
            <td className="px-3 py-2 text-center text-green-400">${perfume.price10ml.toLocaleString()}</td>
            <td className="px-3 py-2 text-right">
                <button
                    onClick={handleSell}
                    disabled={stock !== null && stock <= 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-stone-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-bold shadow-lg"
                >
                    Vender
                </button>
            </td>
        </tr>
    );
};

const ServicePanel: React.FC<ServicePanelProps> = ({ onLogout }) => {
    // Auth state removed, passed as prop
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [scannerActive, setScannerActive] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);

    // Hair Service State
    const [activeTab, setActiveTab] = useState<'loyalty' | 'hair' | 'inventory' | 'agenda' | 'clients' | 'expenses' | 'ventas'>('loyalty');
    const [serviceType, setServiceType] = useState('Corte');
    const [servicePrice, setServicePrice] = useState('7000');
    const [extraCost, setExtraCost] = useState(''); // Costos adicionales (luz, insumos, etc)
    const [extraCostDetail, setExtraCostDetail] = useState('');
    const [visitAmount, setVisitAmount] = useState('0'); // New: Amount for loyalty visits
    const [bookings, setBookings] = useState<any[]>([]); // New: Agendas

    const [client, setClient] = useState<any>(null);

    useEffect(() => {
        if (activeTab === 'agenda') {
            fetchBookings();
        }
    }, [activeTab]);

    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    // Client Management State
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientFormName, setClientFormName] = useState('');
    const [clientFormPhone, setClientFormPhone] = useState('');
    const [editingClient, setEditingClient] = useState<any | null>(null);

    // Client History State
    const [clientHistory, setClientHistory] = useState<any[]>([]);
    const [selectedClientForHistory, setSelectedClientForHistory] = useState<any>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Expenses State
    const [expenses, setExpenses] = useState<any[]>([]);
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expensesLoading, setExpensesLoading] = useState(false);

    // POS State
    const [cart, setCart] = useState<any[]>([]);
    const [posClient, setPosClient] = useState<any>(null);
    const [posSearchTerm, setPosSearchTerm] = useState('');
    const [posProductSearch, setPosProductSearch] = useState('');
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const addToCart = (product: any, type: 'product' | 'gift' | 'service') => {
        const existing = cart.find(item => item.id === product.id && item.type === type);
        if (existing) {
            setCart(cart.map(item => item.id === product.id && item.type === type ? { ...item, qty: item.qty + 1 } : item));
        } else {
            // Determine price
            let price = 0;
            if (type === 'product') price = product.price10ml || 0; // Default to 10ml for now or add 5ml selector later
            if (type === 'gift') price = product.price || 0;
            if (type === 'service') price = product.price || 0;

            setCart([...cart, { ...product, type, qty: 1, price, variant: type === 'product' ? '10ml' : 'standard' }]);
        }
    };

    // Manual Item State
    const [manualItemName, setManualItemName] = useState('');
    const [manualItemPrice, setManualItemPrice] = useState('');

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

        // Use functional state update to ensure latest cart
        setCart(prev => [...prev, newItem]);

        setManualItemName('');
        setManualItemPrice('');

        // Optional: Small feedback or scroll to cart? 
        // For now, simple alert if on mobile might be annoying but clear. 
        // Better: Use a toast message state?
        // Reuse 'message' state for feedback
        setMessage(`Item "${manualItemName}" agregado al carrito ($${price})`);
        setTimeout(() => setMessage(''), 3000);
    };

    const updateCartPrice = (id: string, newPrice: string) => {
        // Allow empty string to let user clear input
        if (newPrice === '') {
            setCart(cart.map(item => item.id === id ? { ...item, price: 0 } : item)); // Set to 0 temporarily
            return;
        }
        const price = parseInt(newPrice);
        if (isNaN(price)) return;
        setCart(cart.map(item => item.id === id ? { ...item, price } : item));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateCartQty = (id: string, qty: number) => {
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, qty } : item));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("El carrito está vacío");
        if (!window.confirm(`¿Confirmar venta por $${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}?`)) return;

        setIsCheckoutLoading(true);
        try {
            const clientId = posClient ? posClient.id : null;

            for (const item of cart) {
                // 1. Inventory Logic (if product/perfume)
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

                if (txError) {
                    console.error("Tx Error", txError);
                    throw txError;
                }
            }

            // 3. Update client visits if a client was selected
            if (clientId) {
                const hasService = cart.some(item => item.type === 'service');
                if (hasService) {
                    // Increment visits for service sales
                    const { error: visitError } = await supabase
                        .from('clients')
                        .update({
                            visits: (posClient.visits || 0) + 1,
                            last_visit: new Date().toISOString()
                        })
                        .eq('id', clientId);

                    if (visitError) console.error("Error updating visits:", visitError);
                } else {
                    // Just update last_visit for product sales
                    await supabase
                        .from('clients')
                        .update({ last_visit: new Date().toISOString() })
                        .eq('id', clientId);
                }
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

    useEffect(() => {
        if (activeTab === 'agenda') {
            fetchBookings();
        } else if (activeTab === 'clients') {
            fetchClients();
        } else if (activeTab === 'expenses') {
            fetchExpenses();
        }
    }, [activeTab]);

    const fetchExpenses = async () => {
        const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
        if (error) console.error('Error fetching expenses:', error);
        else setExpenses(data || []);
    };

    const handleAddExpense = async () => {
        if (!expenseDesc || !expenseAmount) {
            alert("Ingrese descripción y monto");
            return;
        }

        setExpensesLoading(true);
        try {
            // 1. Auto Classify
            const category = classifyExpenseStatic(expenseDesc);

            // 2. Save
            const { error } = await supabase.from('expenses').insert({
                description: expenseDesc,
                amount: parseInt(expenseAmount),
                category: category,
                date: new Date()
            });

            if (error) throw error;

            alert(`Gasto registrado como: ${category}`);
            setExpenseDesc('');
            setExpenseAmount('');
            fetchExpenses();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setExpensesLoading(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!window.confirm("¿Eliminar este gasto?")) return;
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) fetchExpenses();
    };

    const fetchBookings = async () => {
        // Fetch all bookings (optimization: fetch only current month/week range in future)
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) console.error('Error fetching bookings:', error);
        else setBookings(data || []);
    };

    // Agenda State
    const [weekStart, setWeekStart] = useState(new Date()); // Should default to current week's Monday
    const [selectedSlot, setSelectedSlot] = useState<{ date: string, time: string } | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Manual Booking Form State
    const [manualBookingName, setManualBookingName] = useState('');
    const [manualBookingPhone, setManualBookingPhone] = useState('');
    const [manualBookingService, setManualBookingService] = useState('Corte');
    const [manualBookingType, setManualBookingType] = useState<'salon' | 'domicilio' | 'bloqueo'>('salon');

    const getWeekDays = (start: Date) => {
        const days = [];
        // Adjust to Monday
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(start);
        monday.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(weekStart);
    const HOURS = Array.from({ length: 13 }, (_, i) => `${i + 9}:00`); // 9:00 to 21:00

    const handlePrevWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(weekStart.getDate() - 7);
        setWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(weekStart.getDate() + 7);
        setWeekStart(newDate);
    };

    const handleSlotClick = (dateStr: string, time: string) => {
        // Check if occupied
        const booking = bookings.find(b => b.date === dateStr && b.time === time);
        if (booking) {
            if (window.confirm(`¿${booking.name === 'BLOQUEADO' ? 'Desbloquear' : 'Eliminar reserva de ' + booking.name}?`)) {
                deleteBooking(booking.id);
            }
        } else {
            // Open Modal
            setSelectedSlot({ date: dateStr, time });
            setManualBookingType('salon'); // Reset
            setManualBookingName('');
            setManualBookingPhone('');
            setIsBookingModalOpen(true);
        }
    };

    const saveBooking = async () => {
        if (!selectedSlot) return;

        const isBlock = manualBookingType === 'bloqueo';
        const name = isBlock ? 'BLOQUEADO' : manualBookingName;

        if (!name && !isBlock) return alert("Ingrese nombre");

        try {
            const { error } = await supabase.from('bookings').insert({
                date: selectedSlot.date,
                time: selectedSlot.time,
                name: name,
                phone: manualBookingPhone || '00000000',
                email: 'manual@admin.com',
                service_id: isBlock ? 'block' : 'manual',
                service_name: isBlock ? 'Bloqueo' : manualBookingService,
                is_home_service: manualBookingType === 'domicilio',
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            alert(isBlock ? "Bloqueo registrado" : "Reserva creada");
            setIsBookingModalOpen(false);
            fetchBookings();
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const deleteBooking = async (id: string) => {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (!error) fetchBookings();
    };

    const fetchClients = async () => {
        let query = supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(50);

        if (searchTerm) {
            query = query.ilike('phone', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching clients:', error);
        else setClients(data || []);
    };

    useEffect(() => {
        if (activeTab === 'clients') {
            const delayDebounceFn = setTimeout(() => {
                fetchClients();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTerm]);

    const handleDeleteClient = async (id: string, phone: string) => {
        if (!window.confirm(`¿ESTÁS SEGURO? Esto eliminará al cliente ${phone} y todo su historial. Esta acción no se puede deshacer.`)) return;

        try {
            // Manual Cascade Delete
            await supabase.from('hair_service_log').delete().eq('client_id', id);
            await supabase.from('transactions').delete().eq('client_id', id);
            await supabase.from('visit_registrations').delete().eq('client_id', id);

            const { error } = await supabase.from('clients').delete().eq('id', id);

            if (error) throw error;

            alert('Cliente eliminado correctamente.');
            fetchClients();
        } catch (error: any) {
            alert('Error al eliminar: ' + error.message);
        }
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
        else setClientHistory(data || []);
        setHistoryLoading(false);
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        if (!window.confirm('¿Eliminar esta transacción?')) return;

        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if (error) {
            alert('Error: ' + error.message);
        } else {
            setClientHistory(prev => prev.filter(t => t.id !== transactionId));
        }
    };

    const openClientModal = (client: any = null) => {
        if (client) {
            setEditingClient(client);
            setClientFormName(client.name || '');
            setClientFormPhone(client.phone || '');
        } else {
            setEditingClient(null);
            setClientFormName('');
            setClientFormPhone('');
        }
        setIsClientModalOpen(true);
    };

    const saveClient = async () => {
        if (!clientFormPhone || clientFormPhone.length < 8) return alert("El teléfono debe tener 8 dígitos");

        // Simple validation or standardizing
        const phoneClean = clientFormPhone.replace(/[^0-9]/g, '');
        const fullPhone = '+569' + phoneClean;

        try {
            if (editingClient) {
                // Update
                const { error } = await supabase.from('clients').update({
                    name: clientFormName,
                    // Phone usually is not updated if it's ID, but if allowed:
                    // phone: fullPhone 
                }).eq('id', editingClient.id);
                if (error) throw error;
                alert('Cliente actualizado');
            } else {
                // Create
                // Check if exists first to avoid duplicate errors unique violation if needed, but phone should be unique
                const { error } = await supabase.from('clients').insert({
                    name: clientFormName,
                    phone: fullPhone,
                    member_token: 'manual-' + Date.now(), // Temp token for manual entries
                    visits: 0
                });
                if (error) throw error;
                alert('Cliente creado');
            }
            setIsClientModalOpen(false);
            fetchClients();
        } catch (err: any) {
            alert("Error al guardar cliente: " + err.message);
        }
    };

    useEffect(() => {
        if (scannerActive && !scanResult) {
            const html5QrCode = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanFailure
            ).catch(err => {
                console.error("Error starting scanner:", err);
                setMessage("Error iniciando cámara: " + err);
            });

            return () => {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
            };
        }
    }, [scannerActive, scanResult]);

    const recordTransaction = async (clientId: string, amount: number, type: string, description: string, additionalCost: number = 0, additionalCostDetail: string = '') => {
        if (amount <= 0) return;

        let cost = 0;

        // Fetch standard cost for service if applicable
        if (type === 'service') {
            // Try to match description to a service ID (simple heuristic for now)
            const service = SERVICES.find(s => description.includes(s.name));
            if (service) {
                const { data } = await supabase.from('service_costs').select('cost').eq('service_id', service.id).single();
                if (data) cost = data.cost;
            }
        }

        // Add additional cost (e.g. manual extras)
        // cost = Base Cost + Manual Extra Cost (if we want to track total cost in one column, OR keep them separate.
        // The implementation plan said: "Insert this value into the cost field".
        // FinancialDashboard calculates margin as: Amount - Cost - Additional_Cost. 
        // So 'cost' should be the BASE service cost. 'additional_cost' is already a separate column.

        const { error } = await supabase.from('transactions').insert({
            client_id: clientId,
            amount: amount,
            type: type,
            description: description,
            additional_cost: additionalCost,
            additional_cost_detail: additionalCostDetail,
            cost: cost
        });
        if (error) console.error("Error recording transaction:", error);
    };

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (scanResult) return;
        setScanResult(decodedText);
        setScannerActive(false);

        try {
            setMessage("Procesando...");
            // 1. Register Visit
            const { data, error } = await supabase.rpc('register_visit', { token_input: decodedText });

            if (error) throw error;

            if (data.success) {
                setMessage('OK: ' + data.message + ' Visitas: ' + data.new_visits);

                // 2. Record Transaction if Hair Service
                if (activeTab === 'hair') {
                    const price = parseInt(servicePrice) || 0;
                    // Need client ID to record transaction linked to client. 
                    // register_visit might not return ID directly in all versions, let's fetch client.
                    const { data: clientData } = await supabase.from('clients').select('id').eq('member_token', decodedText).single();
                    if (clientData) {
                        if (clientData) {
                            await recordTransaction(clientData.id, price, 'service', `Servicio: ${serviceType}`, 0, '');
                        }
                    }
                } else if (activeTab === 'ventas') {
                    const { data: clientData } = await supabase.from('clients').select('*').eq('member_token', decodedText).single();
                    if (clientData) {
                        setPosClient(clientData);
                        // alert(`Cliente seleccionado: ${clientData.name || clientData.phone}`); // Optional feedback
                    }
                }
            } else {
                setMessage('Error: ' + data.message);
            }

            setTimeout(() => {
                setScanResult(null);
                setMessage('');
            }, 4000);

        } catch (err) {
            console.error(err);
            setMessage("Error al procesar el código.");
            setScanResult(null);
        }
    };

    const onScanFailure = (error: any) => {
        console.warn(error);
    };

    const handleRedeemDiscount = async () => {
        if (!client) return;
        if (!window.confirm('¿Confirmar canje del 10% de Descuento?')) return;

        const { data, error } = await supabase.rpc('redeem_discount_5th', { token_input: client.member_token });
        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage(data.message);
            if (data.success) {
                const { data: updated } = await supabase.from('clients').select('*').eq('id', client.id).single();
                setClient(updated);
            }
        }
    };

    const handleRedeemFreeCut = async () => {
        if (!client) return;
        if (!window.confirm('¿Confirmar canje del Corte Gratis?')) return;

        const { data, error } = await supabase.rpc('redeem_free_cut', { token_input: client.member_token });
        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage(data.message);
            if (data.success) {
                const { data: updated } = await supabase.from('clients').select('*').eq('id', client.id).single();
                setClient(updated);
            }
        }
    };

    const handleAddVisit = async () => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 8) {
            alert("Ingrese un número válido (8 dígitos)");
            return;
        }
        const fullPhone = '+569' + cleanPhone;

        try {
            setMessage("Procesando...");

            if (activeTab === 'hair') {
                // Use new specific RPC for Hair Service Manual Entry
                const price = parseInt(servicePrice) || 0;
                const cost = parseInt(extraCost) || 0;

                const { data, error } = await supabase.rpc('add_hair_service_by_phone', {
                    phone_input: fullPhone,
                    service_type: serviceType,
                    service_price: price,
                    notes_input: `Ingreso Manual. Extras: ${extraCostDetail} ($${cost})`
                });

                if (error) throw error;

                if (data.success) {
                    // Record financial transaction separately
                    const { data: clientData } = await supabase.from('clients').select('id').eq('phone', fullPhone).single();

                    if (clientData) {
                        await recordTransaction(clientData.id, price, 'service', `Servicio: ${serviceType}`, cost, extraCostDetail);
                    }

                    setMessage(`✅ Servicio registrado. Total: ${data.new_total_services}. ${data.discount_5th_unlocked ? '¡DESCUENTO 10% DESBLOQUEADO!' : ''} ${data.free_cut_unlocked ? '¡CORTE GRATIS DESBLOQUEADO!' : ''}`);
                    setPhone('');
                    setExtraCost('');
                    setExtraCostDetail('');
                } else {
                    setMessage('Error: ' + data.message);
                }

            } else {
                // Legacy / Generic Visits Logic
                const { data: existingClient, error: fetchError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('phone', fullPhone)
                    .single();

                // If not found, create new (simple logic for now, or rely on upsert)
                let currentVisits = 0;
                if (existingClient) currentVisits = existingClient.visits;

                const newVisits = currentVisits + 1;

                const { data: upsertData, error: upsertError } = await supabase
                    .from('clients')
                    .upsert({
                        phone: fullPhone,
                        visits: newVisits,
                        last_visit: new Date().toISOString()
                    }, { onConflict: 'phone' })
                    .select()
                    .single();

                if (upsertError) throw upsertError;

                // Record Transaction
                const amount = (parseInt(visitAmount) || 0);
                await recordTransaction(upsertData.id, amount, 'service', 'Manual: Visita');

                setMessage('Visita registrada para ' + fullPhone + '. Total: ' + newVisits);
                setPhone('');
            }

        } catch (err: any) {
            console.error(err);
            setMessage("Error: " + (err.message || "Error desconocido"));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 py-12 md:pt-24">
            <h2 className="text-3xl serif text-stone-900 mb-8 border-b pb-4 flex justify-between items-center">
                <span>Panel de Atención</span>
                <button onClick={onLogout} className="text-sm bg-stone-200 px-3 py-1 rounded hover:bg-stone-300 transition">Salir</button>
            </h2>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-8">
                <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <PlusCircle className="text-green-600" />
                    Registrar Visita Manual
                </h3>
                <p className="text-sm text-stone-500 mb-6">
                    Ingrese número y monto para registrar.
                </p>

                <div className="flex gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="bg-stone-200 border border-stone-300 text-stone-600 px-3 py-3 rounded-lg font-bold">+569</span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length <= 8) setPhone(val);
                            }}
                            placeholder="12345678"
                            maxLength={8}
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-600 outline-none"
                        />
                    </div>
                    {activeTab === 'loyalty' && (
                        <input
                            type="number"
                            value={visitAmount}
                            onChange={(e) => setVisitAmount(e.target.value)}
                            placeholder="Monto ($)"
                            className="w-32 px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-600 outline-none"
                        />
                    )}
                    <button
                        onClick={handleAddVisit}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Save size={18} />
                        Registrar
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-stone-800 p-1 rounded-xl inline-flex">
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'loyalty' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'}`}
                        >
                            Visitas
                        </button>
                        <button
                            onClick={() => setActiveTab('hair')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'hair' ? 'bg-purple-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Peluquería
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Inventario
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'clients' ? 'bg-red-500 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Clientes
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'expenses' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            Compras
                        </button>
                    </div>
                </div>

                <div className="bg-stone-800 p-6 rounded-2xl shadow-xl border border-white/5">
                    <h3 className="serif text-xl mb-4 text-center text-white">
                        {activeTab === 'loyalty' ? 'Registrar Visita' : activeTab === 'hair' ? 'Registrar Servicio Peluquería' : activeTab === 'inventory' ? 'Gestión de Inventario' : activeTab === 'clients' ? 'Gestión de Clientes' : 'Control de Inversión y Compras'}
                    </h3>

                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            {/* Input Form */}
                            <div className="bg-stone-700/50 p-4 rounded-xl space-y-3">
                                <h4 className="text-white font-bold text-sm">Registrar Nueva Compra</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={expenseDesc}
                                        onChange={(e) => setExpenseDesc(e.target.value)}
                                        placeholder="Descripción (ej: Tijeras, Sillas...)"
                                        className="flex-1 bg-stone-900 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        placeholder="Monto"
                                        className="w-24 bg-stone-900 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    />
                                    <button
                                        onClick={handleAddExpense}
                                        disabled={expensesLoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-sm disabled:opacity-50"
                                    >
                                        {expensesLoading ? '...' : 'Guardar'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-400 italic">* La categoría se asigna automáticamente con IA.</p>
                            </div>

                            {/* Investment Summary */}
                            <div className="grid grid-cols-2 gap-3">
                                {['Materiales', 'Herramientas', 'Mobiliario', 'Insumos Recepción', 'Otros'].map(cat => { // Explicit order
                                    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
                                    return (
                                        <div key={cat} className="bg-stone-900 p-3 rounded-lg border border-white/5">
                                            <div className="text-stone-400 text-[10px] uppercase font-bold">{cat}</div>
                                            <div className="text-emerald-400 font-mono text-lg font-bold">${total.toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                                <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-500/30 col-span-2">
                                    <div className="text-emerald-200 text-xs uppercase font-bold">Inversión Total</div>
                                    <div className="text-white font-mono text-2xl font-bold">
                                        ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Recent List */}
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-xs text-left text-stone-300">
                                    <thead className="sticky top-0 bg-stone-800">
                                        <tr className="text-stone-500 border-b border-stone-700">
                                            <th className="pb-2">Desc</th>
                                            <th className="pb-2">Cat</th>
                                            <th className="pb-2 text-right">Monto</th>
                                            <th className="pb-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-700">
                                        {expenses.map(e => (
                                            <tr key={e.id}>
                                                <td className="py-2">{e.description}</td>
                                                <td className="py-2"><span className="bg-stone-700 px-1 rounded text-[10px]">{e.category}</span></td>
                                                <td className="py-2 text-right text-emerald-400">${e.amount.toLocaleString()}</td>
                                                <td className="py-2 text-right">
                                                    <button onClick={() => handleDeleteExpense(e.id)} className="text-red-500 hover:text-red-400"><X size={12} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Buscar por teléfono..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-stone-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                                <button onClick={() => openClientModal()} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <PlusCircle size={16} /> Nuevo
                                </button>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-xs text-left text-stone-300">
                                    <thead className="text-xs text-stone-400 uppercase bg-stone-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2">Nombre</th>
                                            <th className="px-3 py-2">Teléfono</th>
                                            <th className="px-3 py-2 text-center">Visitas</th>
                                            <th className="px-3 py-2 text-center">Peluquería</th>
                                            <th className="px-3 py-2 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((c) => (
                                            <tr key={c.id} className="border-b border-stone-700 hover:bg-stone-700/20">
                                                <td className="px-3 py-2 text-white font-medium">{c.name || 'Sin nombre'}</td>
                                                <td className="px-3 py-2 text-stone-300 font-mono">{c.phone}</td>
                                                <td className="px-3 py-2 text-center">{c.visits}</td>
                                                <td className="px-3 py-2 text-center text-purple-400 font-bold">{c.hair_service_count || 0}</td>
                                                <td className="px-3 py-2 text-right flex justify-end gap-1">
                                                    <button
                                                        onClick={() => fetchClientHistory(c)}
                                                        className="bg-purple-600/20 hover:bg-purple-600 hover:text-white text-purple-400 p-1.5 rounded transition"
                                                        title="Ver Historial"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openClientModal(c)}
                                                        className="bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-500 p-1.5 rounded transition"
                                                        title="Editar Cliente"
                                                    >
                                                        <Scissors size={14} className="rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClient(c.id, c.phone)}
                                                        className="bg-red-600/20 hover:bg-red-600 hover:text-white text-red-500 p-1.5 rounded transition"
                                                        title="Eliminar Cliente"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clients.length === 0 && <p className="text-center text-stone-500 py-4">No se encontraron clientes.</p>}
                            </div>

                            {/* Client Modal */}
                            {isClientModalOpen && (
                                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                    <div className="bg-stone-800 p-6 rounded-2xl w-full max-w-sm border border-stone-600 shadow-2xl">
                                        <h3 className="text-xl font-bold text-white mb-4">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>

                                        <div className="space-y-3 mb-6">
                                            <div>
                                                <label className="text-xs text-stone-500 mb-1 block">Teléfono (ID único)</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-stone-800 border border-stone-700 text-stone-400 px-2 py-2 rounded text-sm">+569</span>
                                                    <input
                                                        className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-white text-sm disabled:opacity-50"
                                                        placeholder="12345678"
                                                        value={clientFormPhone}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            if (val.length <= 8) setClientFormPhone(val);
                                                        }}
                                                        disabled={!!editingClient} // Disable phone editing if updating to avoid ID issues for now
                                                        maxLength={8}
                                                    />
                                                </div>
                                                {editingClient && <p className="text-[10px] text-stone-500 mt-1">El teléfono no se puede cambiar.</p>}
                                            </div>
                                            <div>
                                                <label className="text-xs text-stone-500 mb-1 block">Nombre</label>
                                                <input
                                                    className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-white text-sm"
                                                    placeholder="Nombre Cliente"
                                                    value={clientFormName}
                                                    onChange={e => setClientFormName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={() => setIsClientModalOpen(false)} className="flex-1 py-2 rounded bg-stone-700 text-white text-sm hover:bg-stone-600">Cancelar</button>
                                            <button onClick={saveClient} className="flex-1 py-2 rounded bg-green-600 text-white font-bold text-sm hover:bg-green-500">Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Client History Modal */}
                            {selectedClientForHistory && (
                                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                    <div className="bg-stone-800 p-6 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col border border-stone-600 shadow-2xl">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Historial de Servicios</h3>
                                                <p className="text-sm text-stone-400">
                                                    {selectedClientForHistory.name || 'Cliente'} - {selectedClientForHistory.phone}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedClientForHistory(null);
                                                    setClientHistory([]);
                                                }}
                                                className="p-2 hover:bg-stone-700 rounded-full text-stone-400"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {historyLoading ? (
                                            <div className="py-12 text-center text-stone-400">Cargando historial...</div>
                                        ) : clientHistory.length === 0 ? (
                                            <div className="py-12 text-center text-stone-500 bg-stone-900 rounded-lg border border-stone-700">
                                                <p>Este cliente no tiene transacciones registradas.</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-y-auto flex-1">
                                                <table className="w-full text-xs text-left text-stone-300">
                                                    <thead className="text-xs uppercase bg-stone-700 text-stone-400 sticky top-0">
                                                        <tr>
                                                            <th className="px-3 py-2">Fecha</th>
                                                            <th className="px-3 py-2">Descripción</th>
                                                            <th className="px-3 py-2 text-right">Monto</th>
                                                            <th className="px-3 py-2 w-8"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {clientHistory.map((t) => (
                                                            <tr key={t.id} className="border-b border-stone-700 hover:bg-stone-700/30">
                                                                <td className="px-3 py-2 text-stone-500 text-[10px]">
                                                                    {new Date(t.created_at).toLocaleDateString('es-CL')}
                                                                </td>
                                                                <td className="px-3 py-2 text-white">
                                                                    {t.description || (t.type === 'service' ? 'Servicio' : 'Producto')}
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-emerald-400 font-bold">
                                                                    ${t.amount.toLocaleString()}
                                                                </td>
                                                                <td className="px-3 py-2 text-right">
                                                                    <button
                                                                        onClick={() => handleDeleteTransaction(t.id)}
                                                                        className="text-red-500 hover:text-red-400 p-1"
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="bg-stone-900 font-bold text-white">
                                                        <tr>
                                                            <td colSpan={2} className="px-3 py-2">Total</td>
                                                            <td className="px-3 py-2 text-right text-emerald-400">
                                                                ${clientHistory.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-stone-700">
                                            <button
                                                onClick={() => {
                                                    setSelectedClientForHistory(null);
                                                    setClientHistory([]);
                                                }}
                                                className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-white rounded font-bold text-sm"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-stone-300">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-700/50">
                                    <tr>
                                        <th className="px-3 py-2">Perfume</th>
                                        <th className="px-3 py-2 text-center">Stock</th>
                                        <th className="px-3 py-2 text-center">Precio 10ml</th>
                                        <th className="px-3 py-2 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERFUMES.map((p) => {
                                        // We need to fetch real stock here as well, but for now we might rely on a unified fetch or just prop drilling?
                                        // For simplicity in this component, let's fetch inventory once on load
                                        return (
                                            <InventoryRow key={p.id} perfume={p} onSell={(amount, desc) => recordTransaction(client?.id || 'anon', amount, 'product', desc)} />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}



                    {activeTab === 'hair' && (
                        <div className="mb-4 space-y-3">
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="Corte">Corte ($7.000+)</option>
                                <option value="Lavado">Lavado ($5.000)</option>
                                <option value="Tintura">Tintura ($10.000+)</option>
                                <option value="Masaje">Masaje ($5.000)</option>
                            </select>
                            <input
                                type="number"
                                value={servicePrice}
                                onChange={(e) => setServicePrice(e.target.value)}
                                placeholder="Precio Real"
                                className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={extraCost}
                                    onChange={(e) => setExtraCost(e.target.value)}
                                    placeholder="Costo Extra ($)"
                                    className="w-1/3 bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                                <input
                                    type="text"
                                    value={extraCostDetail}
                                    onChange={(e) => setExtraCostDetail(e.target.value)}
                                    placeholder="Detalle (ej: Luz, Café)"
                                    className="w-2/3 bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>
                    )}



                    {activeTab !== 'inventory' && activeTab !== 'clients' && activeTab !== 'expenses' && (
                        <button
                            onClick={() => setScannerActive(true)}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition ${activeTab === 'hair' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-stone-900'}`}
                        >
                            <QrCode size={24} />
                            {activeTab === 'hair' ? 'Escanear para Servicio' : 'Escanear Tarjeta'}
                        </button>
                    )}


                    {message && (
                        <div className="mt-4 p-3 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium whitespace-pre-wrap">
                            {message}
                        </div>
                    )}

                    {/* Client display logic (same as before) */}
                    {client && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h3 className="font-bold text-white mb-3">Cliente: {client.phone}</h3>
                            {/* ... Discount buttons ... */}
                            <div className="space-y-3">
                                {client.discount_5th_visit_available ? (
                                    <button onClick={handleRedeemDiscount} className="w-full bg-purple-600 text-white py-2 rounded">Canjear 10%</button>
                                ) : <div className="text-stone-500 text-xs text-center">Sin descuento disponible</div>}
                            </div>
                        </div>
                    )}
                </div>

                {scannerActive && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-white p-4 rounded-2xl w-full max-w-sm relative">
                            <button onClick={() => setScannerActive(false)} className="absolute -top-12 right-0 text-white p-2">
                                <X size={32} />
                            </button>
                            <h3 className="text-center font-bold mb-4">Escanea el Código del Cliente</h3>
                            <div id="reader" className="w-full bg-stone-100 rounded-lg overflow-hidden"></div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ServicePanel;
