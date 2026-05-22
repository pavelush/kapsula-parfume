const pool = require('./db');

async function migratePaymentsAcquiring() {
    try {
        console.log("Starting payment_methods acquiring migration...");
        
        // 1. Add acquiring column to payment_methods table
        await pool.query(`
            ALTER TABLE payment_methods 
            ADD COLUMN IF NOT EXISTS acquiring VARCHAR(50) DEFAULT 'none';
        `);
        console.log("Column 'acquiring' verified/added to 'payment_methods'.");

        // 2. Populate acquiring column for existing payment methods based on their names
        const methodsRes = await pool.query('SELECT id, name, acquiring FROM payment_methods');
        for (const row of methodsRes.rows) {
            let recommendedAcquiring = row.acquiring || 'none';
            if (recommendedAcquiring === 'none') {
                const nameLower = row.name.toLowerCase();
                if (nameLower.includes('yookassa') || nameLower.includes('юkassa')) {
                    recommendedAcquiring = 'yookassa';
                } else if (
                    nameLower.includes('sberbank') ||
                    nameLower.includes('сбербанк') ||
                    nameLower.includes('sberpay') ||
                    nameLower.includes('сберпей')
                ) {
                    recommendedAcquiring = 'sberbank';
                }
            }

            if (recommendedAcquiring !== row.acquiring) {
                await pool.query('UPDATE payment_methods SET acquiring = $1 WHERE id = $2', [recommendedAcquiring, row.id]);
                console.log(`Updated payment method #${row.id} "${row.name}" acquiring to "${recommendedAcquiring}"`);
            }
        }
        
        console.log("Payment methods acquiring migration completed successfully.");
    } catch (err) {
        console.error("Error running payment methods acquiring migration:", err);
    } finally {
        pool.end();
    }
}

migratePaymentsAcquiring();
