const pool = require('./server/db.js');
const { getOrderStateMeta } = require('./server/moysklad_api.js');

async function checkMS() {
    const res = await pool.query(
        "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('moysklad_token', 'moysklad_sync_enabled')"
    );
    let token = '';
    res.rows.forEach(r => {
        if (r.setting_key === 'moysklad_token') token = r.setting_value;
    });

    console.log("Token exists:", !!token);

    if (token) {
        const fetch = require('node-fetch'); // we use global fetch or node-fetch
        // Let's copy msRequest logic to trace the exact response
        const authHeader = token.includes(':')
            ? `Basic ${Buffer.from(token).toString('base64')}`
            : `Bearer ${token}`;

        const headers = { 'Authorization': authHeader, 'Accept-Encoding': 'gzip' };

        const msRes = await fetch('https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata', { headers });
        const data = await msRes.json();
        
        if (data && data.states) {
            console.log("Available MS States:", data.states.map(s => `'${s.name}'`).join(', '));
        } else {
            console.log("No states found or error:", data);
        }
    }
    process.exit();
}

checkMS();
