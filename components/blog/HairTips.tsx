import React, { useState } from 'react';
import { ArrowRight, Sparkles, Droplets, Sun, Wind, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Article {
    id: string;
    title: string;
    preview: string;
    icon: React.ReactNode;
    fullTip: string;
    relatedProduct?: string;
}

const ARTICLES: Article[] = [
    {
        id: '1',
        title: 'Hidratación Profunda',
        preview: '¿Cabello seco y sin vida? Descubre el secreto de la hidratación.',
        icon: <Droplets className="text-blue-400" size={24} />,
        fullTip: 'El agua caliente abre la cutícula y reseca tu cabello. Intenta lavar siempre con agua tibia y terminar con un chorro de agua fría para sellar el brillo. Complementa con una mascarilla hidratante una vez a la semana.',
        relatedProduct: 'Masaje Capilar'
    },
    {
        id: '2',
        title: 'Protección Térmica',
        preview: 'No quemes tu cabello. Aprende a usar el calor a tu favor.',
        icon: <Sun className="text-amber-500" size={24} />,
        fullTip: 'Antes de usar secador o plancha, SIEMPRE aplica un protector térmico. Es la diferencia entre un cabello sano y uno quebradizo. Ajusta la temperatura a medio, no máximo.',
        relatedProduct: 'Brushing'
    },
    {
        id: '3',
        title: 'Corte de Puntas',
        preview: '¿Mito o realidad? Cortar las puntas hace crecer el pelo.',
        icon: <Scissors className="text-rose-400" size={24} />,
        fullTip: 'Cortar las puntas no hace que crezca más rápido desde la raíz, pero evita que las puntas abiertas se sigan partiendo hacia arriba (tripa). Un corte cada 2-3 meses mantiene tu largo saludable.',
        relatedProduct: 'Corte de Puntas'
    },
    {
        id: '4',
        title: 'Cuidado del Color',
        preview: 'Mantén tu tinte vibrante por mucho más tiempo.',
        icon: <Sparkles className="text-purple-400" size={24} />,
        fullTip: 'Usa shampoos sin sulfatos para cabellos teñidos. El sol oxida el color, así que usa sombreros o productos con filtro UV en verano. Lava tu cabello cada 2-3 días, no a diario.',
        relatedProduct: 'Aplicación de Tintura'
    },
    {
        id: '5',
        title: 'Frizz Control',
        preview: 'Doma el volumen y luce un cabello suave y ordenado.',
        icon: <Wind className="text-teal-400" size={24} />,
        fullTip: 'El frizz es falta de hidratación. No frotes tu cabello con la toalla; presiona suavemente. Usa fundas de almohada de satén o seda para evitar la fricción mientras duermes.',
        relatedProduct: 'Corte Bordado'
    }
];

const HairTips: React.FC = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <section className="py-20 bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">Blog de Expertos</span>
                    <h2 className="serif text-4xl mt-2 text-stone-900">Secretos de Greici Nataly</h2>
                    <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                        Tips profesionales para que mantengas tu cabello radiante entre cada visita al salón.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ARTICLES.map((article) => (
                        <div
                            key={article.id}
                            className={`bg-white rounded-2xl p-6 shadow-sm border border-stone-100 transition-all duration-300 ${expandedId === article.id ? 'row-span-2 shadow-md ring-1 ring-stone-200' : 'hover:shadow-md'}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-stone-50 p-3 rounded-xl">
                                    {article.icon}
                                </div>
                                {article.relatedProduct && (
                                    <span className="text-[10px] bg-stone-100 px-2 py-1 rounded-full text-stone-500 font-bold uppercase">
                                        Recomendado
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-stone-900 mb-2">{article.title}</h3>

                            {expandedId === article.id ? (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <p className="text-stone-600 leading-relaxed mb-6 font-light">
                                        {article.fullTip}
                                    </p>
                                    <div className="flex justify-between items-center border-t border-stone-100 pt-4">
                                        <button
                                            onClick={() => setExpandedId(null)}
                                            className="text-stone-400 text-sm hover:text-stone-600 font-medium transition"
                                        >
                                            Cerrar
                                        </button>
                                        <a href="#booking-section" className="text-stone-900 text-sm font-bold flex items-center gap-1 hover:underline">
                                            Agendar {article.relatedProduct} <ArrowRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-stone-500 text-sm mb-4">
                                        {article.preview}
                                    </p>
                                    <button
                                        onClick={() => setExpandedId(article.id)}
                                        className="text-stone-900 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all group"
                                    >
                                        Leer Tip <ArrowRight size={14} className="group-hover:text-amber-500 transition-colors" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
                        <img
                            src="/images/gallery/work_1.png"
                            alt="Greici"
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Greici+Nataly&background=random'}
                        />
                        <span className="text-sm text-stone-600 italic">
                            "Tu cabello es tu corona, cuídalo con amor." — <span className="font-bold text-stone-900">Greici Nataly</span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HairTips;
