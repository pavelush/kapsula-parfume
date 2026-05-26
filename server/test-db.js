const { Pool } = require('pg');
require('dotenv').config();

async function testConnection(sslConfig) {
    console.log(`Testing connection with SSL:`, sslConfig);
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: sslConfig,
        connectionTimeoutMillis: 5000
    });

    try {
        const start = Date.now();
        const res = await pool.query('SELECT NOW()');
        console.log(`Success! Server time: ${res.rows[0].now} (took ${Date.now() - start}ms)`);
        await pool.end();
        return true;
    } catch (err) {
        console.error(`Failed: ${err.message}`);
        await pool.end();
        return false;
    }
}

async function run() {
    console.log('--- Test 1: No SSL ---');
    await testConnection(false);

    console.log('\n--- Test 2: SSL (rejectUnauthorized: false) ---');
    await testConnection({ rejectUnauthorized: false });

    console.log('\n--- Test 3: SSL (rejectUnauthorized: true) ---');
    await testConnection({ rejectUnauthorized: true });
}

run();
