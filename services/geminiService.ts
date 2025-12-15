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
        return "¡Sí! Vamos a tu domicilio en Santiago Centro y Ñuñoa por un recargo de $3.000 adicional. Llevamos todo lo necesario para tu cambio de look.";
    }
    if (message.toLowerCase().includes('hola') || message.toLowerCase().includes('buenos')) {
       return "¡Hola! Bienvenid@ a Tus3B Style. Soy tu asistente virtual (Modo Demo). Puedo ayudarte con precios, zonas de cobertura y recomendaciones de perfumes.";
    }
    return "Gracias por tu mensaje. Como estoy en Modo Demo (sin API Key configurada), mis respuestas son limitadas. Te sugiero contactarnos directamente por WhatsApp para una atención personalizada.";
  }

  // LÓGICA REAL CON GEMINI
  const catalogContext = PERFUMES.map(p => 
    `- ${p.brand} ${p.name}: ${p.description}. Notas: ${p.notes.join(', ')}. Precio 5ml: ${p.price5ml}, 10ml: ${p.price10ml}.`
  ).join('\n');

  const serviceContext = SERVICES.map(s => 
    `- ${s.name}: ${s.description}. Precio: ${s.price}. Incluye: ${s.includes.join(', ')}.`
  ).join('\n');

  const systemInstruction = `
    Eres "StyleBot", un asistente experto en belleza y perfumería para la tienda "Tus3B Style" en Chile.
    
    Tus objetivos:
    1. Recomendar perfumes de nuestro catálogo basándote en los gustos del usuario (dulce, fresco, para noche, etc).
    2. Informar sobre nuestro servicio de corte y brushing ($19.990) y el recargo a domicilio ($3.000 para Santiago/Ñuñoa).
    
    Contexto del Catálogo de Perfumes:
    ${catalogContext}

    Contexto de Servicios de Peluquería:
    ${serviceContext}

    Reglas:
    - Sé amable, sofisticado pero cercano.
    - Responde en español de Chile.
    - Si te preguntan por un perfume que NO está en la lista, di amablemente que no lo tienes pero sugiere uno similar del catálogo.
    - Mantén las respuestas breves (máximo 3 oraciones).
    - Anima al usuario a reservar o comprar.
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