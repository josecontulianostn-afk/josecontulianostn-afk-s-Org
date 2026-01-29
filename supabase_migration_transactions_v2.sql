-- Agregar columnas para trazabilidad de inventario en ventas
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS product_id text, -- ID del producto (texto porque algunos IDs son strings como 'perfume-1')
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;

-- Crear índice para búsquedas rápidas por producto
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON public.transactions(product_id);
