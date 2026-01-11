-- Create Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  product_id text PRIMARY KEY,
  quantity int DEFAULT 0,
  low_stock_threshold int DEFAULT 2,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Admin update inventory" ON inventory FOR ALL USING (true); -- Simplified for prototype

-- Function to decrement stock
CREATE OR REPLACE FUNCTION sell_product(p_id text, qty int)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock int;
  new_stock int;
BEGIN
  -- Get current stock
  SELECT quantity INTO current_stock FROM inventory WHERE product_id = p_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Producto no encontrado en inventario');
  END IF;

  IF current_stock < qty THEN
    RETURN json_build_object('success', false, 'message', 'Stock insuficiente');
  END IF;

  new_stock := current_stock - qty;

  UPDATE inventory SET quantity = new_stock, updated_at = now() WHERE product_id = p_id;

  RETURN json_build_object('success', true, 'new_stock', new_stock, 'message', 'Venta registrada. Stock actualizado.');
END;
$$;

-- Initial Seed Data based on previous boolean stock
INSERT INTO inventory (product_id, quantity) VALUES
-- In Stock (Set to 5 initially)
('a1', 5), ('a2', 5), ('a3', 5), ('a4', 5), ('a5', 5), ('a6', 5), ('a7', 5), 
('d1', 5), ('d2', 5),
-- Out of Stock (Set to 0)
('l1', 0), ('l2', 0), ('l3', 0), ('l4', 0), ('l5', 0), ('l6', 0),
('a8', 0), ('a9', 0), ('a10', 0), ('a11', 0), ('a12', 0)
ON CONFLICT (product_id) DO NOTHING;

