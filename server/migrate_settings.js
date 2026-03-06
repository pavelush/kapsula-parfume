const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Inserting MoySklad KV settings...');

        const keys = [
            ['moysklad_token', ''],
            ['moysklad_sync_enabled', 'false'],
            ['moysklad_price_modifier', '0'],
            ['moysklad_sync_interval', '15']
        ];

        for (const [k, v] of keys) {
            await client.query(`
            INSERT INTO settings (setting_key, setting_value)
            VALUES ($1, $2)
            ON CONFLICT (setting_key) DO NOTHING;
        `, [k, v]);
        }

        console.log('MoySklad KV settings inserted successfully.');
        client.release();
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        pool.end();
    }
}

migrate();
