const pool = require('./db');

async function checkTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));

        if (res.rows.length > 0) {
            for (let row of res.rows) {
                const columns = await pool.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                `, [row.table_name]);
                console.log(`\nTable ${row.table_name} columns:`);
                console.table(columns.rows);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
    }
}

checkTables();
