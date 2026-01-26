import { PERFUMES, SERVICES } from '../constants';

// --- KNOWLEDGE BASE ---
interface PerfumeInfo {
    name: string;
    brand: string;
    inspiration: string;
    profile: string;
    performance: string;
    target: string;
    keywords: string[];
    details?: string; // New field for deeper analysis
}

const KNOWLEDGE_BASE: PerfumeInfo[] = [
    // --- Lattafa ---
    {
        name: "Lattafa Teriaq",
        brand: "Lattafa",
        inspiration: "Creación original de Quentin Bisch (estilo La Belle JPG)",
        profile: "Gourmand, dulce y acuerado (caramelo, almendra, chabacano, miel, cuero, vainilla).",
        performance: "¡Beast Mode! +8-10 horas. Proyección notable.",
        target: "Mujer audaz, sexy, misteriosa. Climas fríos/noche.",
        keywords: ["teriaq", "quentin bisch", "la belle", "jpg", "cuero", "miel", "beast mode", "dulce", "sexy"],
        details: "Obra maestra de Quentin Bisch. Un perfume polarizante que mezcla dulzura gourmand con cuero. Una declaración de intenciones para 'arrasar'."
    },
    {
        name: "Lattafa Pride Wujood",
        brand: "Lattafa Pride",
        inspiration: "Kenzo Homme Eau de Toilette Intense (con giro propio)",
        profile: "Marino, especiado y amaderado. Sin la nota de higo de Kenzo, destaca el sándalo.",
        performance: "Muy buen rendimiento.",
        target: "Hombre que busca alternativa a Kenzo pero distintiva. Uso diario.",
        keywords: ["wujood", "wajood", "kenzo", "marino", "intense", "sandalo", "especiado"],
        details: "Una inspiración con identidad propia. Evoca a Kenzo pero sin la nota frutal de higo, ofreciendo una firma amaderada y especiada única."
    },
    {
        name: "Lattafa Pride Masa",
        brand: "Lattafa Pride",
        inspiration: "Ganymede de Marc-Antoine Barrois",
        profile: "Mineral, 'acerado', con giro tropical de MANGO en la salida.",
        performance: "Muy buen rendimiento.",
        target: "Sofisticado, audaz, moderno. Nicho usable.",
        keywords: ["masa", "ganymede", "mineral", "mango", "nicho", "ropical"],
        details: "Exclusividad nicho con un giro tropical. Mantiene los toques minerales de Ganymede pero añade mango jugoso para hacerlo más vibrante y usable."
    },
    {
        name: "Lattafa Khamrah Qahwa",
        brand: "Lattafa",
        inspiration: "Angel's Share de Kilian (con giro de café)",
        profile: "Gourmand, dulce, cremoso (CAFÉ, canela, cardamomo, praliné, frutas confitadas).",
        performance: "Muy bueno, empalagoso y potente.",
        target: "Amantes de lo gourmand extremo, invierno, citas.",
        keywords: ["khamrah", "qahwa", "angel", "kilian", "cafe", "coffee", "dulce", "canela", "gourmand"],
        details: "Una 'Inspiración' con personalidad marcada. Añade una nota prominente de café ('Qahwa') y frutas confitadas, diferenciándose de Angel's Share."
    },
    {
        name: "Lattafa Pride La Collection D'antiquites 1886",
        brand: "Lattafa Pride",
        inspiration: "Dior Homme Intense",
        profile: "Atalcado, especiado, cremoso (iris, chocolate blanco, tabaco, yerba mate).",
        performance: "Rinde muy bien.",
        target: "Semiformal a formal, elegante, refinado.",
        keywords: ["1886", "antiquites", "dior homme", "iris", "atalcado", "chocolate", "elegante", "formal"],
        details: "Personalidad propia muy marcada. Comparte el iris de Dior pero lo eleva con chocolate blanco y tabaco, ofreciendo un refinamiento único."
    },

    // --- Maison Alhambra ---
    {
        name: "Maison Alhambra Immortal",
        brand: "Maison Alhambra",
        inspiration: "L'Immensité de Louis Vuitton",
        profile: "Cítrico, aromático y acuático (pomelo, jengibre, ambroxan).",
        performance: "Buen rendimiento para ser fresca.",
        target: "Hombre que busca lujo fresco para verano y diario.",
        keywords: ["immortal", "jean lowe", "immensite", "louis vuitton", "lv", "citrico", "fresco", "verano", "acuatico"],
        details: "Un 'Clonazo' de L'Immensité. Frescura cítrica y lujo a un precio accesible. Ideal para el verano."
    },
    {
        name: "Maison Alhambra Jean Lowe Noir",
        brand: "Maison Alhambra",
        inspiration: "Ombre Nomade de Louis Vuitton",
        profile: "Oscuro, ahumado, terroso, resinoso (incienso, oud, abedul).",
        performance: "Muy bueno, potente y opulento.",
        target: "Amante de fragancias oscuras y potentes. Invierno/Noche.",
        keywords: ["jean lowe noir", "ombre nomade", "louis vuitton", "lv", "oscuro", "oud", "incienso", "fuerte"],
        details: "Captura la esencia oscura y opulenta de Ombre Nomade (que cuesta 10 veces más). Perfume con mucho carácter."
    },

    // --- Armaf ---
    {
        name: "Armaf Odyssey Mega",
        brand: "Armaf",
        inspiration: "Y Eau de Parfum de Yves Saint Laurent",
        profile: "Cítrico, afrutado (naranja, menta, jengibre, piña), fondo amaderado.",
        performance: "6-7 horas, súper versátil ('perfume azul').",
        target: "Juvenil, versátil, diario.",
        keywords: ["odyssey mega", "y edp", "ysl", "yves saint laurent", "azul", "versatil", "citrico", "afrutado"],
        details: "El 'Caballo de batalla' diario. Un clonazo de Y EDP con rendimiento sólido, a veces superior a las formulaciones actuales del original."
    },
    {
        name: "Armaf Odyssey Mandarin Sky",
        brand: "Armaf",
        inspiration: "Scandal Eau de Toilette de Jean Paul Gaultier",
        profile: "Cremosa, dulce, caramelizada (mandarina, azafrán, caramelo, haba tonka).",
        performance: "Buen rendimiento, dulce y nocturna.",
        target: "Juvenil, salidas, fiesta. Éxito de ventas.",
        keywords: ["odyssey mandarin", "mandarin sky", "scandal", "jpg", "jean paul gaultier", "dulce", "caramelo", "noche"],
        details: "Un 'clonazo descarado' de Scandal. Súper ventas reciente, combo adictivo de mandarina y caramelo."
    },
    {
        name: "Armaf Odyssey Dubai Chocolat",
        brand: "Armaf",
        inspiration: "Aroma Gourmand Original (Galleta de Chocolate)",
        profile: "Gourmand (galleta chocolate, praliné, vainilla, pistacho).",
        performance: "Normal (6-7h), proyección moderada.",
        target: "Citas, encuentros cercanos, amantes del chocolate.",
        keywords: ["dubai chocolat", "chocolate", "galleta", "gourmand", "pistacho", "cita"],
        details: "Arma secreta para citas. Aroma realista a galleta de chocolate para una impresión memorable."
    },
    {
        name: "Armaf Midnight Dubai Nights",
        brand: "Armaf",
        inspiration: "MYSLF de Yves Saint Laurent",
        profile: "Limpio, cítrico, fresco y floral masculino.",
        performance: "Potencia muy importante, gran proyección inicial.",
        target: "Día a día, oficina, versátil elegante.",
        keywords: ["midnight", "dubai nights", "myslf", "ysl", "floral", "limpio", "oficina"],
        details: "Mejora estratégica de MYSLF con mayor potencia y proyección en las primeras horas."
    },
    {
        name: "Armaf Club De Nuit Iconic",
        brand: "Armaf",
        inspiration: "Bleu de Chanel Eau de Parfum",
        profile: "Azul eléctrico, cítrico, incienso, sándalo.",
        performance: "Sólido y confiable.",
        target: "Elegante, versátil, formal e informal. Clásico moderno.",
        keywords: ["iconic", "bleu de chanel", "chanel", "azul", "elegante", "incienso"],
        details: "Elegancia atemporal reinventada. Más vibrante y eléctrico que el clásico Bleu."
    },
    {
        name: "Armaf Aura Fresh",
        brand: "Armaf",
        inspiration: "Versace Man Eau Fraiche + Montblanc Starwalker",
        profile: "Fresco, alimonado, amaderado, ozónico.",
        performance: "Mejor que Starwalker, ideal para calor.",
        target: "Verano, calor, día a día, ultra versátil.",
        keywords: ["aura fresh", "versace", "eau fraiche", "starwalker", "fresco", "verano", "limon"],
        details: "El 'dos en uno' del frescor. Fusión de Starwalker y Versace Eau Fraiche."
    },
    {
        name: "Armaf Checkmate King",
        brand: "Armaf",
        inspiration: "Scandal Absolu de Jean Paul Gaultier",
        profile: "Dulce oscuro, concentrado (ADN Mandarin Sky pero más maduro).",
        performance: "Excelente duración y proyección.",
        target: "Noche sofisticada, alegre pero maduro.",
        keywords: ["checkmate king", "scandal absolu", "jpg", "oscuro", "maduro", "noche"],
        details: "Evolución natural de Mandarin Sky. Más oscuro y sofisticado."
    },
    {
        name: "Armaf Beach Party",
        brand: "Armaf",
        inspiration: "Summerhammer (Nicho)",
        profile: "Fresco, frutal tropical (guayaba, cítricos). Unisex.",
        performance: "Buena duración y muy buena proyección.",
        target: "Verano, vacaciones, playa, relax. Unisex.",
        keywords: ["beach party", "summerhammer", "tropical", "frutal", "guayaba", "unisex", "playa"],
        details: "Cóctel de frutas tropicales vibrante. Escapada instantánea a la playa."
    },
    {
        name: "Armaf Club de Nuit Precioso",
        brand: "Armaf",
        inspiration: "Creed Aventus Absolu",
        profile: "Frutal maduro, especiado (piña, maderas, musgo).",
        performance: "Potente, +8 horas.",
        target: "Hombre maduro, conocedor, calidad y potencia.",
        keywords: ["precioso", "aventus absolu", "creed", "piña", "especiado", "maduro"],
        details: "Alternativa inteligente a Aventus Absolu. Más maduro y especiado."
    },
    {
        name: "Armaf Club de Nuit Intense Man",
        brand: "Armaf",
        inspiration: "Creed Aventus (El Rey de los Clones)",
        profile: "Cítrico, ahumado, frutal (piña/limón), amaderado.",
        performance: "Beast Mode (sobre todo Parfum/Extrait).",
        target: "Todo uso. La leyenda.",
        keywords: ["club de nuit intense", "cdnim", "aventus", "creed", "limon", "ahumado", "beast"],
        details: "La leyenda de Armaf. EDT proyecta mucho (salida fuerte), Parfum es más equilibrado."
    },
    {
        name: "Armaf Club de Nuit Urban Man Elixir",
        brand: "Armaf",
        inspiration: "Dior Sauvage + Hacivat (Toque frutal)",
        profile: "Fresco, especiado (ambroxan) y frutal.",
        performance: "Excelente (8-10 horas), generador de cumplidos.",
        target: "Versátil, fiesta, diario. El que más gusta.",
        keywords: ["urban man elixir", "sauvage", "dior", "hacivat", "frutal", "ambroxan", "elixir"],
        details: "El 'dos por uno' de los cumplidos: Sauvage con toque nicho frutal."
    },
    {
        name: "Armaf Infinity",
        brand: "Armaf",
        inspiration: "L'Homme Ultime de YSL (Descontinuado)",
        profile: "Fresco, especiado, floral (rosa, jengibre).",
        performance: "Superior al original.",
        target: "Oficina, formal, hombre elegante que busca rosa masculina.",
        keywords: ["infinity", "l'homme ultime", "ysl", "rosa", "jengibre", "oficina", "elegante"],
        details: "Joya para quienes extrañan L'Homme Ultime. Elegancia floral masculina."
    },
    {
        name: "Armaf Odyssey Vamas",
        brand: "Armaf",
        inspiration: "L'Eau d'Issey Pour Homme (con giro frutal)",
        profile: "Frutal, salado, marino, ahumado (melón, incienso).",
        performance: "Buena duración (hasta 7h).",
        target: "Juvenil, casual, verano, playa.",
        keywords: ["vamas", "issey miyake", "l'eau d'issey", "marino", "melon", "salado"],
        details: "Giro tropical de un clásico marino. Melón + notas saladas."
    },
    {
        name: "Armaf Odyssey Go Mango",
        brand: "Armaf",
        inspiration: "Original centrada en Mango",
        profile: "Cítrico, frutal dulce (MANGO jugoso).",
        performance: "Por confirmar (se espera bueno).",
        target: "Amantes del mango y frutas. Verano, casual.",
        keywords: ["go mango", "mango", "frutal", "verano", "jugoso"],
        details: "Mango realista y jugoso. Pura felicidad de verano."
    },

    // --- Others ---
    {
        name: "9pm",
        brand: "Afnan",
        inspiration: "Ultramale de Jean Paul Gaultier",
        profile: "Dulce, fiestero (manzana, vainilla, canela).",
        performance: "Modo Bestia. Proyección nuclear.",
        target: "Juvenil, fiesta, noche.",
        keywords: ["9pm", "ultramale", "jpg", "fiesta", "noche", "dulce", "vainilla"],
        details: "Éxito de ventas para la fiesta. Proyección 'Modo Bestia'."
    },
    {
        name: "Fattan",
        brand: "Rasasi",
        inspiration: "Terre d'Hermès EDT",
        profile: "Cítrico, terroso, vetiver, MUSGO (más verde y húmedo).",
        performance: "Muy buen rendimiento y versatilidad.",
        target: "Maduro, elegante, terroso.",
        keywords: ["fattan", "terre", "hermes", "vetiver", "musgo", "verde", "tierra"],
        details: "Inspiración con identidad propia: añade una base potente de musgo que lo hace más verde que Terre d'Hermès."
    }
];

const GENERAL_RESPONSES = {
    greeting: "¡Hola! Bienvenid@ a Tus3B Style. Soy tu experto en perfumería árabe. Pregúntame por una fragancia, una nota (ej: 'mango', 'café') o una inspiración (ej: 'tipo Sauvage').",

    default: "No estoy seguro de entender tu consulta. Puedo recomendarte perfumes (ej: 'algo fresco', 'algo dulce'), explicarte conceptos como **Clon vs Inspiración**, **Maceración**, o sugerirte combinaciones.",

    shipping: "Atendemos en nuestro **Studio** (Santiago Centro/Ñuñoa). También vamos a domicilio por +$3.000.",

    prices: "Perfumes disponibles en Decants (5ml/10ml) y Botella. Servicios de peluquería desde $7.000.",

    arab_info: "**Perfumería Árabe:** Lujo democratizado.\n\n🔸 **Ingrediente Clave**: OUD (resina amaderada/ahumada de lujo).\n🔸 **Rendimiento**: Alta concentración, buscan durar todo el día.\n🔸 **Ciencia**: Uso experto de química para garantizar consistencia y precios accesibles.",

    concepts: "🤔 **¿Clon o Inspiración?**\n\n🤖 **Clonazo**: Réplica directa (Ej: *Jean Lowe Immortal* = *L'Immensité*).\n🎨 **Inspiración**: Toma un ADN conocido pero añade un giro propio (Ej: *Teriaq* de Quentin Bisch o *Fattan* con más musgo).\n\n🧪 **Maceración**: Proceso de reposo donde el alcohol se estabiliza y la fragancia gana cuerpo."
};


// --- HELPERS ---

const findPerfumeMatch = (query: string): PerfumeInfo | null => {
    const q = query.toLowerCase();
    return KNOWLEDGE_BASE.find(p =>
        p.name.toLowerCase().includes(q) ||
        p.keywords.some(k => q.includes(k))
    ) || null;
};

const getAllRecommendations = (query: string): PerfumeInfo[] => {
    const q = query.toLowerCase();

    return KNOWLEDGE_BASE.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.keywords.some(k => q.includes(k)) ||
        p.profile.toLowerCase().includes(q) ||
        p.inspiration.toLowerCase().includes(q)
    );
};


// --- EXPORTS ---

export const sendMessageToStaticBot = async (message: string, history: string[]): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Delay

    const lowerMsg = message.toLowerCase();

    // 1. Technical Concepts
    if (lowerMsg.includes('maceracion') || lowerMsg.includes('oxigenacion')) {
        return "🧪 **Maceración vs Oxigenación**:\n\n✅ **Maceración**: Es bueno. El perfume reposa, gana cuerpo y calidad.\n\n❌ **Oxigenación**: Es malo. El aire degrada el aroma con el tiempo (el enemigo del perfume).";
    }
    if (lowerMsg.includes('clon') || lowerMsg.includes('inspiracion') || lowerMsg.includes('diferencia')) {
        return GENERAL_RESPONSES.concepts;
    }
    if (lowerMsg.includes('oud') || lowerMsg.includes('arabe')) {
        return GENERAL_RESPONSES.arab_info;
    }
    if (lowerMsg.includes('layering') || lowerMsg.includes('mezclar')) {
        return "✨ **Layering (Capas)**: Mezcla fragancias para crear algo único.\n\n🔥 **Combo Sugerido**: *Armaf Kayaan Toffee* + *Paris Corner Khair Pistachio* = Moderno, Chic y Gourmand.";
    }

    // 2. Greetings & General
    if (lowerMsg.match(/\b(hola|buenos|buenas|hi)\b/)) return GENERAL_RESPONSES.greeting;
    if (lowerMsg.includes('precio') || lowerMsg.includes('valor')) return GENERAL_RESPONSES.prices;
    if (lowerMsg.includes('domicilio') || lowerMsg.includes('ubicacion')) return GENERAL_RESPONSES.shipping;

    // 3. Perfume Search
    const matches = getAllRecommendations(lowerMsg);

    if (matches.length > 0) {
        if (matches.length === 1) {
            const p = matches[0];
            return `Te recomiendo **${p.name}** de ${p.brand}.\n\n💡 **Inspiración**: ${p.inspiration}.\n👃 **Perfil**: ${p.profile}\n📝 **Detalle**: ${p.details || ''}\n⏱️ **Rendimiento**: ${p.performance}\n🎯 **Para**: ${p.target}`;
        } else {
            const topMatches = matches.slice(0, 5);
            const list = topMatches.map(p => `• **${p.name}**: ${p.profile.split('(')[0]}`).join('\n');
            return `Encontré estas opciones para "${message}":\n\n${list}\n\n¿Quieres detalles de alguno?`;
        }
    }

    return GENERAL_RESPONSES.default;
};

export const classifyExpenseStatic = (description: string): string => {
    const desc = description.toLowerCase();

    if (desc.match(/(tijera|maquina|secador|peine|cepillo|navaja|capa|guia|patillera)/)) return 'Herramientas';
    if (desc.match(/(silla|sillon|espejo|mueble|lavacabeza|estante|mesa|camilla|vitrina|aro de luz|lampara)/)) return 'Mobiliario';
    if (desc.match(/(shampoo|acondicionador|tinte|color|oxidanta|crema|keratina|botox|mascara|aceite|alcohol|algodon|guantes|papel aluminio|decolorante)/)) return 'Materiales';
    if (desc.match(/(cafe|te|azucar|agua|galletas|jugo|limpieza|confort|papel|toalla|aromatizante|basura)/)) return 'Insumos Recepción';

    return 'Otros';
};
