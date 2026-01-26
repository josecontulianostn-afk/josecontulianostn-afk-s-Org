-- Create Inventory Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  change_amount int NOT NULL,
  new_quantity int NOT NULL,
  reason text, -- 'manual_adjustment', 'sale', 'restock'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for logs
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Admin read logs" ON inventory_logs;
DROP POLICY IF EXISTS "Admin insert logs" ON inventory_logs;

CREATE POLICY "Admin read logs" ON inventory_logs FOR SELECT USING (true);
CREATE POLICY "Admin insert logs" ON inventory_logs FOR INSERT WITH CHECK (true);

-- Enhanced Function to modify stock and log it
CREATE OR REPLACE FUNCTION adjust_inventory(
  p_product_id text, 
  p_delta int, 
  p_reason text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock int;
  new_stock int;
BEGIN
  -- 1. Get current stock (and lock row)
  SELECT quantity INTO current_stock FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  
  -- Handle item not found
  IF NOT FOUND THEN
    -- Optional: Auto-create item if it doesn't exist? 
    -- For now, let's assume item must exist in 'inventory' table (even if 0)
    -- Or insert it with 0 first.
    INSERT INTO inventory (product_id, quantity) VALUES (p_product_id, 0) RETURNING quantity INTO current_stock;
  END IF;

  -- 2. Calculate new stock
  new_stock := current_stock + p_delta;
  
  -- Prevent negative stock if desired (optional)
  IF new_stock < 0 THEN
     RETURN json_build_object('success', false, 'message', 'Stock insuficiente para esta operación');
  END IF;

  -- 3. Update inventory
  UPDATE inventory 
  SET quantity = new_stock, updated_at = now() 
  WHERE product_id = p_product_id;

  -- 4. Log the transaction
  INSERT INTO inventory_logs (product_id, change_amount, new_quantity, reason)
  VALUES (p_product_id, p_delta, new_stock, p_reason);

  RETURN json_build_object('success', true, 'new_quantity', new_stock, 'message', 'Inventario actualizado corrextamente');
END;
$$;
