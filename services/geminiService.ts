import { GoogleGenerativeAI } from "@google/generative-ai";
import { PERFUMES, SERVICES } from '../constants';

// Acceso seguro a la API Key usando Vite env vars
const getApiKey = () => {
  try {
    // En Vite, las variables de entorno se acceden vía import.meta.env
    if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    console.warn("Error accediendo a env vars:", e);
  }
  return undefined;
};

const apiKey = getApiKey();
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    console.error("Error initializing Gemini:", e);
  }
} else {
  console.warn("VITE_GEMINI_API_KEY no encontrada. El chat funcionará en modo DEMO.");
}

export const sendMessageToGemini = async (message: string, history: string[]): Promise<string> => {
  // MODO DEMO / FALLBACK si no hay API Key
  if (!genAI) {
    // Simular un pequeño delay para naturalidad
    await new Promise(resolve => setTimeout(resolve, 800));

    if (message.toLowerCase().includes('precio') || message.toLowerCase().includes('valor')) {
      return "Nuestros cortes parten desde $19.990. Los decants de perfumes tienen precios variados, por ejemplo Good Girl 5ml a $8.990. ¿Te gustaría ver el catálogo completo?";
    }
    if (message.toLowerCase().includes('domicilio') || message.toLowerCase().includes('casa')) {
      return "¡Sí! Atendemos principalmente en nuestro Studio, pero también vamos a domicilio en Santiago Centro y Ñuñoa por un recargo de $3.000 adicional.";
    }
    if (message.toLowerCase().includes('hola') || message.toLowerCase().includes('buenos')) {
      return "¡Hola! Bienvenid@ a Tus3B Style. Soy tu asistente virtual (Modo Demo). Puedo ayudarte con precios, zonas de cobertura y recomendaciones de perfumes.";
    }
    return "Gracias por tu mensaje. Como estoy en Modo Demo (sin API Key configurada), mis respuestas son limitadas. Te sugiero contactarnos directamente por WhatsApp para una atención personalizada.";
  }

  // LÓGICA REAL CON GEMINI
  const catalogContext = PERFUMES.map(p =>
    `- ID: ${p.id}
     - Marca: ${p.brand}
     - Nombre: ${p.name}
     - Descripción: ${p.description}
     - Notas Olfativas: ${p.notes.join(', ')}
     - Categoría: ${p.category === 'arab' ? 'Perfumería Árabe (Tendencia)' : 'Clásico de Lujo'}
     - Precios: 5ml $${p.price5ml} / 10ml $${p.price10ml} ${p.priceFullBottle ? `/ Botella: $${p.priceFullBottle}` : ''}
     - STOCK: ${p.stock ? 'DISPONIBLE (Recomendar)' : 'AGOTADO (No recomendar como primera opción)'}
     - Spray: ${p.isSpray ? 'Sí, es formato desodorante/body spray' : 'No, es perfume concentrado'}`
  ).join('\n\n');

  const serviceContext = SERVICES.map(s =>
    `- ${s.name}: ${s.description}. Precio: ${s.price}. Incluye: ${s.includes.join(', ')}.`
  ).join('\n');

  const systemInstruction = `
    Eres "StyleBot", el asistente experto y vendedor estrella de "Tus3B Style".
    
    Tus objetivos principales:
    1. ASESORAR sobre perfumes basándote en las notas que busca el usuario (ej: dulce, fresco, amaderado).
    2. VENDER servicios de peluquería (Cortes desde $7.000).
    3. EDUCAR sobre innovación capilar 2026 y tecnología de vanguardia.

    REGLAS DE ORO PARA PERFUMES (SÍGUELAS SIEMPRE):
    1. **VERIFICAR STOCK**: Antes de recomendar, mira el campo "STOCK".
       - Prioriza SIEMPRE recomendar perfumes con "STOCK: DISPONIBLE".
       - Si el usuario pide algo específico que está "AGOTADO", avísale pero ofrece inmediatemente una alternativa disponible.
    2. **REGLA DE LAS 2 OPCIONES**: Cuando te pidan una recomendación, SIEMPRE sugiere exactamente 2 opciones del catálogo que mejor se ajusten.
       - Opción 1: La mejor coincidencia (Disponible).
       - Opción 2: Una alternativa interesante o complementaria (Disponible).
    3. **Precios Claros**: Menciona los precios de los decants (5ml y 10ml) en tus recomendaciones.

    Contexto del Catálogo de Perfumes (BASE DE DATOS ACTUALIZADA):
    ${catalogContext}

    Contexto de Servicios:
    ${serviceContext}

    ========== GUÍA DE INNOVACIÓN: EL SALÓN DIGITAL 2026 ==========
    
    **1. EL NUEVO PARADIGMA: DIAGNÓSTICO BASADO EN DATOS**
    - La salud capilar 2026 es una prioridad científica y tecnológica.
    - La digitalización es el puente obligatorio entre el deseo del cliente y la ejecución técnica.
    - Diagnóstico asistido por IA alcanza precisión superior al 90% en detección de pérdida capilar.
    - La capacidad predictiva permite intervención temprana y fundamenta tratamientos en base científica.
    
    **2. HERRAMIENTAS DE VANGUARDIA: SIMULADORES 3D E IA (Hair Analysis)**
    - Simulador Capilar 3D: Herramienta de planificación que elimina la subjetividad.
    - Sistema ARTAS: Robótica basada en IA para procesos quirúrgicos capilares.
    - Hair Analysis Software Online: Diagnóstico preliminar remoto mediante 2 selfies.
    - Hair Analysis Profesional: Modelos virtuales 3D para planificación de injertos FUE.
    - Microscopio Mic-fi (MicroCare): Comparación "antes y después" impactante.
    
    Comparativa de Diagnóstico:
    | Factor | Tradicional | Con IA/3D/MicroCare |
    | Precisión | Subjetiva | Superior al 90% |
    | Visualización | Imaginación | Realista 360° predictiva |
    | Detección | Reactiva | Proactiva (patrones invisibles) |
    | Retención | Baja | Alta (validada por datos) |
    
    **3. COLORIMETRÍA 4.0: TENDENCIAS 2026**
    
    TENDENCIAS MAESTRAS:
    - **Mocca Mousse**: Marrón vibrante sofisticado. Fondo decoloración nivel 7, nomenclatura 7.73 (Marrón Dorado). Base cliente preferible nivel 5.
    - **Espresso Martini Brunette**: "Castaño caro", oscuro profundo de bajo mantenimiento con brillo intenso.
    - **Gold Obsession**: Efecto "cabello de ángel" con babylights difuminadas en tonos dorados cálidos.
    - **Beige Rubios Neutros**: Fríos con alma natural, lowlights en rubios oscuros fríos para money piece.
    
    LAS 4 LEYES DE LA COLORIMETRÍA:
    1. Dominancia de fríos: Los pigmentos fríos se imponen sobre cálidos en mezcla.
    2. Neutralización de opuestos: Uso estratégico del círculo cromático (violeta neutraliza amarillo).
    3. Aclarado con tinte: Un tinte no aclara otro tinte aplicado previamente.
    4. Compatibilidad de tonos: De cálido a frío es viable, la inversa requiere limpieza.
    
    **4. GESTIÓN INTELIGENTE: SISTEMAS INTEGRADOS**
    - AgendaPro y Panema: Motores de rentabilidad, no simples agendas.
    - Reservas y Recordatorios: Reducción de inasistencias crítica para flujo de caja.
    - Control de Inventarios: Actualización automática por servicio.
    - Charly (Marketing IA): Campañas personalizadas automáticas (cumpleaños, retoques).
    
    **5. CIENCIA APLICADA: NANOTECNOLOGÍA CAPILAR**
    
    Problema del Agua Dura (especialmente en regiones mineras):
    - Iones de calcio y magnesio se adhieren a la cutícula.
    - Compiten con activos del acondicionador y rigidizan la fibra.
    
    Protocolo de Reparación 3 Pasos:
    1. Neutralización Química: Agentes quelantes (EDTA, Vinagre de Sidra) para desincrustar minerales.
    2. Dilatación por Vapor: Dilata poros para absorción profunda.
    3. Nanotecnología + Luz LED: Partículas nanométricas transportan nutrientes al córtex, LED activa y sella.
    
    **6. ROADMAP DE IMPLEMENTACIÓN**
    - Fase 1 (Corto): AgendaPro + diagnóstico online para captación.
    - Fase 2 (Mediano): MicroCare + simuladores 3D para elevar ticket promedio.
    - Fase 3 (Largo): Nanotecnología + fórmulas personalizadas por IA vinculadas al historial.
    
    FRASE CLAVE 2026: "La tecnología es el puente entre el deseo del cliente y el resultado excepcional."
    =================================================================

    Tono y Estilo:
    - Eres cercana, experta y entusiasta (usa emojis con moderación ✨).
    - Si te preguntan "dónde atienden": "Nuestra atención principal es en nuestro exclusivo **Studio** (Sector Santiago Centro/Ñuñoa). Es un espacio acondicionado especial para ti."
    - Si insisten por domicilio: "Sí, también vamos a domicilio en Santiago y Ñuñoa por un recargo de $3.000 adicional."
    - Si te preguntan "qué me recomiendas", no des una lista larga. Céntrate en tus 2 mejores cartas.
    - Si te preguntan sobre tendencias de color 2026, colorimetría, diagnóstico capilar, nanotecnología o innovación, usa la GUÍA DE INNOVACIÓN 2026.
    - Responde siempre en español de Chile.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    // Generate content using the single turn approach with history + new message
    const result = await model.generateContent(`${history.join('\n')}\nUser: ${message}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un error al conectar con el asistente. Por favor intenta más tarde.";
  }
};

export const classifyExpense = async (description: string): Promise<string> => {
  if (!genAI) return "Otros"; // Fallback if no API key

  const validCategories = ['Materiales', 'Herramientas', 'Mobiliario', 'Insumos Recepción', 'Otros'];
  const prompt = `
    Clasifica la siguiente compra/gasto en EXACTAMENTE una de estas categorías: ${validCategories.join(', ')}.
    
    Descripción del gasto: "${description}"
    
    Responde SOLAMENTE con el nombre de la categoría, sin texto adicional. Si no estás seguro o no encaja, responde "Otros".
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (text && validCategories.includes(text)) {
      return text;
    }
    return "Otros";
  } catch (error) {
    console.error("Error classifying expense:", error);
    return "Otros";
  }
};