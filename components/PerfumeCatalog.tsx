import React, { useMemo, useState, useEffect } from 'react';
import { PERFUMES, PHONE_NUMBER } from '../constants';
import { supabase } from '../services/supabaseClient';
import { Perfume } from '../types';
import { Search, ShoppingBag, MessageCircle, PackageSearch, X, Star, Crown, Sparkles, Info, DollarSign, Tag, Check } from 'lucide-react';
import PerfumeRecommender from './PerfumeRecommender';

const PerfumeCatalog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'classic' | 'arab'>('all');
    const [inventory, setInventory] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        const { data } = await supabase.from('inventory').select('product_id, quantity');
        if (data) {
            const invMap: Record<string, number> = {};
            data.forEach((item: any) => {
                invMap[item.product_id] = item.quantity;
            });
            setInventory(invMap);
        }
    };

    const handleRecommendation = (perfumeId: string) => {
        setSearchTerm('');
        // Find the perfume to set category if needed or just scroll
        const p = PERFUMES.find(x => x.id === perfumeId);
        if (p) {
            setSelectedCategory(p.category as any); // Switch to correct category tab
            // Use setTimeout to allow render, then scroll
            setTimeout(() => {
                const el = document.getElementById(`perfume-${perfumeId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight effect
                el?.classList.add('ring-4', 'ring-purple-500', 'ring-opacity-50');
                setTimeout(() => el?.classList.remove('ring-4', 'ring-purple-500', 'ring-opacity-50'), 2000);
            }, 100);
        }
    };

    // Extract unique notes for filter chips
    const allNotes = useMemo(() => {
        const notes = new Set<string>();
        PERFUMES.forEach(p => p.notes.forEach(n => notes.add(n)));
        return Array.from(notes).sort();
    }, []);

    const filteredPerfumes = useMemo(() => {
        return PERFUMES.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesNote = selectedNote ? p.notes.includes(selectedNote) : true;
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            return matchesSearch && matchesNote && matchesCategory;
        }).sort((a, b) => {
            // Sort by Stock (Real Inventory > 0 or Static Stock true)
            const stockA = inventory[a.id] !== undefined ? inventory[a.id] > 0 : a.stock;
            const stockB = inventory[b.id] !== undefined ? inventory[b.id] > 0 : b.stock;
            if (stockA === stockB) return 0;
            return stockA ? -1 : 1;
        });
    }, [searchTerm, selectedNote, selectedCategory, inventory]);

    const classics = filteredPerfumes.filter(p => p.category === 'classic');
    const arabs = filteredPerfumes.filter(p => p.category === 'arab');

    const handleOrder = (perfume: Perfume, size: '5ml' | '10ml') => {
        const price = size === '5ml' ? perfume.price5ml : perfume.price10ml;
        const message = `Hola Tus3B Style, quiero comprar el decant de *${perfume.brand} - ${perfume.name}* en formato *${size}* por $${price}. ¿Tienen disponibilidad?`;
        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleFullBottleOrder = (perfume: Perfume) => {
        if (!perfume.priceFullBottle) return;
        const message = `Hola Tus3B Style, quiero comprar la botella completa de *${perfume.brand} - ${perfume.name}* por $${perfume.priceFullBottle.toLocaleString('es-CL')}. ¿Tienen disponibilidad?`;
        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleSpecialRequest = () => {
        const message = "Hola Tus3B Style, me gustaría cotizar/encargar un perfume que no veo en el catálogo.";
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const renderGrid = (items: Perfume[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {items.map((perfume, index) => (
                <div key={perfume.id} className="group flex flex-col h-full">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-2xl mb-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100 transition-all duration-300 group-hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
                        {/* Ranking Badge if no filter active (assumes standard order) */}
                        {!searchTerm && !selectedNote && (
                            <div className="absolute top-0 left-0 bg-stone-900 text-white w-8 h-8 flex items-center justify-center font-serif text-sm border-br-xl z-10">
                                {index + 1}
                            </div>
                        )}

                        <div className="relative w-full h-full p-8 transition-transform duration-700 ease-out group-hover:scale-105">
                            <img
                                src={perfume.image}
                                alt={perfume.name}
                                className={`w-full h-full object-contain ${perfume.secondaryImage ? 'transition-opacity duration-500 group-hover:opacity-0' : ''}`}
                            />
                            {perfume.secondaryImage && (
                                <img
                                    src={perfume.secondaryImage}
                                    alt={`${perfume.name} detalle`}
                                    className="absolute inset-0 w-full h-full object-contain p-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                                />
                            )}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                            Original
                        </div>
                        {!perfume.stock && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                                <span className="bg-stone-900 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg">Agotado</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col">
                        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">{perfume.brand}</h4>
                        <h3 className="serif text-2xl text-stone-900 mb-2 group-hover:text-stone-700 transition-colors">{perfume.name}</h3>
                        <p className="text-stone-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">{perfume.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {perfume.notes.slice(0, 3).map(note => (
                                <span key={note} className="text-[10px] uppercase tracking-wide bg-stone-50 text-stone-500 px-2 py-1 rounded border border-stone-100">
                                    {note}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto space-y-3">
                            {/* Decant Options - Only if NOT a spray */}
                            {!perfume.isSpray && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleOrder(perfume, '5ml')}
                                        disabled={!perfume.stock}
                                        className={`group/btn flex flex-col items-center justify-center p-2.5 border rounded-lg transition-all duration-300 ${!perfume.stock ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed' : 'border-stone-200 hover:border-stone-900 hover:bg-stone-900'}`}
                                    >
                                        <span className="text-[10px] font-bold text-stone-500 uppercase mb-0.5 group-hover/btn:text-stone-400">5 ML</span>
                                        <span className="text-stone-900 font-semibold group-hover/btn:text-white">${perfume.price5ml.toLocaleString('es-CL')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleOrder(perfume, '10ml')}
                                        disabled={!perfume.stock}
                                        className={`group/btn flex flex-col items-center justify-center p-2.5 border rounded-lg transition-all duration-300 ${!perfume.stock ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed' : 'border-stone-200 hover:border-stone-900 hover:bg-stone-900'}`}
                                    >
                                        <span className="text-[10px] font-bold text-stone-500 uppercase mb-0.5 group-hover/btn:text-stone-400">10 ML</span>
                                        <span className="text-stone-900 font-semibold group-hover/btn:text-white">${perfume.price10ml.toLocaleString('es-CL')}</span>
                                    </button>
                                </div>
                            )}

                            {/* Full Bottle Option - Only if price exists */}
                            {perfume.priceFullBottle && (
                                <button
                                    onClick={() => handleFullBottleOrder(perfume)}
                                    disabled={!(inventory[perfume.id] !== undefined ? inventory[perfume.id] > 0 : perfume.stock)}
                                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-bold uppercase text-xs tracking-wider transition-all ${!(inventory[perfume.id] !== undefined ? inventory[perfume.id] > 0 : perfume.stock)
                                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                        : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    <ShoppingBag size={14} />
                                    <span>Botella {perfume.isSpray ? '200ml' : '100ml'} - ${perfume.priceFullBottle.toLocaleString('es-CL')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-16 fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col border-b border-stone-200 pb-8 gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="serif text-4xl text-stone-900">Catálogo de Decants</h3>
                        <p className="text-stone-500 mt-2 max-w-xl">
                            Descubre tu firma olfativa con nuestra curaduría de perfumes 100% originales.
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Buscar marca o nombre..."
                            className="pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-stone-900 focus:border-stone-900 w-full transition-shadow hover:shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-3.5 text-stone-400" />
                    </div>
                </div>

                {/* Filters */}
                <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    <div className="flex flex-nowrap md:flex-wrap gap-2 items-center min-w-max">
                        <span className="text-xs font-bold uppercase text-stone-400 mr-2 sticky left-0 bg-white pl-2 md:pl-0">Filtrar:</span>
                        {allNotes.map(note => (
                            <button
                                key={note}
                                onClick={() => setSelectedNote(selectedNote === note ? null : note)}
                                className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap ${selectedNote === note
                                    ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                                    : 'bg-white text-stone-600 border-stone-200 active:bg-stone-100'
                                    }`}
                            >
                                {note}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECCIÓN CLÁSICOS */}
            {classics.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-stone-100 p-2 rounded-full">
                            <Crown size={24} className="text-stone-800" />
                        </div>
                        <div>
                            <h2 className="serif text-3xl text-stone-900">Clásicos del Lujo</h2>
                            <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mt-1">Ranking de Tendencia 2025-26</p>
                        </div>
                    </div>
                    {renderGrid(classics)}
                </section>
            )}

            {classics.length > 0 && arabs.length > 0 && <div className="border-t border-stone-100"></div>}

            {/* SECCIÓN ÁRABES */}
            {arabs.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-amber-50 p-2 rounded-full">
                            <Sparkles size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="serif text-3xl text-stone-900">Tendencia Árabe</h2>
                            <p className="text-sm text-amber-600/80 uppercase tracking-widest font-bold mt-1">Exclusividad & Notas Gourmand</p>
                        </div>
                    </div>
                    {renderGrid(arabs)}
                </section>
            )}

            {filteredPerfumes.length === 0 && (
                <div className="text-center py-24 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                    <h4 className="text-stone-900 font-bold text-lg mb-1">No encontramos resultados</h4>
                    <p className="text-stone-500 text-sm">Prueba ajustando tus filtros de búsqueda.</p>
                </div>
            )}

            {/* Special Requests Banner */}
            <div className="mt-20 bg-stone-900 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full mb-6 ring-1 ring-white/20">
                        <PackageSearch size={32} className="text-yellow-200" />
                    </div>
                    <h3 className="serif text-3xl md:text-5xl mb-6">¿Buscas algo exclusivo?</h3>
                    <p className="text-stone-300 mb-10 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Si no encuentras tu fragancia favorita en nuestro catálogo, contáctanos.
                        Hacemos encargos especiales para que encuentres tu firma olfativa perfecta.
                    </p>
                    <button
                        onClick={handleSpecialRequest}
                        className="group inline-flex items-center bg-white text-stone-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-stone-100 transition-all transform hover:-translate-y-1 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <MessageCircle className="mr-3 group-hover:text-amber-600 transition-colors" size={20} />
                        Cotizar Encargo
                    </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay grayscale"></div>
            </div>
            {/* Recommender */}
            <PerfumeRecommender onSelectPerfume={handleRecommendation} />
        </div>
    );
};

export default PerfumeCatalog;