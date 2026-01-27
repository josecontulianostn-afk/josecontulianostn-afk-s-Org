-- 1. Fix Foreign Keys for Client Deletion (Cascade)

-- visit_registrations
ALTER TABLE visit_registrations
DROP CONSTRAINT IF EXISTS visit_registrations_client_id_fkey;

ALTER TABLE visit_registrations
ADD CONSTRAINT visit_registrations_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- hair_service_log
ALTER TABLE hair_service_log
DROP CONSTRAINT IF EXISTS hair_service_log_client_id_fkey;

ALTER TABLE hair_service_log
ADD CONSTRAINT hair_service_log_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- transactions
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_client_id_fkey;

ALTER TABLE transactions
ADD CONSTRAINT transactions_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- 2. Add columns for Financial Dashboard (Costos Adicionales)

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS additional_cost integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_cost_detail text;
