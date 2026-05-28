const pool = require('./db');

async function migrate() {
    try {
        console.log("Starting migration to add new fields (compositionPyramid and characteristics)...");
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS "compositionPyramid" TEXT,
            ADD COLUMN IF NOT EXISTS "characteristics" TEXT;
        `);
        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
