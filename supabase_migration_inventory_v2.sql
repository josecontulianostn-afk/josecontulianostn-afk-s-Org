-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Admin/Inventory full access products" ON products;

-- Create Products Table (Dynamic Inventory)
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode text UNIQUE, -- Nullable because some custom items might not have one initially
  name text NOT NULL,
  category text CHECK (category IN ('perfume', 'desodorante', 'capilar', 'otro')),
  gender text CHECK (gender IN ('hombre', 'mujer', 'unisex', 'n/a')),
  cost_price numeric DEFAULT 0,
  sale_price numeric DEFAULT 0,
  stock int DEFAULT 0,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for Products
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin/Inventory full access products" ON products FOR ALL USING (true); -- Simplified for now, refine with roles later or use service key

-- Drop existing policies for requests
DROP POLICY IF EXISTS "Read requests" ON inventory_requests;
DROP POLICY IF EXISTS "Create requests" ON inventory_requests;
DROP POLICY IF EXISTS "Update requests" ON inventory_requests;

-- Create Inventory Requests Table (For Manual Sales Validation)
CREATE TABLE IF NOT EXISTS inventory_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  quantity int NOT NULL, -- Negative for sales, Positive for restock (if used later)
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_by uuid, -- Auth user id
  admin_notes text,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE inventory_requests ENABLE ROW LEVEL SECURITY;

-- Policies for Requests
CREATE POLICY "Read requests" ON inventory_requests FOR SELECT USING (true);
CREATE POLICY "Create requests" ON inventory_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Update requests" ON inventory_requests FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_requests_status ON inventory_requests(status);
