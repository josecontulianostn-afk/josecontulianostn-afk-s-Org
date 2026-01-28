import React, { useState } from 'react';
import { Wallet, Smartphone, ExternalLink, Copy, Check, X } from 'lucide-react';
import { detectPlatform, openAppleWalletGenerator } from '../services/walletPassService';

interface AddToWalletButtonsProps {
    clientName: string;
    token: string;
    visits: number;
    tier: 'Bronce' | 'Plata' | 'Gold';
}

const AddToWalletButtons: React.FC<AddToWalletButtonsProps> = ({
    clientName,
    token,
    visits,
    tier
}) => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'apple' | 'google'>('apple');
    const [copied, setCopied] = useState(false);
    const platform = detectPlatform();

    const handleAppleWallet = () => {
        setModalType('apple');
        setShowModal(true);
    };

    const handleGoogleWallet = () => {
        setModalType('google');
        setShowModal(true);
    };

    const handleCopyToken = async () => {
        try {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copying:', err);
        }
    };

    const handleOpenGenerator = () => {
        if (modalType === 'apple') {
            openAppleWalletGenerator({ clientName, token, visits, tier });
        } else {
            // Google Wallet - usar 99minds (servicio gratuito)
            window.open('https://99minds.io/wallet-pass-creator', '_blank');
        }
    };

    const tierEmoji: Record<string, string> = {
        'Bronce': '🥉',
        'Plata': '🥈',
        'Gold': '🥇'
    };

    // Determinar qué botones mostrar según la plataforma
    const showApple = platform === 'ios' || platform === 'other';
    const showGoogle = platform === 'android' || platform === 'other';

    return (
        <>
            <div className="mt-4 flex flex-col gap-2">
                {/* Apple Wallet Button */}
                {showApple && (
                    <button
                        onClick={handleAppleWallet}
                        className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group w-full"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        <span className="font-medium">Agregar a Apple Wallet</span>
                    </button>
                )}

                {/* Google Wallet Button */}
                {showGoogle && (
                    <button
                        onClick={handleGoogleWallet}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group w-full border border-gray-200"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="font-medium">Agregar a Google Wallet</span>
                    </button>
                )}

                {/* Info text */}
                <p className="text-[10px] text-stone-500 text-center">
                    {platform === 'ios' ? 'Disponible para iPhone • Gratis' :
                        platform === 'android' ? 'Disponible para Android • Gratis' :
                            'Disponible para iPhone y Android • Gratis'}
                </p>
            </div>

            {/* Modal con instrucciones */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-stone-800">
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${modalType === 'apple'
                                        ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                                        : 'bg-gradient-to-br from-blue-500 to-green-500'
                                    }`}>
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        {modalType === 'apple' ? 'Apple Wallet' : 'Google Wallet'}
                                    </h3>
                                    <p className="text-xs text-stone-400">Agregar tarjeta</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Preview de la tarjeta */}
                        <div className="p-4">
                            <div className={`rounded-xl p-4 ${tier === 'Gold' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                                tier === 'Plata' ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                                    'bg-gradient-to-br from-stone-700 to-stone-800'
                                }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider opacity-70">Tus3B Style</p>
                                        <p className="font-bold text-lg">{clientName.split(' ')[0]}</p>
                                    </div>
                                    <span className="text-2xl">{tierEmoji[tier]}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase opacity-70">Visitas</p>
                                        <p className="text-2xl font-bold">{visits}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase opacity-70">Nivel</p>
                                        <p className="font-bold">{tier}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instrucciones */}
                        <div className="p-4 pt-0 space-y-3">
                            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800">
                                <h4 className={`font-bold text-sm mb-3 flex items-center gap-2 ${modalType === 'apple' ? 'text-amber-400' : 'text-blue-400'
                                    }`}>
                                    <Smartphone size={16} />
                                    {modalType === 'apple'
                                        ? 'Pasos para agregar a Apple Wallet'
                                        : 'Pasos para agregar a Google Wallet'
                                    }
                                </h4>
                                <ol className="space-y-2 text-sm text-stone-300">
                                    <li className="flex gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modalType === 'apple' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                                            }`}>1</span>
                                        <span>Haz clic en "Crear Pass" abajo</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modalType === 'apple' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                                            }`}>2</span>
                                        <span>
                                            {modalType === 'apple'
                                                ? 'Selecciona "Store Card" como tipo'
                                                : 'Selecciona "Loyalty Card"'
                                            }
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modalType === 'apple' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                                            }`}>3</span>
                                        <span>Copia los datos mostrados abajo</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modalType === 'apple' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                                            }`}>4</span>
                                        <span>En "Barcode", pega tu código QR</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modalType === 'apple' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                                            }`}>5</span>
                                        <span>
                                            {modalType === 'apple'
                                                ? 'Descarga y abre en tu iPhone'
                                                : 'Guarda en tu Google Wallet'
                                            }
                                        </span>
                                    </li>
                                </ol>
                            </div>

                            {/* Datos para copiar */}
                            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800">
                                <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">Tus Datos</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Organización:</span>
                                        <span className="text-white font-mono">Tus3B Style</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Nombre:</span>
                                        <span className="text-white font-mono">{clientName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Nivel:</span>
                                        <span className="text-white font-mono">{tier}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Visitas:</span>
                                        <span className="text-white font-mono">{visits}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                                        <span className="text-stone-500">Código QR:</span>
                                        <button
                                            onClick={handleCopyToken}
                                            className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded text-xs font-mono text-amber-400 transition-colors"
                                        >
                                            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                            {token.substring(0, 12)}...
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 pt-0 space-y-2">
                            <button
                                onClick={handleOpenGenerator}
                                className={`w-full font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${modalType === 'apple'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
                                        : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-400 hover:to-green-400 text-white shadow-blue-500/20'
                                    }`}
                            >
                                <ExternalLink size={18} />
                                Crear Pass Gratis
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 px-4 rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddToWalletButtons;
