import { GoogleGenAI } from "@google/genai";
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
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Error initializing Gemini:", e);
  }
} else {
  console.warn("VITE_GEMINI_API_KEY no encontrada. El chat funcionará en modo DEMO.");
}

export const sendMessageToGemini = async (message: string, history: string[]): Promise<string> => {
  // MODO DEMO / FALLBACK si no hay API Key
  if (!ai) {
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

    Tono y Estilo:
    - Eres cercana, experta y entusiasta (usa emojis con moderación ✨).
    - Si te preguntan "dónde atienden": "Nuestra atención principal es en nuestro exclusivo **Studio** (Sector Santiago Centro/Ñuñoa). Es un espacio acondicionado especial para ti."
    - Si insisten por domicilio: "Sí, también vamos a domicilio en Santiago y Ñuñoa por un recargo de $3.000 adicional."
    - Si te preguntan "qué me recomiendas", no des una lista larga. Céntrate en tus 2 mejores cartas.
    - Responde siempre en español de Chile.
  `;

  try {
    const model = 'gemini-1.5-flash'; // Updated to a more standard model name if 2.5 isn't available public yet or stick to safe defaults
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemInstruction + "\n\n Historial de chat:\n" + history.join('\n') + "\n\nUsuario: " + message }] }
      ]
    });

    return response.text || "Lo siento, no pude procesar tu solicitud.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un error al conectar con el asistente. Por favor intenta más tarde.";
  }
};

export const classifyExpense = async (description: string): Promise<string> => {
  if (!ai) return "Otros"; // Fallback if no API key

  const validCategories = ['Materiales', 'Herramientas', 'Mobiliario', 'Insumos Recepción', 'Otros'];
  const prompt = `
    Clasifica la siguiente compra/gasto en EXACTAMENTE una de estas categorías: ${validCategories.join(', ')}.
    
    Descripción del gasto: "${description}"
    
    Responde SOLAMENTE con el nombre de la categoría, sin texto adicional. Si no estás seguro o no encaja, responde "Otros".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text?.trim();
    if (text && validCategories.includes(text)) {
      return text;
    }
    return "Otros";
  } catch (error) {
    console.error("Error classifying expense:", error);
    return "Otros";
  }
};