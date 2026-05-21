require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const pool = require('./db');

async function migratePickupPointsPriority() {
    try {
        console.log("Starting pickup_points priority migration...");
        await pool.query(`
            ALTER TABLE pickup_points 
            ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
        `);
        console.log("Column 'sort_order' added to 'pickup_points' table successfully.");
    } catch (err) {
        console.error("Error running priority migration:", err);
    } finally {
        pool.end();
    }
}

migratePickupPointsPriority();
