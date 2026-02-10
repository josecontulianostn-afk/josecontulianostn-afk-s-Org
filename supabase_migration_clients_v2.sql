-- Migration: Add Email and Birth Date to Clients
-- Fecha: 2026-02-10

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS birth_date date;

-- Opcional: Crear índice para búsquedas por email si es necesario en el futuro
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
