-- Add cost column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS cost integer DEFAULT 0;

-- Update existing transactions to have a default cost of 0 if null (though default handles new ones)
UPDATE transactions SET cost = 0 WHERE cost IS NULL;
