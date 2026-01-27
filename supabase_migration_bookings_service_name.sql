-- Migration: Add service_name column to bookings table
-- This column is required for the AgendaModule blocking functionality
-- Run this script in the Supabase SQL Editor

-- Add the service_name column if it doesn't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_name text;

-- Set default value for existing rows that don't have service_name
UPDATE public.bookings 
SET service_name = 'Servicio' 
WHERE service_name IS NULL AND name != 'BLOQUEADO';

UPDATE public.bookings 
SET service_name = 'Bloqueo' 
WHERE service_name IS NULL AND name = 'BLOQUEADO';
