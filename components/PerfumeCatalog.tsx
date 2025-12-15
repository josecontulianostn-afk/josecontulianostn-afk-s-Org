import React, { useState, useMemo } from 'react';
import { PERFUMES, PHONE_NUMBER } from '../constants';
import { Perfume } from '../types';
import { Search, ShoppingBag, MessageCircle, PackageSearch, X } from 'lucide-react';

const PerfumeCatalog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNote, setSelectedNote] = useState<string | null>(null);

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
            return matchesSearch && matchesNote;
        });
    }, [searchTerm, selectedNote]);

    const handleOrder = (perfume: Perfume, size: '5ml' | '10ml') => {
        const price = size === '5ml' ? perfume.price5ml : perfume.price10ml;
        const message = `Hola Tus3B Style, quiero comprar el decant de *${perfume.brand} - ${perfume.name}* en formato *${size}* por $${price}. ¿Tienen disponibilidad?`;
        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleSpecialRequest = () => {
        const message = "Hola Tus3B Style, me gustaría cotizar/encargar un perfume que no veo en el catálogo.";
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="space-y-10 fade-in">
            <div className="flex flex-col border-b border-stone-200 pb-8 gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="serif text-4xl text-stone-900">Catálogo de Decants</h3>
                        <p className="text-stone-500 mt-2 max-w-xl">
                            Fragancias originales fraccionadas en atomizadores de vidrio de alta calidad.
                            Lleva tu aroma favorito a donde vayas sin pagar el precio de la botella completa.
                        </p>
                    </div>

                    {/* Search Bar */}
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

                {/* Note Filters - Horizontal Scroll on Mobile */}
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
                        {selectedNote && (
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="ml-2 text-stone-400 hover:text-stone-900 transition-colors p-2"
                                aria-label="Limpiar filtro"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredPerfumes.map(perfume => (
                    <div key={perfume.id} className="group flex flex-col h-full">
                        <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-2xl mb-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100 transition-all duration-300 group-hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
                            <img
                                src={perfume.image}
                                alt={perfume.name}
                                className="w-full h-full object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-110"
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900/90 text-white text-xs px-2 py-1 rounded">
                                Original
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h4 className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">{perfume.brand}</h4>
                            <h3 className="serif text-2xl text-stone-900 mb-2 group-hover:text-stone-700 transition-colors">{perfume.name}</h3>
                            <p className="text-stone-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">{perfume.description}</p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {perfume.notes.slice(0, 3).map(note => (
                                    <span key={note} className="text-[10px] uppercase tracking-wide bg-stone-50 text-stone-500 px-2 py-1 rounded border border-stone-100">
                                        {note}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => handleOrder(perfume, '5ml')}
                                    className="group/btn flex flex-col items-center justify-center p-2.5 border border-stone-200 rounded-lg hover:border-stone-900 hover:bg-stone-900 transition-all duration-300"
                                >
                                    <span className="text-[10px] font-bold text-stone-500 uppercase mb-0.5 group-hover/btn:text-stone-400">5 ML</span>
                                    <span className="text-stone-900 font-semibold group-hover/btn:text-white">${perfume.price5ml.toLocaleString('es-CL')}</span>
                                </button>
                                <button
                                    onClick={() => handleOrder(perfume, '10ml')}
                                    className="group/btn flex flex-col items-center justify-center p-2.5 border border-stone-200 rounded-lg hover:border-stone-900 hover:bg-stone-900 transition-all duration-300"
                                >
                                    <span className="text-[10px] font-bold text-stone-500 uppercase mb-0.5 group-hover/btn:text-stone-400">10 ML</span>
                                    <span className="text-stone-900 font-semibold group-hover/btn:text-white">${perfume.price10ml.toLocaleString('es-CL')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPerfumes.length === 0 && (
                <div className="text-center py-24 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                    <h4 className="text-stone-900 font-bold text-lg mb-1">No encontramos resultados</h4>
                    <p className="text-stone-500 text-sm">Prueba ajustando tus filtros de búsqueda.</p>
                    {selectedNote && (
                        <button onClick={() => setSelectedNote(null)} className="text-stone-900 underline text-sm mt-4 font-medium hover:text-stone-600">
                            Borrar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Special Requests Section */}
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
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay grayscale"></div>
            </div>
        </div>
    );
};

export default PerfumeCatalog;