require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const pool = require('./db');

async function migratePickupPoints() {
    try {
        console.log("Starting pickup_points table migration...");
        await pool.query(`
            ALTER TABLE pickup_points 
            ADD COLUMN IF NOT EXISTS moysklad_store_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS moysklad_store_name VARCHAR(255);
        `);
        console.log("Columns 'moysklad_store_id' and 'moysklad_store_name' added to 'pickup_points' table successfully.");
    } catch (err) {
        console.error("Error running pickup_points migration:", err);
    } finally {
        pool.end();
    }
}

migratePickupPoints();
