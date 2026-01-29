
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mabjlhjlkeehaczxrgcy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYmpsaGpsa2VlaGFjenhyZ2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mzg5MDMsImV4cCI6MjA4MTQxNDkwM30.eHuUAZMQ9eGffxCwYwOczhzZuRksv41QoUaIulebpT4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("--- DATABASE VERIFICATION ---");

    // 1. Check Connection via Transactions table
    try {
        const { data: tx, error: txError } = await supabase.from('transactions').select('id').limit(1);
        if (txError) {
            console.log("[FAIL] Transactions Table Check:", txError.message);
        } else {
            console.log("[OK] Transactions Table is accessible.");
        }
    } catch (e) {
        console.log("[FAIL] Connection Error:", e.message);
    }

    // 2. Check Service Costs table
    try {
        const { data, error } = await supabase.from('service_costs').select('*').limit(1);
        if (error) {
            console.error("[FAIL] service_costs Table Error:", error.message);
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
                console.log("\n>>> DIAGNOSIS: The table 'service_costs' DOES NOT EXIST in the database. <<<");
                console.log(">>> SOLUTION: Run the create table SQL script in Supabase Dashboard. <<<");
            }
        } else {
            console.log("[OK] service_costs Table EXISTS.");
        }
    } catch (e) {
        console.log("[FAIL] Unexpected Error checking service_costs:", e.message);
    }
}

check();
