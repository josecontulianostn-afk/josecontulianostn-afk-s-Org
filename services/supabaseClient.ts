import { createClient } from '@supabase/supabase-js';

// Función helper para obtener variables de entorno en Vite
const getEnvVar = (key: string) => {
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_KEY');

let supabaseClient: any = null;

if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL !== 'https://placeholder.supabase.co') {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error("Error initializing Supabase:", e);
  }
} else {
  console.warn("VITE_SUPABASE_URL o VITE_SUPABASE_KEY no configuradas. El backend funcionará en modo MOCK (sin persistencia).");
}

export const supabase = supabaseClient;

export interface BookingDB {
  id?: number;
  created_at?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  is_home_service: boolean;
  address?: string;
  duration_minutes: number;
}