import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Check, Smartphone } from 'lucide-react';
import { detectPlatform } from '../services/walletPassService';

const AddToWalletButtons: React.FC = () => {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        const platform = detectPlatform();
        setIsIOS(platform === 'ios');

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
        }

        // Catch install prompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (isIOS) {
            setShowIOSInstructions(true);
        } else if (installPrompt) {
            installPrompt.prompt();
            installPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('App instalada correctamente');
                }
                setInstallPrompt(null);
            });
        } else {
            alert('Para instalar, busca la opción "Agregar a pantalla de inicio" en el menú de tu navegador.');
        }
    };

    // Already installed — show success badge
    if (isStandalone) {
        return (
            <div className="mt-6 w-full">
                <div className="bg-green-500/10 text-green-400 px-5 py-4 rounded-2xl border border-green-500/20 flex items-center justify-center gap-3 backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check size={18} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-sm">App Instalada Correctamente</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 mt-6 w-full">
            {/* Install App Button */}
            <button
                onClick={handleInstallClick}
                className="relative overflow-hidden w-full bg-gradient-to-br from-stone-800 to-stone-900 text-white p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group active:scale-[0.98]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative rounded-xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                            <Smartphone className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Acceso Directo</p>
                            <p className="font-bold text-lg leading-tight">Guardar en mi Celular</p>
                            <p className="text-stone-400 text-xs mt-0.5">Accede a tu tarjeta con un toque</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all border border-amber-500/20">
                        <Download size={18} />
                    </div>
                </div>
            </button>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[28px] p-7 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-stone-900">Guardar en tu iPhone</h3>
                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                            >
                                <X size={16} className="text-stone-500" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Step 1 */}
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-md">1</div>
                                <div>
                                    <p className="font-bold text-stone-900">Toca el ícono de Compartir</p>
                                    <p className="text-stone-500 text-sm mt-0.5">Está en la parte inferior de Safari.</p>
                                    <div className="mt-2 flex justify-center">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <Share className="text-blue-500" size={22} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-stone-100" />

                            {/* Step 2 */}
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-md">2</div>
                                <div>
                                    <p className="font-bold text-stone-900">Selecciona "Agregar a Inicio"</p>
                                    <p className="text-stone-500 text-sm mt-0.5">Desliza hacia abajo en el menú.</p>
                                    <div className="mt-2 flex items-center gap-2 bg-stone-100 px-4 py-2.5 rounded-xl w-fit">
                                        <PlusSquare size={16} className="text-stone-600" />
                                        <span className="text-sm font-medium text-stone-700">Agregar a Inicio</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowIOSInstructions(false)}
                            className="w-full mt-8 bg-stone-900 text-white py-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-transform"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddToWalletButtons;
