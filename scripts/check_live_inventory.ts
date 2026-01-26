
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = "https://mabjlhjlkeehaczxrgcy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYmpsaGpsa2VlaGFjenhyZ2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mzg5MDMsImV4cCI6MjA4MTQxNDkwM30.eHuUAZMQ9eGffxCwYwOczhzZuRksv41QoUaIulebpT4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PERFUMES = [
    // --- CLÁSICOS DE LUJO ---
    {
        id: 'l1',
        brand: 'Lancôme',
        name: 'La Vie Est Belle EDP',
        price5ml: 6990,
        price10ml: 12990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 89990
    },
    {
        id: 'l2',
        brand: 'Carolina Herrera',
        name: 'Good Girl EDP',
        price5ml: 7990,
        price10ml: 14990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 94990
    },
    {
        id: 'l3',
        brand: 'Lancôme',
        name: 'Idôle EDP',
        price5ml: 6990,
        price10ml: 12990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 84990
    },
    {
        id: 'l4',
        brand: 'Giorgio Armani',
        name: 'Acqua Di Gioia EDP',
        price5ml: 6990,
        price10ml: 12990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 79990
    },
    {
        id: 'l5',
        brand: 'Yves Saint Laurent',
        name: 'Black Opium EDP',
        price5ml: 7990,
        price10ml: 14990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 92990
    },
    {
        id: 'l6',
        brand: 'Dolce & Gabbana',
        name: 'Light Blue EDT',
        price5ml: 5990,
        price10ml: 9990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 74990
    },

    // --- ÁRABES ---
    {
        id: 'a1',
        brand: 'Lattafa',
        name: 'Yara (Rosa) EDP',
        price5ml: 5990,
        price10ml: 8990,
        margin5ml: 2803,
        margin10ml: 4616,
        priceFullBottle: 32990
    },
    {
        id: 'a2',
        brand: 'Lattafa',
        name: 'Yara Tous',
        price5ml: 5990,
        price10ml: 8990,
        margin5ml: 2850,
        margin10ml: 4711,
        priceFullBottle: 32990
    },
    {
        id: 'a3',
        brand: 'Lattafa',
        name: 'Rave Now Women',
        price5ml: 4990,
        price10ml: 7990,
        margin5ml: 2040,
        margin10ml: 4091,
        priceFullBottle: 29990
    },
    {
        id: 'a4',
        brand: 'Fragrance World',
        name: 'Valentia Rome Intense',
        price5ml: 5990,
        price10ml: 8990,
        margin5ml: 2898,
        margin10ml: 4806,
        priceFullBottle: 34990
    },
    {
        id: 'a5',
        brand: 'Maison Alhambra',
        name: 'Leonie EDP',
        price5ml: 4990,
        price10ml: 6990,
        margin5ml: 2183,
        margin10ml: 3376,
        priceFullBottle: 31990
    },
    {
        id: 'a6',
        brand: 'Lattafa',
        name: 'Ana Abiyedh',
        price5ml: 6990,
        price10ml: 9990,
        margin5ml: 3487,
        margin10ml: 4983,
        priceFullBottle: 32990
    },
    {
        id: 'a7',
        brand: 'Maison Alhambra',
        name: 'Bad Femme',
        price5ml: 4990,
        price10ml: 6990,
        margin5ml: 2135,
        margin10ml: 3281,
        priceFullBottle: 31990
    },
    // --- DESODORANTES ---
    {
        id: 'd1',
        brand: 'Lattafa',
        name: 'Yara Desodorante Spray',
        price5ml: 0,
        price10ml: 0,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 5990
    },
    {
        id: 'd2',
        brand: 'Lattafa',
        name: 'Qaed Al Fursan Desodorante',
        price5ml: 0,
        price10ml: 0,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 5990
    },
    // --- RESTO SIN STOCK ---
    {
        id: 'a8',
        brand: 'Armaf',
        name: 'Club de Nuit Intense Woman EDP',
        price5ml: 5990,
        price10ml: 8990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 0
    },
    {
        id: 'a9',
        brand: 'Lattafa',
        name: 'Eclaire EDP',
        price5ml: 5990,
        price10ml: 8990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 0
    },
    {
        id: 'a10',
        brand: 'Armaf',
        name: 'Club de Nuit Untold EDP',
        price5ml: 6990,
        price10ml: 9990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 0
    },
    {
        id: 'a11',
        brand: 'Lattafa',
        name: 'Khamrah EDP',
        price5ml: 6990,
        price10ml: 9990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 0
    },
    {
        id: 'a12',
        brand: 'Armaf',
        name: 'Club de Nuit Imperiale',
        price5ml: 5990,
        price10ml: 8990,
        margin5ml: 0,
        margin10ml: 0,
        priceFullBottle: 0
    }
];

async function checkInventory() {
    console.log("Conectando a Supabase...");
    const { data: inventory, error } = await supabase.from('inventory').select('*');

    if (error) {
        console.error("Error fetching inventory:", error.message);
        return;
    }

    let report = "";
    report += "--- INVENTARIO Y COSTOS DETECTADOS ---\n";
    report += "| ID | Nombre | Stock Real | Costo Est. (10ml) | Precio Venta (10ml) | Margen |\n";
    report += "|----|--------|------------|-------------------|---------------------|--------|\n";

    PERFUMES.forEach(p => {
        const item = inventory.find(i => i.product_id === p.id);
        const stock = item ? item.quantity : 0;

        let costStr = "?";
        let marginStr = "0%";
        if (p.margin10ml > 0) {
            const cost = p.price10ml - p.margin10ml;
            costStr = `$${cost.toLocaleString()}`;
            marginStr = Math.round((p.margin10ml / p.price10ml) * 100) + "%";
        } else if (p.margin5ml > 0) {
            const cost = p.price5ml - p.margin5ml;
            costStr = `$${cost.toLocaleString()} (5ml)`;
        } else {
            costStr = "? (Falta Margen)";
        }

        report += `| ${p.id.padEnd(3)} | ${p.name.padEnd(25).substring(0, 25)} | ${stock.toString().padStart(10)} | ${costStr.padStart(17)} | $${p.price10ml.toLocaleString().padStart(18)} | ${marginStr.padStart(6)} |\n`;
    });

    fs.writeFileSync('inventory_report.md', report);
    console.log("Reporte guardado en inventory_report.md");
}

checkInventory();
