-- 1. Add Columns to Clients Table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS hair_service_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_5th_visit_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_5th_visit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_cut_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS free_cut_issued_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS free_cut_redeemed BOOLEAN DEFAULT false;

-- 2. Create Hair Service Log Table
CREATE TABLE IF NOT EXISTS hair_service_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  service_type TEXT NOT NULL, 
  service_price DECIMAL NOT NULL,
  discount_applied DECIMAL DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by_admin UUID -- Optional reference to auth.users if needed
);

-- 3. RPC: Add Hair Service (The Core Logic)
CREATE OR REPLACE FUNCTION add_hair_service(
    token_input uuid, 
    service_type text, 
    service_price decimal, 
    notes_input text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  client_record record;
  new_count int;
  new_discount_count int;
  discount_unlocked boolean := false;
  free_cut_unlocked boolean := false;
BEGIN
  -- 1. Verify Client
  SELECT * INTO client_record FROM clients WHERE member_token = token_input;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cliente no encontrado');
  END IF;

  -- 2. Log Service
  INSERT INTO hair_service_log (client_id, service_type, service_price, notes)
  VALUES (client_record.id, service_type, service_price, notes_input);

  -- 3. Calculate New Counts
  new_count := COALESCE(client_record.hair_service_count, 0) + 1;
  new_discount_count := COALESCE(client_record.discount_5th_visit_count, 0) + 1;

  -- 4. Check Rewards Logic
  
  -- Logic: Every 5th visit (5, 10, 15...) = 10% Discount Available
  IF new_count > 0 AND new_count % 5 = 0 THEN
    discount_unlocked := true;
  END IF;

  -- Logic: Every 10th service (10, 20, 30...) = Free Cut Available
  IF new_count > 0 AND new_count % 10 = 0 THEN
    free_cut_unlocked := true;
  END IF;

  -- 5. Update Client
  UPDATE clients 
  SET 
    hair_service_count = new_count,
    -- If unlocked, set available. If previously available, it stays available (OR logic)
    discount_5th_visit_available = CASE WHEN discount_unlocked THEN true ELSE discount_5th_visit_available END,
    discount_5th_visit_count = new_discount_count,
    
    free_cut_available = CASE WHEN free_cut_unlocked THEN true ELSE free_cut_available END,
    free_cut_issued_date = CASE WHEN free_cut_unlocked THEN now() ELSE free_cut_issued_date END,
    free_cut_redeemed = CASE WHEN free_cut_unlocked THEN false ELSE free_cut_redeemed END -- Reset redemption status on new unlock
  WHERE id = client_record.id;

  -- 6. Return Result
  RETURN json_build_object(
    'success', true,
    'new_total_services', new_count,
    'discount_5th_unlocked', discount_unlocked,
    'free_cut_unlocked', free_cut_unlocked,
    'message', 'Servicio registrado correctamente'
  );
END;
$$;

-- 4. RPC: Redeem 10% Discount (5th Visit)
CREATE OR REPLACE FUNCTION redeem_discount_5th(
    token_input uuid
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  client_record record;
BEGIN
  SELECT * INTO client_record FROM clients WHERE member_token = token_input;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cliente no encontrado');
  END IF;

  IF client_record.discount_5th_visit_available IS TRUE THEN
    UPDATE clients 
    SET discount_5th_visit_available = false
    WHERE id = client_record.id;
    
    RETURN json_build_object('success', true, 'message', 'Descuento canjeado correctamente');
  ELSE
    RETURN json_build_object('success', false, 'message', 'Descuento no disponible');
  END IF;
END;
$$;

-- 5. RPC: Redeem Free Cut (10th Service)
CREATE OR REPLACE FUNCTION redeem_free_cut(
    token_input uuid
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  client_record record;
BEGIN
  SELECT * INTO client_record FROM clients WHERE member_token = token_input;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cliente no encontrado');
  END IF;

  IF client_record.free_cut_available IS TRUE THEN
    UPDATE clients 
    SET 
        free_cut_available = false,
        free_cut_redeemed = true
    WHERE id = client_record.id;
    
    RETURN json_build_object('success', true, 'message', 'Corte gratis canjeado correctamente');
  ELSE
    RETURN json_build_object('success', false, 'message', 'Corte gratis no disponible');
  END IF;
END;
$$;
