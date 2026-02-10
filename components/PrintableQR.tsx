import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const PrintableQR: React.FC = () => {
    // The URL where customers should go to check in
    const CHECKIN_URL = 'https://tus3b.cl/#/checkin';

    return (
        // z-[100] and fixed inset-0 to cover the main app Header
        <div className="fixed inset-0 z-[100] bg-stone-50 flex flex-col items-center justify-center p-8 print:p-0 overflow-auto">

            <div className="bg-white border-[6px] border-black p-12 pr-16 rounded-[40px] max-w-5xl w-full flex flex-row items-center justify-between gap-12 shadow-2xl print:shadow-none print:border-[6px] print:w-[100%] print:h-[100%] print:rounded-none landscape:flex-row portrait:flex-col">

                {/* Left Side: Branding & Info */}
                <div className="flex-1 flex flex-col items-start text-left">
                    {/* Branding */}
                    <div className="mb-8">
                        <h1 className="font-serif text-6xl mb-2 font-bold tracking-tighter text-black">Tus3B Style</h1>
                        <p className="text-xl uppercase tracking-[0.5em] text-stone-500 font-bold">Studio & Beauty</p>
                    </div>

                    <p className="text-4xl font-serif mb-10 leading-tight">
                        Registra tu visita y suma puntos en tu <span className="text-amber-600 font-bold italic">Wallet</span>
                    </p>

                    <div className="bg-black text-white px-10 py-4 rounded-full text-2xl font-bold mb-10 shadow-lg inline-block">
                        ESCANEA AQUÍ
                    </div>

                    {/* Step Instructions */}
                    <div className="space-y-6">
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl shrink-0">1</div>
                            <p className="text-2xl text-stone-700 font-medium">Confirma tu llegada.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl shrink-0">2</div>
                            <p className="text-2xl text-stone-700 font-medium">Obtén tu tarjeta y beneficios.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: QR Code */}
                <div className="flex-shrink-0">
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl border-2 border-stone-100">
                        <QRCodeSVG
                            value={CHECKIN_URL}
                            size={400}
                            level={"H"}
                            includeMargin={true}
                        />
                        <p className="mt-4 text-center text-stone-400 font-mono text-base font-bold tracking-widest">tus3b.cl/checkin</p>
                    </div>
                </div>

            </div>

            {/* Print Button (Hidden when printing via CSS media query usually, but using tailwind 'print:hidden') */}
            <div className="mt-8 print:hidden fixed bottom-8">
                <button
                    onClick={() => window.print()}
                    className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-700 transition shadow-lg flex items-center gap-2"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Imprimir Cartel (Horizontal)
                </button>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintableQR;
