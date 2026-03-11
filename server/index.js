const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (essential for correct req.protocol behind Nginx)
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL where the image can be accessed
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// --- ADMIN AUTH ---
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const passResult = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
        const adminPass = passResult.rows.length > 0 ? passResult.rows[0].setting_value : (process.env.ADMIN_PASS || 'admin');
        const adminUser = process.env.ADMIN_USER || 'admin';

        if (username === adminUser && password === adminPass) {
            // Return a dummy token for simplicity
            res.json({ success: true, token: 'admin-secret-token-123' });
        } else {
            res.status(401).json({ error: 'Неверный логин или пароль' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- HEALTH CHECK ---
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'OK', database: 'connected' });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(500).json({ status: 'ERROR', database: 'disconnected', error: err.message });
    }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const includeAll = req.query.all === 'true';
        const query = includeAll
            ? 'SELECT * FROM products ORDER BY id ASC'
            : 'SELECT * FROM products WHERE is_active = true ORDER BY id ASC';
        const result = await pool.query(query);
        let products = result.rows;

        // Fetch MoySklad price modifier
        const settingsRes = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'moysklad_price_modifier'");
        const modifierStr = settingsRes.rows.length > 0 ? settingsRes.rows[0].setting_value : '0';
        const modifier = parseFloat(modifierStr) || 0;

        // Apply modifier if it's not 0
        if (modifier !== 0) {
            products = products.map(product => {
                if (!product.prices || typeof product.prices !== 'object') return product;

                const modifiedPrices = { ...product.prices };
                for (const [vol, data] of Object.entries(modifiedPrices)) {
                    // It can be just the string/number price, or an object { price: 1000, sku: '...', stock: 0 }
                    let currentPrice = null;
                    if (typeof data === 'object' && data !== null && data.price) {
                        currentPrice = parseFloat(String(data.price).replace(/\s/g, ''));
                    } else if (typeof data === 'string' || typeof data === 'number') {
                        currentPrice = parseFloat(String(data).replace(/\s/g, ''));
                    }

                    if (currentPrice && !isNaN(currentPrice)) {
                        // Math: originalPrice * (1 - modifier / 100)
                        // If modifier is 5, it's originalPrice * 0.95 (5% discount)
                        let newPrice = currentPrice * (1 - (modifier / 100));
                        newPrice = Math.round(newPrice); // Round to nearest whole number

                        // Add nice formatting (spaces)
                        const formattedNewPrice = newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

                        // Update object structure if it was primitive
                        if (typeof data === 'object' && data !== null) {
                            modifiedPrices[vol] = { ...data, price: formattedNewPrice };
                        } else {
                            // If it was just "1500" or 1500, we'll keep the object structure for future
                            modifiedPrices[vol] = { price: formattedNewPrice };
                        }
                    }
                }
                return { ...product, prices: modifiedPrices };
            });
        }

        res.json(products);
    } catch (err) {
        console.error('Error fetching products from DB:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active, slug, seoTitle, seoDescription } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, brand, description, "fullDescription", "imgUrl", "colorTheme", prices, is_active, slug, "seoTitle", "seoDescription") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active !== undefined ? is_active : true, slug, seoTitle, seoDescription]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active, slug, seoTitle, seoDescription } = req.body;
        const activeValue = is_active !== undefined ? is_active : true;
        const result = await pool.query(
            'UPDATE products SET name = $1, brand = $2, description = $3, "fullDescription" = $4, "imgUrl" = $5, "colorTheme" = $6, prices = $7, is_active = $8, slug = $9, "seoTitle" = $10, "seoDescription" = $11 WHERE id = $12 RETURNING *',
            [name, brand, description, fullDescription, imgUrl, colorTheme, prices, activeValue, slug, seoTitle, seoDescription, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- BRANDS ---
app.get('/api/brands', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM brands ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/brands', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await pool.query('INSERT INTO brands (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const result = await pool.query('UPDATE brands SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Brand not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Brand not found' });
        res.json({ message: 'Brand deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- FAQS ---
app.get('/api/faqs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/faqs', async (req, res) => {
    try {
        const { question, answer, sort_order } = req.body;
        const result = await pool.query(
            'INSERT INTO faqs (question, answer, sort_order) VALUES ($1, $2, $3) RETURNING *',
            [question, answer, sort_order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/faqs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, sort_order } = req.body;
        const result = await pool.query(
            'UPDATE faqs SET question = $1, answer = $2, sort_order = $3 WHERE id = $4 RETURNING *',
            [question, answer, sort_order, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'FAQ not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/faqs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'FAQ not found' });
        res.json({ message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM settings WHERE setting_key != 'admin_password' ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/settings/batch', async (req, res) => {
    const client = await pool.connect();
    try {
        const { updates } = req.body; // Array of {key, value}
        await client.query('BEGIN');

        for (const update of updates) {
            await client.query(
                `INSERT INTO settings (setting_key, setting_value) 
                 VALUES ($1, $2) 
                 ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2`,
                [update.key, update.value]
            );
        }

        await client.query('COMMIT');

        // If sync interval or sync enabled was changed, restart the schedule
        if (updates.some(u => u.key === 'moysklad_sync_interval' || u.key === 'moysklad_sync_enabled')) {
            if (global.restartMoySkladSync) {
                global.restartMoySkladSync();
            }
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// --- PAYMENT METHODS ---
app.get('/api/payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payment_methods ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const { name, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO payment_methods (name, is_active) VALUES ($1, $2) RETURNING *',
            [name, is_active]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, is_active } = req.body;
        const result = await pool.query(
            'UPDATE payment_methods SET name = $1, is_active = $2 WHERE id = $3 RETURNING *',
            [name, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Payment method not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM payment_methods WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Payment method not found' });
        res.json({ message: 'Payment method deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- PICKUP POINTS ---
app.get('/api/pickup_points', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pickup_points ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/pickup_points', async (req, res) => {
    try {
        const { address, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO pickup_points (address, is_active) VALUES ($1, $2) RETURNING *',
            [address, is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/pickup_points/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { address, is_active } = req.body;
        const result = await pool.query(
            'UPDATE pickup_points SET address = $1, is_active = $2 WHERE id = $3 RETURNING *',
            [address, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pickup point not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/pickup_points/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM pickup_points WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pickup point not found' });
        res.json({ message: 'Pickup point deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- TELEGRAM NOTIFICATIONS ---
async function sendTelegramNotification(order) {
    try {
        const settingsRes = await pool.query(
            "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('telegram_bot_token', 'telegram_chat_id', 'telegram_notifications_enabled')"
        );
        const config = {};
        settingsRes.rows.forEach(r => { config[r.setting_key] = r.setting_value; });

        if (config.telegram_notifications_enabled !== 'true' || !config.telegram_bot_token || !config.telegram_chat_id) {
            console.log('[Telegram] Notifications disabled or not configured');
            return;
        }

        const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
        const itemsList = items.map(item => {
            // Price might be a string with spaces like "1 500"
            const priceStr = String(item.price || '0').replace(/\s+/g, '');
            const priceNum = parseInt(priceStr, 10) || 0;
            
            // Extract SKU from the prices object if available
            let sku = '';
            if (item.prices && item.prices[item.volume] && item.prices[item.volume].sku) {
                sku = item.prices[item.volume].sku;
            }
            
            // Format SKU as a link if it exists
            const skuString = sku ? `[<a href="https://online.moysklad.ru/app/#good?global_codeFilter=${sku}">${sku}</a>] ` : '';
            
            return `  ${skuString}• ${item.name} (${item.volume} мл.) x${item.quantity} — ${priceNum * item.quantity} руб.`;
        }).join('\n');

        const deliveryInfo = order.delivery_type === 'delivery'
            ? `Доставка (Курьером/Почтой): ${order.delivery_address || 'Не указан'}`
            : `Пункт выдачи (Самовывоз): ${order.delivery_address || 'Не указан'}`;

        const message =
            `🛍 <b>Новый заказ #${order.id}</b>\n\n` +
            `👤 ${order.customer_name || ''}\n` +
            `📞 ${order.customer_phone || ''}\n` +
            `${order.email ? '📧 ' + order.email + '\n' : ''}` +
            `\n📦 <b>Товары:</b>\n${itemsList}\n\n` +
            `💰 <b>Итого: ${order.total_price} руб.</b>\n` +
            `💳 ${order.payment_method || 'Не указан'}\n` +
            `🚚 ${deliveryInfo}`;

        const tgRes = await fetch(`https://api.telegram.org/bot${config.telegram_bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.telegram_chat_id,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const tgData = await tgRes.json();
        if (!tgData.ok) {
            console.error('[Telegram] API error:', tgData.description);
        } else {
            console.log('[Telegram] Notification sent for order #' + order.id);
        }
    } catch (err) {
        console.error('[Telegram] Notification error:', err.message);
    }
}

// --- EMAIL NOTIFICATIONS (NODEMAILER) ---
async function sendCustomerEmail(order, type) {
    try {
        if (!order.email) return; // No email provided by customer

        const settingsRes = await pool.query(
            "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('email_notifications_enabled', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name')"
        );
        const config = {};
        settingsRes.rows.forEach(r => { config[r.setting_key] = r.setting_value; });

        if (config.email_notifications_enabled !== 'true' || !config.smtp_host || !config.smtp_user || !config.smtp_pass) {
            console.log(`[Email] Notifications disabled or missing SMTP config for order #${order.id}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: parseInt(config.smtp_port, 10) || 465,
            secure: parseInt(config.smtp_port, 10) === 465,
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });

        const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
        let itemsHtml = items.map(item => {
            const priceStr = String(item.price || '0').replace(/\s+/g, '');
            const priceNum = parseInt(priceStr, 10) || 0;
            return `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;">${item.name} (${item.volume} мл)</td>
                    <td style="padding: 10px; border-bottom: 1px solid #333; text-align: center; color: #fff;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right; color: #E5B25D;">${priceNum * item.quantity} руб.</td>
                </tr>
            `;
        }).join('');

        let subject = '';
        let title = '';
        let subtitle = '';

        if (type === 'created') {
            subject = `Ваш заказ #${order.id} принят`;
            title = 'Спасибо за заказ!';
            subtitle = 'Мы получили ваш заказ и скоро начнем его собирать.';
        } else if (type === 'payment_success') {
            subject = `Оплата заказа #${order.id} прошла успешно`;
            title = 'Заказ успешно оплачен!';
            subtitle = 'Спасибо за покупку. Мы уже начали подготовку к отправке.';
        } else if (type === 'status_update') {
            subject = `Обновление статуса заказа #${order.id}`;
            title = 'Статус вашего заказа изменился';
            subtitle = `Новый статус: <strong style="color: #E5B25D;">${order.status}</strong>`;
        } else {
            return;
        }

        const deliveryInfo = order.delivery_type === 'delivery'
            ? `<b>Адрес доставки:</b><br/>${order.delivery_address || 'Не указан'}`
            : `<b>Пункт выдачи:</b><br/>${order.delivery_address || 'Не указан'}`;

        const htmlTemplate = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #111; color: #eee; padding: 40px 20px; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                <!-- Header -->
                <div style="background-color: #000; padding: 30px; text-align: center; border-bottom: 2px solid #E5B25D;">
                    <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: normal; letter-spacing: 2px;">KAPSULA <span style="color: #E5B25D;">PARFUME</span></h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #fff; margin-top: 0; margin-bottom: 10px; font-size: 22px;">${title}</h2>
                    <p style="color: #aaa; margin-bottom: 30px; font-size: 16px;">${subtitle}</p>
                    
                    <div style="background-color: #222; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h3 style="color: #E5B25D; margin-top: 0; margin-bottom: 15px; font-size: 16px; text-transform: uppercase;">Детали заказа #${order.id}</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                            ${itemsHtml}
                            <tr>
                                <td colspan="2" style="padding: 15px 10px 5px; text-align: right; color: #aaa;">Итого:</td>
                                <td style="padding: 15px 10px 5px; text-align: right; font-weight: bold; font-size: 18px; color: #E5B25D;">${order.total_price} руб.</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: #222; border-radius: 8px; padding: 20px;">
                        <p style="margin: 0 0 10px 0; color: #ddd;"><b>Получатель:</b> ${order.customer_name || 'Не указан'} (${order.customer_phone || 'Не указан'})</p>
                        <p style="margin: 0 0 10px 0; color: #ddd;"><b>Способ оплаты:</b> ${order.payment_method || 'Не указан'}</p>
                        <p style="margin: 0; color: #ddd;">${deliveryInfo}</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #111; padding: 20px; text-align: center; color: #666; font-size: 13px;">
                    <p style="margin: 0 0 5px 0;">Вы получили это письмо, потому что оформили заказ на сайте kapsula-parfume.ru</p>
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Kapsula Parfume. Все права защищены.</p>
                </div>
            </div>
        </div>
        `;

        const fromString = config.smtp_from_name ? `"${config.smtp_from_name}" <${config.smtp_from_email || config.smtp_user}>` : config.smtp_user;

        const info = await transporter.sendMail({
            from: fromString,
            to: order.email,
            subject: subject,
            html: htmlTemplate
        });

        console.log(`[Email] Notification sent to ${order.email} for order #${order.id}. MessageId: ${info.messageId}`);
    } catch (err) {
        console.error(`[Email] Notification error for order #${order.id}:`, err);
    }
}

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, customer_phone, email, items, total_price, payment_method, delivery_type, delivery_address } = req.body;

        let finalStatus = 'Новый';
        let paymentStatus = 'Не оплачен';

        // 1. First, create the order in the DB to get the order ID
        const result = await pool.query(
            'INSERT INTO orders (customer_name, customer_phone, email, items_json, total_price, payment_method, delivery_type, delivery_address, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [customer_name, customer_phone, email, JSON.stringify(items), total_price, payment_method, delivery_type, delivery_address, finalStatus, paymentStatus]
        );

        const order = result.rows[0];
        let confirmationUrl = null;

        // 2. Then, create YooKassa payment using the order ID
        if (payment_method && (payment_method.toLowerCase().includes('yookassa') || payment_method.toLowerCase().includes('юkassa'))) {
            const settingsRes = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('yookassa_enabled', 'yookassa_shop_id', 'yookassa_secret_key')");
            const config = {};
            settingsRes.rows.forEach(r => { config[r.setting_key] = r.setting_value; });

            if (config.yookassa_enabled === 'true' && config.yookassa_shop_id && config.yookassa_secret_key) {
                const authHeader = 'Basic ' + Buffer.from(`${config.yookassa_shop_id}:${config.yookassa_secret_key}`).toString('base64');
                const idempotenceKey = Date.now().toString() + '_' + Math.random().toString(36).substring(7);

                const yooRes = await fetch('https://api.yookassa.ru/v3/payments', {
                    method: 'POST',
                    headers: {
                        'Authorization': authHeader,
                        'Idempotence-Key': idempotenceKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: {
                            value: total_price.toFixed(2),
                            currency: "RUB"
                        },
                        capture: true,
                        confirmation: {
                            type: "redirect",
                            return_url: `${req.headers.referer || "https://kapsula-parfume.ru/"}?success_order=${order.id}`
                        },
                        description: `Номер заказа #${order.id}`,
                        metadata: {
                            order_id: order.id,
                            customer_phone,
                            email
                        }
                    })
                });

                if (yooRes.ok) {
                    const paymentData = await yooRes.json();
                    confirmationUrl = paymentData.confirmation?.confirmation_url;

                    // 3. Update the order with YooKassa payment ID and status
                    await pool.query(
                        'UPDATE orders SET yookassa_payment_id = $1, payment_status = $2 WHERE id = $3',
                        [paymentData.id, 'Ожидает оплаты', order.id]
                    );
                    order.yookassa_payment_id = paymentData.id;
                    order.payment_status = 'Ожидает оплаты';
                } else {
                    const errorText = await yooRes.text();
                    console.error('YooKassa Error:', errorText);
                }
            }
        }

        if (confirmationUrl) {
            order.confirmation_url = confirmationUrl;
        }

        const isYookassa = payment_method && (payment_method.toLowerCase().includes('yookassa') || payment_method.toLowerCase().includes('юkassa'));

        // Send notifications (fire-and-forget) if NOT YooKassa
        // YooKassa orders will send notification from the webhook after successful payment
        if (!isYookassa) {
            sendTelegramNotification(order);
            sendCustomerEmail(order, 'created');
        }

        res.status(201).json(order);
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Public endpoint to get basic order status for the success modal
app.get('/api/order_status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Only return non-sensitive info needed for the receipt
        const result = await pool.query(
            'SELECT id, items_json, delivery_type, delivery_address, total_price, payment_status, created_at FROM orders WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Fetch order status error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        const order = result.rows[0];
        // Send email notification on status change
        sendCustomerEmail(order, 'status_update');

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/orders/:id/payment_status', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        const result = await pool.query(
            'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
            [payment_status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/yookassa/webhook', async (req, res) => {
    try {
        const event = req.body;
        const eventType = event.event;
        const paymentData = event.object;

        if (!paymentData || !paymentData.id) {
            return res.status(400).send('Invalid webhook data');
        }

        if (eventType === 'payment.succeeded') {
            const updateRes = await pool.query(
                "UPDATE orders SET payment_status = 'Оплачен' WHERE yookassa_payment_id = $1 RETURNING *",
                [paymentData.id]
            );
            console.log(`[YooKassa Webhook] Order with payment ID ${paymentData.id} marked as Оплачен`);
            
            if (updateRes.rows.length > 0) {
                const order = updateRes.rows[0];
                sendTelegramNotification(order);
                sendCustomerEmail(order, 'payment_success');
            }
        } else if (eventType === 'payment.canceled') {
            await pool.query(
                "UPDATE orders SET payment_status = 'Отменен' WHERE yookassa_payment_id = $1 AND payment_status = 'Ожидает оплаты'",
                [paymentData.id]
            );
            console.log(`[YooKassa Webhook] Order with payment ID ${paymentData.id} marked as Отменен`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[YooKassa Webhook] Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

const syncWithMoySklad = require('./sync_moysklad');

let syncTimeout = null;

const scheduleNextSync = async () => {
    try {
        const res = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'moysklad_sync_interval'");
        let intervalMinutes = 15;
        if (res.rows.length > 0 && res.rows[0].setting_value) {
            intervalMinutes = parseInt(res.rows[0].setting_value, 10) || 15;
        }
        if (intervalMinutes < 1) intervalMinutes = 1; // min 1 minute

        console.log(`[MoySklad Sync] Следующая синхронизация запланирована через ${intervalMinutes} мин.`);

        syncTimeout = setTimeout(async () => {
            await syncWithMoySklad();
            scheduleNextSync();
        }, intervalMinutes * 60 * 1000);
    } catch (err) {
        console.error("Error scheduling MoySklad sync:", err);
        syncTimeout = setTimeout(scheduleNextSync, 15 * 60 * 1000);
    }
};

global.restartMoySkladSync = async () => {
    console.log('[MoySklad Sync] Перезапуск расписания синхронизации...');
    if (syncTimeout) clearTimeout(syncTimeout);
    await syncWithMoySklad();
    scheduleNextSync();
};

// --- DYNAMIC SITEMAP ---
app.get('/sitemap.xml', async (req, res) => {
    try {
        const result = await pool.query('SELECT slug, name FROM products WHERE is_active = true ORDER BY id ASC');
        const products = result.rows;
        const baseUrl = 'https://kapsula-parfume.ru';
        const today = new Date().toISOString().split('T')[0];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Main page
        xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;

        // Privacy page
        xml += `  <url>\n    <loc>${baseUrl}/privacy</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;

        // Product pages
        for (const product of products) {
            if (product.slug) {
                xml += `  <url>\n    <loc>${baseUrl}/product/${encodeURIComponent(product.slug)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
            }
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Error generating sitemap:', err);
        res.status(500).send('Error generating sitemap');
    }
});

// Serve static React frontend
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res, next) => {
    // Avoid serving index.html for API routes, uploads, and sitemap
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/sitemap.xml') {
        return next();
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Запускаем первый раз через 5 секунд после старта
    setTimeout(async () => {
        await syncWithMoySklad();
        scheduleNextSync();
    }, 5000);
});
