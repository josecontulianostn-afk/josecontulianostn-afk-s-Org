
-- 1. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Materiales', 'Herramientas', 'Mobiliario', 'Insumos Recepción', 'Otros')),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow Read for authenticated users
CREATE POLICY "Enable read for authenticated users only"
ON "public"."expenses"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Allow Insert for authenticated users
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."expenses"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow Delete for authenticated users
CREATE POLICY "Enable delete for authenticated users only"
ON "public"."expenses"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);
