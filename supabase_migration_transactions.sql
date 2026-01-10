-- Create transactions table for financial tracking
CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  amount int NOT NULL,
  type text NOT NULL, -- 'service', 'product', 'other'
  client_id uuid REFERENCES clients(id),
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add index for reporting
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
