-- 1. Add secure token and tier to clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS member_token uuid DEFAULT gen_random_uuid() NOT NULL,
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Silver';

-- Add unique constraint to member_token
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_member_token_key') THEN 
        ALTER TABLE clients ADD CONSTRAINT clients_member_token_key UNIQUE (member_token); 
    END IF; 
END $$;

-- 2. Create Audit Log Table
CREATE TABLE IF NOT EXISTS loyalty_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id),
  type text NOT NULL, -- 'visit', 'redeem', 'manual'
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Secure RPC Function to Register Visit
CREATE OR REPLACE FUNCTION register_visit(token_input uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  client_record record;
  new_visits int;
  is_eligible boolean;
BEGIN
  -- Find client by Secure Token
  SELECT * INTO client_record FROM clients WHERE member_token = token_input;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Token inválido o cliente no encontrado');
  END IF;

  -- Calculate new stats
  new_visits := client_record.visits + 1;
  is_eligible := (new_visits % 5) = 0;

  -- Determine Tier
  UPDATE clients 
  SET visits = new_visits,
      tier = CASE 
        WHEN new_visits >= 10 THEN 'Diamante'
        WHEN new_visits >= 5 THEN 'Gold'
        ELSE 'Silver'
      END,
      last_visit = now()
  WHERE id = client_record.id;

  -- Log the event
  INSERT INTO loyalty_events (client_id, type, description)
  VALUES (client_record.id, 'visit', 'Visita registrada via QR');

  RETURN json_build_object(
    'success', true, 
    'message', 'Visita registrada correctamente', 
    'client', client_record.phone, -- Returning phone as identifier for now
    'new_visits', new_visits,
    'tier', CASE 
        WHEN new_visits >= 10 THEN 'Diamante'
        WHEN new_visits >= 5 THEN 'Gold'
        ELSE 'Silver'
      END,
    'reward_unlocked', is_eligible
  );
END;
$$;
