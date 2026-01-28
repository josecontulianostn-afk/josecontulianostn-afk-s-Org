import { Wallet } from 'lucide-react';

interface WalletPassData {
    clientName: string;
    token: string;
    visits: number;
    tier: 'Bronce' | 'Plata' | 'Gold';
    phone?: string;
}

/**
 * Detecta la plataforma del usuario
 */
export const detectPlatform = (): 'ios' | 'android' | 'other' => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        return 'ios';
    }

    // Android detection
    if (/android/i.test(userAgent)) {
        return 'android';
    }

    return 'other';
};

/**
 * Genera una URL para crear un Apple Wallet pass usando el servicio gratuito PassSlot
 * o alternativas client-side
 */
export const generateAppleWalletPassUrl = (data: WalletPassData): string => {
    // Colores según tier
    const tierColors: Record<string, { bg: string; label: string }> = {
        'Bronce': { bg: '1C1917', label: 'FFFFFF' },  // Stone dark
        'Plata': { bg: '94A3B8', label: '1E293B' },   // Slate
        'Gold': { bg: 'F59E0B', label: '1C1917' }    // Amber
    };

    const colors = tierColors[data.tier] || tierColors['Bronce'];

    // Usamos PassSlot gratuito alternativo o generamos datos para el pass
    // Formato compatible con múltiples generadores gratuitos
    const passData = {
        // Header
        organizationName: 'Tus3B Style',
        description: 'Tarjeta de Fidelidad',
        logoText: 'Tus3B Style',

        // Barcode (QR)
        barcodeMessage: data.token,
        barcodeFormat: 'PKBarcodeFormatQR',

        // Fields
        headerField: data.clientName.split(' ')[0],
        primaryField: `${data.visits} Visitas`,
        secondaryField: `Nivel ${data.tier}`,
        auxiliaryField: data.token.substring(0, 8).toUpperCase(),

        // Colors (hex without #)
        backgroundColor: colors.bg,
        foregroundColor: colors.label,
        labelColor: colors.label,
    };

    // Genera URL para WalletWallet (servicio 100% gratuito, sin cuenta)
    // https://walletwallet.alen.ro/ - funciona directo en el navegador
    const walletWalletUrl = new URL('https://walletwallet.alen.ro/');

    // Pre-populate fields via URL params (si el servicio lo soporta)
    // De lo contrario, abrimos la página y el usuario puede crear manualmente

    return walletWalletUrl.toString();
};

/**
 * Genera un archivo .pkpass compatible con Apple Wallet
 * Esta función crea los datos necesarios para el pass
 */
export const createPassData = (data: WalletPassData) => {
    const tierEmoji: Record<string, string> = {
        'Bronce': '🥉',
        'Plata': '🥈',
        'Gold': '🥇'
    };

    return {
        formatVersion: 1,
        passTypeIdentifier: 'pass.cl.tus3b.loyalty',
        serialNumber: data.token,
        teamIdentifier: 'TUS3BSTYLE',
        organizationName: 'Tus3B Style',
        description: 'Tarjeta de Fidelidad Tus3B Style',
        logoText: 'Tus3B Style',
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: data.tier === 'Gold' ? 'rgb(245, 158, 11)' :
            data.tier === 'Plata' ? 'rgb(148, 163, 184)' :
                'rgb(28, 25, 23)',
        storeCard: {
            headerFields: [
                {
                    key: 'tier',
                    label: 'NIVEL',
                    value: `${tierEmoji[data.tier]} ${data.tier}`
                }
            ],
            primaryFields: [
                {
                    key: 'name',
                    label: 'CLIENTE',
                    value: data.clientName
                }
            ],
            secondaryFields: [
                {
                    key: 'visits',
                    label: 'VISITAS',
                    value: data.visits.toString()
                },
                {
                    key: 'next',
                    label: 'PRÓXIMO NIVEL',
                    value: data.tier === 'Bronce' ? '5 visitas' :
                        data.tier === 'Plata' ? '10 visitas' : '¡Eres VIP!'
                }
            ],
            auxiliaryFields: [
                {
                    key: 'id',
                    label: 'ID MIEMBRO',
                    value: data.token.substring(0, 8).toUpperCase()
                }
            ],
            backFields: [
                {
                    key: 'website',
                    label: 'Sitio Web',
                    value: 'https://tus3b.cl'
                },
                {
                    key: 'benefits',
                    label: 'Beneficios',
                    value: data.tier === 'Gold' ? '30% OFF en servicios + Trato VIP' :
                        data.tier === 'Plata' ? '15% OFF en servicios' :
                            '5% OFF en productos'
                },
                {
                    key: 'howto',
                    label: 'Cómo usar',
                    value: 'Muestra este código QR en cada visita para acumular puntos.'
                }
            ]
        },
        barcode: {
            message: data.token,
            format: 'PKBarcodeFormatQR',
            messageEncoding: 'iso-8859-1'
        }
    };
};

/**
 * Abre la página para crear pass de Apple Wallet
 * Usando servicio gratuito sin necesidad de cuenta de desarrollador
 */
export const openAppleWalletGenerator = (data: WalletPassData): void => {
    // Opción 1: WalletWallet (más simple, usuario crea manualmente)
    // Opción 2: Generar instrucciones para el usuario

    // Por ahora usamos WalletWallet que es 100% gratuito
    // El usuario puede crear su pass con los datos que le mostramos

    const passInfo = createPassData(data);

    // Guardamos los datos en sessionStorage para que el usuario pueda copiarlos
    sessionStorage.setItem('tus3b_wallet_pass', JSON.stringify({
        ...passInfo,
        _instructions: `
Para agregar tu tarjeta a Apple Wallet:

1. Visita: https://walletwallet.alen.ro/
2. Selecciona "Store Card" como tipo
3. Completa los campos:
   - Organization: Tus3B Style
   - Header: Nivel ${data.tier}
   - Primary: ${data.clientName}
   - Secondary: ${data.visits} Visitas
   - Barcode: QR con valor "${data.token}"
4. Descarga el pass y ábrelo en tu iPhone
        `.trim()
    }));

    // Abrimos el generador gratuito
    window.open('https://walletwallet.alen.ro/', '_blank');
};

/**
 * Genera URL para Google Wallet (requiere configuración adicional)
 * Por ahora retorna null, se implementará después
 */
export const generateGoogleWalletUrl = (data: WalletPassData): string | null => {
    // TODO: Implementar cuando el usuario configure Google Cloud
    console.log('Google Wallet no configurado aún');
    return null;
};
