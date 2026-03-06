const pool = require('./db');

async function migrate() {
    try {
        console.log('Adding payment_status column if it does not exist...');
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Не оплачен';");
        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
