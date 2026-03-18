const pool = require('./db');

async function migrate() {
    try {
        console.log("Adding category column to products table...");
        
        // Check if column exists first
        const checkCol = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' and column_name='category';
        `);
        
        if (checkCol.rows.length === 0) {
            await pool.query(`ALTER TABLE products ADD COLUMN category VARCHAR(50) DEFAULT 'Парфюмерия';`);
            console.log("Column 'category' added with default value 'Парфюмерия'.");
        } else {
            console.log("Column 'category' already exists.");
        }
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        pool.end();
    }
}

migrate();
