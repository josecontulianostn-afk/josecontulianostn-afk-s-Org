
-- 1. Enable Delete Policy for Authenticated Users (Admins)
create policy "Enable delete for authenticated users only"
on "public"."clients"
as permissive
for delete
to authenticated
using (true);

-- 2. RPC: Add Hair Service By Phone (For Manual Entry)
-- Matches logic of add_hair_service but looks up by phone instead of token
CREATE OR REPLACE FUNCTION add_hair_service_by_phone(
    phone_input text, 
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
  
  -- Create client if not exists vars
  created_client_id uuid;
BEGIN
  -- 1. Find or Create Client
  SELECT * INTO client_record FROM clients WHERE phone = phone_input;
  
  IF NOT FOUND THEN
    -- Auto-create client if manual entry for new person
    INSERT INTO clients (phone, visits, hair_service_count, created_at)
    VALUES (phone_input, 0, 0, now())
    RETURNING * INTO client_record;
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
    free_cut_redeemed = CASE WHEN free_cut_unlocked THEN false ELSE free_cut_redeemed END,
    
    -- Also update generic stats
    last_visit = now(),
    visits = COALESCE(visits, 0) + 1
    
  WHERE id = client_record.id;

  -- 6. Return Result
  RETURN json_build_object(
    'success', true,
    'new_total_services', new_count,
    'discount_5th_unlocked', discount_unlocked,
    'free_cut_unlocked', free_cut_unlocked,
    'message', 'Servicio registrado correctamente (Manual)'
  );
END;
$$;
