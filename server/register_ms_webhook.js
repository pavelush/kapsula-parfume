require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const pool = require('./db');

async function registerWebhook() {
    try {
        console.log("Fetching MoySklad token...");
        const res = await pool.query(
            "SELECT setting_value FROM settings WHERE setting_key = 'moysklad_token'"
        );
        
        if (res.rows.length === 0 || !res.rows[0].setting_value) {
            console.error("Error: moysklad_token is not set in the database.");
            process.exit(1);
        }
        
        const token = res.rows[0].setting_value;
        const authHeader = token.includes(':')
            ? `Basic ${Buffer.from(token).toString('base64')}`
            : `Bearer ${token}`;

        // Get current webhooks to check if it already exists
        const getRes = await fetch('https://api.moysklad.ru/api/remap/1.2/entity/webhook', {
            headers: { 'Authorization': authHeader }
        });
        
        const currentWebhooks = await getRes.json();
        const webhookUrl = "https://kapsula-parfume.ru/api/moysklad/webhook";
        
        let exists = false;
        if (currentWebhooks.rows) {
            for (const wh of currentWebhooks.rows) {
                if (wh.url === webhookUrl && wh.entityType === 'customerorder') {
                    exists = true;
                    console.log("Webhook already registered with ID:", wh.id);
                }
            }
        }

        if (exists) {
            console.log("Nothing to do.");
            process.exit(0);
        }

        console.log("Registering webhook for customerorder updates...");
        
        const webhookData = {
            url: webhookUrl,
            action: "UPDATE",
            entityType: "customerorder"
        };
        
        const postRes = await fetch('https://api.moysklad.ru/api/remap/1.2/entity/webhook', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });

        if (postRes.ok) {
            const data = await postRes.json();
            console.log("Webhook registered successfully. ID:", data.id);
        } else {
            const errText = await postRes.text();
            console.error("Failed to register webhook:", postRes.status, errText);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

registerWebhook();
