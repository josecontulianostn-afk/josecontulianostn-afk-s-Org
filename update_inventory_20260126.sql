-- 1. Add new columns for tracking purchase history
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS last_purchase_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_purchase_date date;

-- 2. Insert/Update Inventory Data
-- We verify if the product exists, if so we update stock and purchase info.
-- If not, we insert it.
-- Note: quantities are ADDED to existing stock.
-- Purchase prices are updated to the *latest* invoice price.

-- Helper function to upsert execution (optional, using raw INSERT ON CONFLICT)

-- Item: Lattafa Yara EDP (a1) - Total Qty: 3 (2 from Inv1, 1 from Inv2). Cost ~23741.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a1', 3, 23741, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Lattafa Yara Tous EDP (a2) - Qty: 1. Cost ~22791.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a2', 1, 22791, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Lattafa Rave Now Women (a3) - Qty: 1. Cost ~18991.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a3', 1, 18991, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Valentia Rome Intense (a4) - Qty: 1. Cost ~21841.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a4', 1, 21841, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Leonie (a5) - Qty: 1. Cost ~16141.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a5', 1, 16141, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Ana Abiyedh (a6) - Qty: 1. Cost ~18041.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a6', 1, 18041, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Bad Femme (a7) - Qty: 1. Cost ~17091.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('a7', 1, 17091, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Yara Spray (d1) - Qty: 4 (3 from Inv1, 1 from Inv2). Cost ~3791.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('d1', 4, 3791, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Qaed Al Fursan Spray (d2) - Qty: 3 (2 from Inv1, 1 from Inv2). Cost ~3791.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('d2', 3, 3791, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();

-- Item: Yara Tous Spray (d3) - NEW - Qty: 1. Cost ~3791.
INSERT INTO inventory (product_id, quantity, last_purchase_price, last_purchase_date)
VALUES ('d3', 1, 3791, '2026-01-17')
ON CONFLICT (product_id) DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_purchase_price = EXCLUDED.last_purchase_price,
    last_purchase_date = EXCLUDED.last_purchase_date,
    updated_at = now();
