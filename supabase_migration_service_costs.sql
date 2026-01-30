-- Create service_costs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_costs (
  service_id TEXT PRIMARY KEY,
  cost INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_costs ENABLE ROW LEVEL SECURITY;

-- Allow all access (for prototype/admin simplicity)
CREATE POLICY "Allow all access for service_costs" 
ON public.service_costs 
FOR ALL 
USING (true) 
WITH CHECK (true);
