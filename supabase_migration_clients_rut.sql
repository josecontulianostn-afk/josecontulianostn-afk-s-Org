-- Migration: Add RUT to Clients
-- Fecha: 2026-02-10

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS rut text;

-- Opcional: Crear índice para búsquedas por rut
CREATE INDEX IF NOT EXISTS idx_clients_rut ON public.clients(rut);
