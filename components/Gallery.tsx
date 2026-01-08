import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { GALLERY_IMAGES } from '../constants';

const Gallery: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const categories = ['Todos', 'Cortes', 'Color', 'Peinados'];

    const filteredImages = selectedCategory === 'Todos'
        ? GALLERY_IMAGES
        : GALLERY_IMAGES.filter(img => img.category === selectedCategory);

    return (
        <div className="animate-in fade-in duration-700">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${selectedCategory === cat
                                ? 'bg-stone-900 text-white shadow-lg scale-105'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Gallery Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4">
                {filteredImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-xl shadow-md bg-stone-100"
                        onClick={() => setSelectedImage(img.url)}
                    >
                        <img
                            src={img.url}
                            alt={img.description}
                            className="w-full h-auto object-cover transform transition duration-700 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                                <ZoomIn className="mx-auto mb-2 opacity-80" />
                                <p className="font-serif italic text-lg">{img.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoom"
                        className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl scale-in-95 animate-in duration-300"
                    />
                </div>
            )}
        </div>
    );
};

export default Gallery;
