require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const pool = require('./db');

async function migrateMoySkladOrders() {
    try {
        console.log("Starting MoySklad orders migration...");
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS moysklad_id VARCHAR(255);
        `);
        console.log("Column 'moysklad_id' added to 'orders' table successfully.");
    } catch (err) {
        console.error("Error running MoySklad orders migration:", err);
    } finally {
        pool.end();
    }
}

migrateMoySkladOrders();
