const pool = require('./db');

async function migrateSberbank() {
    try {
        console.log("Starting Sberbank acquiring migration...");
        
        // 1. Add sberbank_payment_id column to orders table
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS sberbank_payment_id VARCHAR(255);
        `);
        console.log("Column 'sberbank_payment_id' verified/added.");

        // 2. Add Sberbank KV settings
        const settings = [
            ['sberbank_enabled', 'false', 'Включить эквайринг Сбербанк/SberPay'],
            ['sberbank_userName', '', 'Логин мерчанта Сбербанк'],
            ['sberbank_password', '', 'Пароль мерчанта Сбербанк'],
            ['sberbank_sandbox', 'true', 'Тестовый режим Сбербанк (Sandbox)']
        ];

        for (const [k, v, desc] of settings) {
            await pool.query(`
                INSERT INTO settings (setting_key, setting_value, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (setting_key) DO UPDATE SET description = $3;
            `, [k, v, desc]);
        }
        console.log("Sberbank KV settings verified/inserted.");
        console.log("Sberbank migration completed successfully.");
    } catch (err) {
        console.error("Error running Sberbank migration:", err);
    } finally {
        pool.end();
    }
}

migrateSberbank();
