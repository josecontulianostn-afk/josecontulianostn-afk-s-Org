-- 1. Create Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  cost_visits int NOT NULL,
  type text NOT NULL, -- 'perfume', 'discount', 'service'
  allowed_perfume_segment text, -- 'arab', 'classic', or NULL (any)
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Insert Sample Data (Restricted to Arab)
INSERT INTO rewards (name, cost_visits, type, allowed_perfume_segment, description)
VALUES 
('Decant 5ml Gratis', 5, 'perfume', 'arab', 'Canjeable solo por perfumería árabe'),
('10% Descuento Servicio', 5, 'discount', NULL, 'Descuento en tu próximo servicio'),
('Decant 10ml (Premium)', 10, 'perfume', 'arab', 'Canjeable solo por perfumería árabe');

-- 3. Create Redemption Log Table (if not exists from previous steps, explicitly for redemptions)
-- We'll reuse loyalty_events but ensuring it handles redemptions well.

-- 4. RPC for Redeeming (Basic Logic)
CREATE OR REPLACE FUNCTION redeem_reward(token_input uuid, reward_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  client_record record;
  reward_record record;
  new_visits int;
BEGIN
  -- Verify Client
  SELECT * INTO client_record FROM clients WHERE member_token = token_input;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cliente no encontrado');
  END IF;

  -- Verify Reward
  SELECT * INTO reward_record FROM rewards WHERE id = reward_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Premio no encontrado');
  END IF;

  -- Check Balance
  IF client_record.visits < reward_record.cost_visits THEN
     RETURN json_build_object('success', false, 'message', 'Puntos insuficientes');
  END IF;

  -- Deduct Points (Logic: Reset visits or just log usage? Usually for "5th visit discount" we reset the counter or mark a cycle)
  -- For this specific business logic: "5th visit is free/discount".
  -- Let's assume we deduct 5 "spendable" visits or just reset the counter if it's mod 5.
  -- Simpler for now: specific implementation depends on business logic, but let's assume we consume the Visits count for the cost.
  
  UPDATE clients 
  SET visits = client_record.visits - reward_record.cost_visits
  WHERE id = client_record.id;

  -- Log Event
  INSERT INTO loyalty_events (client_id, type, description, metadata)
  VALUES (
    client_record.id, 
    'redeem', 
    'Canje de: ' || reward_record.name,
    json_build_object('reward_id', reward_id, 'segment_restriction', reward_record.allowed_perfume_segment)
  );

  RETURN json_build_object(
    'success', true, 
    'message', 'Canje exitoso. Disfruta tu premio.'
  );
END;
$$;
