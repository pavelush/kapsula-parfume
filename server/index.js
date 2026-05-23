const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (essential for correct req.protocol behind Nginx)
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
    origin: ['https://kapsula-parfume.ru'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// --- SECURITY INITIALIZATION & HELPERS ---
async function initSecurityTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                token VARCHAR(255) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[Security init] admin_sessions table initialized');
    } catch (err) {
        console.error('[Security init] Failed to initialize admin_sessions table:', err);
    }
}
initSecurityTables();

// Password hashing helpers using scryptSync
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedValue) {
    if (!storedValue.includes(':')) {
        // Plaintext comparison for migration
        return password === storedValue;
    }
    const [salt, hash] = storedValue.split(':');
    if (!salt || !hash) return false;
    const inputHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return inputHash === hash;
}

// In-memory IP rate limiter for login
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    if (loginAttempts.has(ip)) {
        const data = loginAttempts.get(ip);
        if (now - data.firstAttempt > RATE_LIMIT_WINDOW) {
            loginAttempts.set(ip, { count: 1, firstAttempt: now });
        } else {
            data.count += 1;
            if (data.count > MAX_ATTEMPTS) {
                const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - data.firstAttempt)) / 1000);
                return res.status(429).json({ error: `Слишком много попыток входа. Пожалуйста, попробуйте снова через ${timeLeft} сек.` });
            }
        }
    } else {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
    }
    next();
}

// In-memory IP rate limiter for order creation
const orderAttempts = new Map();
const ORDER_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ORDERS = 10;

function orderRateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    if (orderAttempts.has(ip)) {
        const data = orderAttempts.get(ip);
        if (now - data.firstAttempt > ORDER_RATE_LIMIT_WINDOW) {
            orderAttempts.set(ip, { count: 1, firstAttempt: now });
        } else {
            data.count += 1;
            if (data.count > MAX_ORDERS) {
                const timeLeft = Math.ceil((ORDER_RATE_LIMIT_WINDOW - (now - data.firstAttempt)) / 1000);
                return res.status(429).json({ error: `Слишком много заказов. Пожалуйста, попробуйте снова через ${timeLeft} сек.` });
            }
        }
    } else {
        orderAttempts.set(ip, { count: 1, firstAttempt: now });
    }
    next();
}

// Validation helpers
function validateEmail(email) {
    if (!email) return true; // Optional email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    if (!phone) return false;
    const re = /^\+?[0-9\s\-()]{7,20}$/;
    return re.test(phone);
}

function validateOrderPayload(req, res, next) {
    const { customer_name, customer_phone, email, items, total_price } = req.body;

    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2 || customer_name.length > 100) {
        return res.status(400).json({ error: 'Имя клиента должно быть строкой длиной от 2 до 100 символов' });
    }

    if (!customer_phone || typeof customer_phone !== 'string' || !validatePhone(customer_phone)) {
        return res.status(400).json({ error: 'Неверный формат номера телефона' });
    }

    if (email && (typeof email !== 'string' || !validateEmail(email))) {
        return res.status(400).json({ error: 'Неверный формат email' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Заказ должен содержать хотя бы один товар' });
    }

    for (const item of items) {
        if (!item || !item.id || !item.name || !item.volume || !item.quantity || Number(item.quantity) <= 0) {
            return res.status(400).json({ error: 'Некорректная структура товара в заказе' });
        }
    }

    const price = Number(total_price);
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Итоговая стоимость должна быть числом больше 0' });
    }

    next();
}

function validateProductPayload(req, res, next) {
    const { name, brand, category, prices } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 255) {
        return res.status(400).json({ error: 'Название товара должно быть строкой длиной от 2 до 255 символов' });
    }

    if (!brand || typeof brand !== 'string' || brand.trim().length < 1 || brand.length > 100) {
        return res.status(400).json({ error: 'Бренд должен быть строкой длиной от 1 до 100 символов' });
    }

    if (!category || (category !== 'Парфюмерия' && category !== 'Аксессуары')) {
        return res.status(400).json({ error: 'Категория должна быть "Парфюмерия" или "Аксессуары"' });
    }

    if (!prices || typeof prices !== 'object' || Array.isArray(prices)) {
        return res.status(400).json({ error: 'Некорректный формат цен (объект)' });
    }

    const allowedVolumes = category === 'Аксессуары' ? ['1'] : ['1', '3', '5', '10'];
    let hasAtLeastOnePrice = false;

    for (const key of Object.keys(prices)) {
        if (!allowedVolumes.includes(key)) {
            return res.status(400).json({ error: `Недопустимый объем или тип: ${key}` });
        }
        const vol = prices[key];
        if (vol && (vol.price || vol.sku || vol.stock !== undefined)) {
            if (vol.price) {
                const p = Number(String(vol.price).replace(/\s/g, ''));
                if (isNaN(p) || p < 0) {
                    return res.status(400).json({ error: `Некорректная цена для объема ${key}` });
                }
            }
            if (vol.stock !== undefined && vol.stock !== '') {
                const s = Number(vol.stock);
                if (isNaN(s) || s < 0) {
                    return res.status(400).json({ error: `Некорректный остаток для объема ${key}` });
                }
            }
            hasAtLeastOnePrice = true;
        }
    }

    if (!hasAtLeastOnePrice) {
        return res.status(400).json({ error: 'Товар должен иметь цену хотя бы для одного объема/варианта' });
    }

    next();
}

// Authentication middleware for administrative routes
async function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    try {
        const result = await pool.query('SELECT 1 FROM admin_sessions WHERE token = $1 AND created_at > NOW() - INTERVAL \'24 hours\'', [token]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный или просроченный токен сессии' });
        }
        next();
    } catch (err) {
        console.error('Session verification error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Serve uploaded images securely with custom header checks and mime verification
const ALLOWED_UPLOAD_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const UPLOADS_MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

app.get('/uploads/:filename', (req, res, next) => {
    const filename = req.params.filename;

    // Prevent directory traversal
    const safeFilename = path.basename(filename);
    if (safeFilename !== filename) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
        return res.status(403).json({ error: 'File type not allowed' });
    }

    const filePath = path.join(__dirname, 'uploads', safeFilename);

    // Double check that the file path actually resides within the uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
        return res.status(400).json({ error: 'Invalid file path' });
    }

    // Set headers for secure inline serving
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', UPLOADS_MIME_TYPES[ext]);

    // Send file securely
    res.sendFile(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.status(404).json({ error: 'File not found' });
            } else {
                next(err);
            }
        }
    });
});

// Configure Multer for secure image uploads
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

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)!'));
    }
});

// Secure file upload endpoint (admin only, size and mimetype validated)
app.post('/api/upload', authenticateAdmin, (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Размер файла не должен превышать 5МБ' });
                }
                return res.status(400).json({ error: err.message });
            } else {
                return res.status(400).json({ error: err.message });
            }
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ url: imageUrl });
    });
});

// --- ADMIN AUTH ---
app.post('/api/admin/login', rateLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const passResult = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
        let adminPass = passResult.rows.length > 0 ? passResult.rows[0].setting_value : null;
        const defaultPass = process.env.ADMIN_PASS || 'admin';
        const isDefaultUsed = !adminPass;
        if (isDefaultUsed) {
            adminPass = defaultPass;
        }
        const adminUser = process.env.ADMIN_USER || 'admin';

        if (username === adminUser && verifyPassword(password, adminPass)) {
            // Migrating plain text admin password to scrypt hash on successful login
            if (isDefaultUsed || !adminPass.includes(':')) {
                console.log('[Security] Migrating admin password to scrypt hash');
                const hashed = hashPassword(password);
                await pool.query(
                    `INSERT INTO settings (setting_key, setting_value, description) 
                     VALUES ('admin_password', $1, 'Пароль администратора') 
                     ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1`,
                    [hashed]
                );
            }

            // Generate secure session token
            const token = crypto.randomBytes(32).toString('hex');
            await pool.query("INSERT INTO admin_sessions (token) VALUES ($1)", [token]);

            // Clear login attempts for this IP on success
            const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            loginAttempts.delete(ip);

            res.json({ success: true, token });
        } else {
            res.status(401).json({ error: 'Неверный логин или пароль' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin logout endpoint
app.post('/api/admin/logout', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        await pool.query('DELETE FROM admin_sessions WHERE token = $1', [token]);
    }
    res.json({ success: true });
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
        
        // Protect all=true (disabled/draft products) to authenticated admin only
        if (includeAll) {
            let isAdmin = false;
            const authHeader = req.headers['authorization'];
            if (authHeader) {
                const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
                const sessionRes = await pool.query('SELECT 1 FROM admin_sessions WHERE token = $1', [token]);
                if (sessionRes.rows.length > 0) {
                    isAdmin = true;
                }
            }
            if (!isAdmin) {
                return res.status(401).json({ error: 'Требуется авторизация для просмотра всех товаров' });
            }
        }

        const query = includeAll
            ? 'SELECT * FROM products ORDER BY id ASC'
            : 'SELECT * FROM products WHERE is_active = true ORDER BY id ASC';
        const result = await pool.query(query);
        let products = result.rows;

        // Fetch MoySklad price modifier
        const settingsRes = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'moysklad_price_modifier'");
        const modifierStr = settingsRes.rows.length > 0 ? settingsRes.rows[0].setting_value : '0';
        const modifier = parseFloat(modifierStr) || 0;

        // Fetch MoySklad store stock map if store_id query param is present
        const storeId = req.query.store_id;
        let storeStockMap = null;
        if (storeId) {
            try {
                const { getMsStockByStore } = require('./moysklad_api');
                storeStockMap = await getMsStockByStore(storeId);
            } catch (err) {
                console.error(`Error fetching stock for store ${storeId}:`, err);
            }
        }

        // Fetch active stores for availability display
        let activeStores = [];
        let storeStockMaps = new Map();
        try {
            const activeStoresRes = await pool.query(
                'SELECT address, moysklad_store_id FROM pickup_points WHERE is_active = true AND moysklad_store_id IS NOT NULL'
            );
            activeStores = activeStoresRes.rows;
            
            const { getMsStockByStore } = require('./moysklad_api');
            // Fetch stocks in parallel (relies on cache inside moysklad_api)
            await Promise.all(activeStores.map(async (store) => {
                try {
                    const stockMap = await getMsStockByStore(store.moysklad_store_id);
                    if (stockMap) {
                        storeStockMaps.set(store.moysklad_store_id, stockMap);
                    }
                } catch (err) {
                    console.error(`Error fetching stock for store ${store.moysklad_store_id}:`, err);
                }
            }));
        } catch (err) {
            console.error('Error fetching active stores or store stocks:', err);
        }

        // Apply modifier, store stock override, and calculate available stores
        products = products.map(product => {
            // Calculate available stores first
            const availableStores = [];
            for (const store of activeStores) {
                const stockMap = storeStockMaps.get(store.moysklad_store_id);
                if (stockMap instanceof Map) {
                    let isAvailableInStore = false;
                    if (product.prices && typeof product.prices === 'object') {
                        for (const [vol, data] of Object.entries(product.prices)) {
                            if (data && data.sku) {
                                const stock = stockMap.get(data.sku) || 0;
                                if (stock > 0) {
                                    isAvailableInStore = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (isAvailableInStore) {
                        const displayName = store.address
                            .replace(/Москва,\s*/i, '')
                            .replace(/(ТЦ|ТРЦ|ТК)\s+/i, '')
                            .trim();
                        availableStores.push(displayName);
                    }
                }
            }

            if (!product.prices || typeof product.prices !== 'object') {
                return { ...product, available_stores: availableStores };
            }

            const modifiedPrices = { ...product.prices };
            for (const [vol, data] of Object.entries(modifiedPrices)) {
                let currentPrice = null;
                if (typeof data === 'object' && data !== null && data.price) {
                    currentPrice = parseFloat(String(data.price).replace(/\s/g, ''));
                } else if (typeof data === 'string' || typeof data === 'number') {
                    currentPrice = parseFloat(String(data).replace(/\s/g, ''));
                }

                // Initialize updated data object
                let updatedData = typeof data === 'object' && data !== null ? { ...data } : { price: data };

                // Apply modifier if it's not 0
                if (modifier !== 0 && currentPrice && !isNaN(currentPrice)) {
                    // Math: originalPrice * (1 - modifier / 100)
                    // If modifier is 5, it's originalPrice * 0.95 (5% discount)
                    let newPrice = currentPrice * (1 - (modifier / 100));
                    newPrice = Math.round(newPrice); // Round to nearest whole number

                    // Add nice formatting (spaces)
                    const formattedNewPrice = newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    updatedData.price = formattedNewPrice;
                }

                // Apply store stock override
                if (storeStockMap instanceof Map) {
                    if (updatedData.sku) {
                        const newStock = storeStockMap.has(updatedData.sku) ? storeStockMap.get(updatedData.sku) : 0;
                        updatedData.stock = newStock;
                    }
                }

                modifiedPrices[vol] = updatedData;
            }
            return { ...product, prices: modifiedPrices, available_stores: availableStores };
        });

        res.json(products);
    } catch (err) {
        console.error('Error fetching products from DB:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

app.post('/api/products', authenticateAdmin, validateProductPayload, async (req, res) => {
    try {
        const { name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active, slug, seoTitle, seoDescription, category, fsa_link } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, brand, description, "fullDescription", "imgUrl", "colorTheme", prices, is_active, slug, "seoTitle", "seoDescription", category, fsa_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active !== undefined ? is_active : true, slug, seoTitle, seoDescription, category || 'Парфюмерия', fsa_link]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/products/:id', authenticateAdmin, validateProductPayload, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active, slug, seoTitle, seoDescription, category, fsa_link } = req.body;
        const activeValue = is_active !== undefined ? is_active : true;
        const result = await pool.query(
            'UPDATE products SET name = $1, brand = $2, description = $3, "fullDescription" = $4, "imgUrl" = $5, "colorTheme" = $6, prices = $7, is_active = $8, slug = $9, "seoTitle" = $10, "seoDescription" = $11, category = $12, fsa_link = $13 WHERE id = $14 RETURNING *',
            [name, brand, description, fullDescription, imgUrl, colorTheme, prices, activeValue, slug, seoTitle, seoDescription, category || 'Парфюмерия', fsa_link, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
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

app.post('/api/brands', authenticateAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const result = await pool.query('INSERT INTO brands (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/brands/:id', authenticateAdmin, async (req, res) => {
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

app.delete('/api/brands/:id', authenticateAdmin, async (req, res) => {
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

app.post('/api/faqs', authenticateAdmin, async (req, res) => {
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

app.put('/api/faqs/:id', authenticateAdmin, async (req, res) => {
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

app.delete('/api/faqs/:id', authenticateAdmin, async (req, res) => {
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
        let isAdmin = false;
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
            const sessionRes = await pool.query('SELECT 1 FROM admin_sessions WHERE token = $1', [token]);
            if (sessionRes.rows.length > 0) {
                isAdmin = true;
            }
        }

        if (isAdmin) {
            const result = await pool.query("SELECT * FROM settings WHERE setting_key != 'admin_password' ORDER BY id ASC");
            res.json(result.rows);
        } else {
            // Whitelist of public settings allowed to be seen by unauthenticated users
            const publicKeys = [
                'contact_phone',
                'contact_address',
                'contact_hours',
                'contact_map_url',
                'contact_metropolis_phone',
                'contact_metropolis_address',
                'contact_metropolis_hours',
                'contact_metropolis_map_url',
                'social_telegram',
                'social_instagram',
                'social_vk',
                'social_tiktok',
                'legal_information',
                'moysklad_sync_enabled',
                'yookassa_enabled',
                'sberbank_enabled'
            ];
            const result = await pool.query(
                "SELECT * FROM settings WHERE setting_key = ANY($1) AND setting_key != 'admin_password' ORDER BY id ASC",
                [publicKeys]
            );
            res.json(result.rows);
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/settings/batch', authenticateAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { updates } = req.body; // Array of {key, value}
        await client.query('BEGIN');

        for (const update of updates) {
            let val = update.value;
            if (update.key === 'admin_password') {
                val = hashPassword(val);
            }
            await client.query(
                `INSERT INTO settings (setting_key, setting_value) 
                 VALUES ($1, $2) 
                 ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2`,
                [update.key, val]
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

app.post('/api/payments', authenticateAdmin, async (req, res) => {
    try {
        const { name, is_active, acquiring } = req.body;
        const result = await pool.query(
            'INSERT INTO payment_methods (name, is_active, acquiring) VALUES ($1, $2, $3) RETURNING *',
            [name, is_active, acquiring || 'none']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/payments/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, is_active, acquiring } = req.body;
        const result = await pool.query(
            'UPDATE payment_methods SET name = $1, is_active = $2, acquiring = $3 WHERE id = $4 RETURNING *',
            [name, is_active, acquiring || 'none', id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Payment method not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/payments/:id', authenticateAdmin, async (req, res) => {
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
        const result = await pool.query('SELECT * FROM pickup_points ORDER BY sort_order ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/pickup_points', authenticateAdmin, async (req, res) => {
    try {
        const { address, is_active, moysklad_store_id, moysklad_store_name, sort_order } = req.body;
        const result = await pool.query(
            'INSERT INTO pickup_points (address, is_active, moysklad_store_id, moysklad_store_name, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [address, is_active !== undefined ? is_active : true, moysklad_store_id || null, moysklad_store_name || null, parseInt(sort_order, 10) || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating pickup point:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/pickup_points/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { address, is_active, moysklad_store_id, moysklad_store_name, sort_order } = req.body;
        const result = await pool.query(
            'UPDATE pickup_points SET address = $1, is_active = $2, moysklad_store_id = $3, moysklad_store_name = $4, sort_order = $5 WHERE id = $6 RETURNING *',
            [address, is_active, moysklad_store_id || null, moysklad_store_name || null, parseInt(sort_order, 10) || 0, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pickup point not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating pickup point:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/pickup_points/:id', authenticateAdmin, async (req, res) => {
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
            // Price might be a string with spaces like "1 500" or "1.500"
            const priceStr = String(item.price || '0').replace(/[^\d]/g, '');
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
                rejectUnauthorized: true
            }
        });

        const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
        let itemsHtml = items.map((item, idx) => {
            const priceStr = String(item.price || '0').replace(/\s+/g, '');
            const priceNum = parseInt(priceStr, 10) || 0;
            const borderStyle = idx < items.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.05);' : '';
            return `
                <tr>
                    <td style="padding: 15px 0; ${borderStyle} color: #fff; font-size: 15px;">${item.name} <span style="color: #888; font-size: 13px;">(${item.volume} мл)</span></td>
                    <td style="padding: 15px 0; ${borderStyle} text-align: center; color: #fff; font-weight: 600; font-size: 15px;">${item.quantity}</td>
                    <td style="padding: 15px 0; ${borderStyle} text-align: right; color: #E5B25D; font-weight: 600; font-size: 15px;">${priceNum * item.quantity} руб.</td>
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
            // Using native Russian status from DB
            const displayStatus = order.status;
            subject = `Обновление статуса заказа #${order.id}`;
            title = 'Статус вашего заказа изменился';
            subtitle = `Новый статус: <strong style="color: #E5B25D;">${displayStatus}</strong>`;
        } else {
            return;
        }

        const deliveryTypeLabel = order.delivery_type === 'delivery' ? 'Адрес доставки:' : 'Пункт выдачи:';
        const deliveryValue = order.delivery_address || 'Не указан';

        // Using a solid dark background #1a1a1c since linear-gradient support in emails is spotty
        const htmlTemplate = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #111111; padding: 40px 20px; line-height: 1.5; color: #eeeeee;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1c; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                
                <!-- Gold Top Border -->
                <div style="height: 3px; background-color: #E5B25D; width: 100%;"></div>

                <!-- Header (Logo) -->
                <div style="padding: 40px 30px 20px; text-align: center;">
                    <img src="https://kapsula-parfume.ru/images/logo/logo.png" alt="KAPSULA PARFUME" style="width: 100px; display: block; margin: 0 auto;" />
                </div>
                
                <!-- Body -->
                <div style="padding: 10px 40px 40px;">
                    <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 26px; font-weight: 600; text-align: center;">${title}</h2>
                    <p style="color: #aaaaaa; margin: 0 0 35px 0; font-size: 16px; text-align: center;">${subtitle}</p>
                    
                    <!-- Order Items Card -->
                    <div style="background-color: #242429; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="color: #E5B25D; margin: 0 0 15px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">ДЕТАЛИ ЗАКАЗА #${order.id}</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${itemsHtml}
                            <tr>
                                <td colspan="3" style="padding-top: 15px;">
                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                                        <div style="color: #888; font-size: 15px; text-align: right; width: 100%;">
                                            <span style="margin-right: 15px;">Итого:</span>
                                            <span style="font-weight: 700; font-size: 18px; color: #E5B25D;">${order.total_price} руб.</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Customer Details Card -->
                    <div style="background-color: #242429; border-radius: 12px; padding: 25px;">
                        <p style="margin: 0 0 12px 0; font-size: 14px;">
                            <strong style="color: #ffffff; display: inline-block; width: 130px;">Получатель:</strong> 
                            <span style="color: #cccccc;">${order.customer_name || 'Не указан'} ${order.customer_phone || 'Не указан'}</span>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <strong style="color: #ffffff; display: inline-block; width: 130px;">${deliveryTypeLabel}</strong> 
                            <span style="color: #cccccc;">${deliveryValue}</span>
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #111111; padding: 30px; text-align: center; color: #666666; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0 0 8px 0;">Вы получили это письмо, потому что оформили заказ на сайте <a href="https://kapsula-parfume.ru" style="color: #0ea5e9; text-decoration: none;">kapsula-parfume.ru</a></p>
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

// --- SBERBANK ACQUIRING STATUS HELPER ---
async function updateSberbankOrderStatus(order) {
    if (!order.sberbank_payment_id || order.payment_status !== 'Ожидает оплаты') {
        return order;
    }

    try {
        const settingsRes = await pool.query(
            "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('sberbank_enabled', 'sberbank_userName', 'sberbank_password', 'sberbank_sandbox')"
        );
        const config = {};
        settingsRes.rows.forEach(r => { config[r.setting_key] = r.setting_value; });

        if (config.sberbank_enabled !== 'true' || !config.sberbank_userName || !config.sberbank_password) {
            console.error('[Sberbank Status Check] Credentials missing or disabled');
            return order;
        }

        const isSandbox = config.sberbank_sandbox === 'true';
        const sberParams = {
            userName: config.sberbank_userName,
            password: config.sberbank_password,
            orderId: order.sberbank_payment_id
        };

        const baseUrl = isSandbox ? 'https://sandbox.sberbank.ru/payment/rest/' : 'https://securepayments.sberbank.ru/payment/rest/';
        const url = `${baseUrl}getOrderStatusExtended.do`;
        const formParams = new URLSearchParams();
        for (const [key, val] of Object.entries(sberParams)) {
            formParams.append(key, String(val));
        }

        const sberRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formParams.toString()
        });

        if (!sberRes.ok) {
            console.error(`[Sberbank Status Check] API call failed: ${sberRes.status}`);
            return order;
        }

        const statusData = await sberRes.json();
        const orderStatus = statusData.orderStatus; // Number/Integer

        if (orderStatus === 2) {
            // Paid successfully
            const updateRes = await pool.query(
                "UPDATE orders SET payment_status = 'Оплачен' WHERE id = $1 RETURNING *",
                [order.id]
            );
            if (updateRes.rows.length > 0) {
                const updatedOrder = updateRes.rows[0];
                sendTelegramNotification(updatedOrder);
                sendCustomerEmail(updatedOrder, 'payment_success');

                const { updateMsOrderStatus } = require('./moysklad_api');
                if (updatedOrder.moysklad_id) {
                    await updateMsOrderStatus(updatedOrder.moysklad_id, 'Оплачен');
                }
                return updatedOrder;
            }
        } else if (orderStatus === 3 || orderStatus === 6) {
            // Cancelled or declined
            const cancelRes = await pool.query(
                "UPDATE orders SET payment_status = 'Отменен' WHERE id = $1 RETURNING *",
                [order.id]
            );
            if (cancelRes.rows.length > 0) {
                const updatedOrder = cancelRes.rows[0];
                const { updateMsOrderStatus } = require('./moysklad_api');
                if (updatedOrder.moysklad_id) {
                    await updateMsOrderStatus(updatedOrder.moysklad_id, 'Отменен');
                }
                return updatedOrder;
            }
        }
    } catch (err) {
        console.error('[Sberbank Status Check] Error checking order status:', err);
    }
    return order;
}

// --- ORDERS ---
app.post('/api/orders', orderRateLimiter, validateOrderPayload, async (req, res) => {
    try {
        const { customer_name, customer_phone, email, items, total_price, payment_method, delivery_type, delivery_address } = req.body;

        // Stock validation before placing order
        const skuGroups = {};
        for (const item of items) {
            const productRes = await pool.query('SELECT prices, category FROM products WHERE id = $1', [item.id]);
            if (productRes.rows.length === 0) {
                return res.status(400).json({ error: `Товар "${item.name}" не найден.` });
            }
            const product = productRes.rows[0];
            const pData = product.prices && product.prices[item.volume];
            if (!pData) {
                return res.status(400).json({ error: `Объем ${item.volume} мл для товара "${item.name}" не доступен.` });
            }
            
            if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
                const sku = pData.sku || `no-sku-${item.id}-${item.volume}`;
                const stockVal = Number(pData.stock);
                
                const isMlBased = product.category !== 'Аксессуары';
                const requestedQty = Number(item.quantity) || 1;
                const requestedUnits = isMlBased ? (requestedQty * Number(item.volume)) : requestedQty;
                
                if (!skuGroups[sku]) {
                    skuGroups[sku] = {
                        name: item.name,
                        totalRequested: 0,
                        availableStock: stockVal,
                        isMlBased: isMlBased,
                        volume: item.volume
                    };
                }
                skuGroups[sku].totalRequested += requestedUnits;
            }
        }
        
        for (const sku of Object.keys(skuGroups)) {
            const group = skuGroups[sku];
            if (group.totalRequested > group.availableStock) {
                if (group.isMlBased) {
                    return res.status(400).json({
                        error: `Недостаточно остатка для товара "${group.name}". Доступно: ${group.availableStock} мл, требуется: ${group.totalRequested} мл.`
                    });
                } else {
                    return res.status(400).json({
                        error: `Недостаточно остатка для товара "${group.name}". Доступно: ${group.availableStock} шт, требуется: ${group.totalRequested} шт.`
                    });
                }
            }
        }

        let finalStatus = 'Новый';
        let paymentStatus = 'Не оплачен';

        // 1. First, create the order in the DB to get the order ID
        const result = await pool.query(
            'INSERT INTO orders (customer_name, customer_phone, email, items_json, total_price, payment_method, delivery_type, delivery_address, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [customer_name, customer_phone, email, JSON.stringify(items), total_price, payment_method, delivery_type, delivery_address, finalStatus, paymentStatus]
        );

        let order = result.rows[0];
        let confirmationUrl = null;

        // Try to create order in MS 
        const { createMsCustomerOrder } = require('./moysklad_api');
        const msOrderId = await createMsCustomerOrder(order, items);
        
        if (msOrderId) {
            try {
                await pool.query('UPDATE orders SET moysklad_id = $1 WHERE id = $2', [msOrderId, order.id]);
                order.moysklad_id = msOrderId;
            } catch (err) {
                console.error('Warning: could not save moysklad_id to DB (is migration run?):', err.message);
            }
        }

        // 2. Determine acquiring type by searching DB, fallback to name-matching
        let acquiring = 'none';
        if (payment_method) {
            try {
                const methodRes = await pool.query('SELECT acquiring FROM payment_methods WHERE name = $1 AND is_active = true', [payment_method]);
                if (methodRes.rows.length > 0) {
                    acquiring = methodRes.rows[0].acquiring || 'none';
                } else {
                    const nameLower = payment_method.toLowerCase();
                    if (nameLower.includes('yookassa') || nameLower.includes('юkassa')) {
                        acquiring = 'yookassa';
                    } else if (
                        nameLower.includes('sberbank') ||
                        nameLower.includes('сбербанк') ||
                        nameLower.includes('sberpay') ||
                        nameLower.includes('сберпей')
                    ) {
                        acquiring = 'sberbank';
                    }
                }
            } catch (err) {
                console.error('Error fetching payment method acquiring config:', err.message);
                const nameLower = payment_method.toLowerCase();
                if (nameLower.includes('yookassa') || nameLower.includes('юkassa')) {
                    acquiring = 'yookassa';
                } else if (
                    nameLower.includes('sberbank') ||
                    nameLower.includes('сбербанк') ||
                    nameLower.includes('sberpay') ||
                    nameLower.includes('сберпей')
                ) {
                    acquiring = 'sberbank';
                }
            }
        }

        // Then, create YooKassa payment using the order ID if configured
        if (acquiring === 'yookassa') {
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

        // 2b. Or, create Sberbank payment using the order ID
        const isSberbank = acquiring === 'sberbank';
        if (isSberbank) {
            const settingsRes = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('sberbank_enabled', 'sberbank_userName', 'sberbank_password', 'sberbank_sandbox')");
            const config = {};
            settingsRes.rows.forEach(r => { config[r.setting_key] = r.setting_value; });

            if (config.sberbank_enabled === 'true' && config.sberbank_userName && config.sberbank_password) {
                const isSandbox = config.sberbank_sandbox === 'true';
                const sberParams = {
                    userName: config.sberbank_userName,
                    password: config.sberbank_password,
                    orderNumber: String(order.id),
                    amount: Math.round(total_price * 100),
                    currency: '643', // RUB
                    returnUrl: `${req.headers.referer || "https://kapsula-parfume.ru/"}?success_order=${order.id}`,
                    description: `Номер заказа #${order.id}`
                };

                const baseUrl = isSandbox ? 'https://sandbox.sberbank.ru/payment/rest/' : 'https://securepayments.sberbank.ru/payment/rest/';
                const url = `${baseUrl}register.do`;
                const formParams = new URLSearchParams();
                for (const [key, val] of Object.entries(sberParams)) {
                    if (val !== undefined && val !== null) {
                        formParams.append(key, String(val));
                    }
                }

                try {
                    const sberRes = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formParams.toString()
                    });

                    if (sberRes.ok) {
                        const paymentData = await sberRes.json();
                        if (paymentData.orderId && paymentData.formUrl) {
                            confirmationUrl = paymentData.formUrl;

                            await pool.query(
                                'UPDATE orders SET sberbank_payment_id = $1, payment_status = $2 WHERE id = $3',
                                [paymentData.orderId, 'Ожидает оплаты', order.id]
                            );
                            order.sberbank_payment_id = paymentData.orderId;
                            order.payment_status = 'Ожидает оплаты';
                        } else {
                            console.error('Sberbank register.do returned API error:', paymentData);
                        }
                    } else {
                        const errorText = await sberRes.text();
                        console.error('Sberbank network error:', errorText);
                    }
                } catch (err) {
                    console.error('Sberbank registration failed:', err);
                }
            }
        }

        if (confirmationUrl) {
            order.confirmation_url = confirmationUrl;
        }

        const isYookassa = acquiring === 'yookassa';
        const isOnlinePayment = isYookassa || isSberbank;

        // Send notifications (fire-and-forget) if NOT online payment
        // Online payments will send notifications from webhook/callback/check after successful payment
        if (!isOnlinePayment) {
            sendTelegramNotification(order);
            sendCustomerEmail(order, 'created');
        }

        res.status(201).json(order);
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/orders', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/orders/:id', authenticateAdmin, async (req, res) => {
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
        const result = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        let order = result.rows[0];
        
        // On-the-fly Sberbank status check and update
        if (order.sberbank_payment_id && order.payment_status === 'Ожидает оплаты') {
            order = await updateSberbankOrderStatus(order);
        }
        
        // Only return non-sensitive info needed for the receipt
        const publicOrder = {
            id: order.id,
            items_json: order.items_json,
            delivery_type: order.delivery_type,
            delivery_address: order.delivery_address,
            total_price: order.total_price,
            payment_status: order.payment_status,
            created_at: order.created_at
        };
        
        res.json(publicOrder);
    } catch (err) {
        console.error('Fetch order status error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/api/orders/:id/status', authenticateAdmin, async (req, res) => {
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

        const { updateMsOrderStatus } = require('./moysklad_api');
        if (order.moysklad_id) {
            await updateMsOrderStatus(order.moysklad_id, status);
        }

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/orders/:id/payment_status', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        const result = await pool.query(
            'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
            [payment_status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        const order = result.rows[0];
        const { updateMsOrderStatus } = require('./moysklad_api');
        if (order.moysklad_id) {
            await updateMsOrderStatus(order.moysklad_id, payment_status);
        }

        res.json(order);
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

        // Fetch YooKassa credentials from settings
        const settingsRes = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('yookassa_enabled', 'yookassa_shop_id', 'yookassa_secret_key')");
        const config = {};
        settingsRes.rows.forEach(r => { config[r.setting_key] = r.setting_value; });

        if (config.yookassa_enabled !== 'true' || !config.yookassa_shop_id || !config.yookassa_secret_key) {
            console.error('[YooKassa Webhook] YooKassa is disabled or credentials are not configured');
            return res.status(400).send('Webhook verification failed: credentials missing or disabled');
        }

        // Verify the payment details directly from the YooKassa API to prevent spoofing
        const authHeader = 'Basic ' + Buffer.from(`${config.yookassa_shop_id}:${config.yookassa_secret_key}`).toString('base64');
        const verifyRes = await globalThis.fetch(`https://api.yookassa.ru/v3/payments/${paymentData.id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        });

        if (!verifyRes.ok) {
            const errText = await verifyRes.text();
            console.error(`[YooKassa Webhook] Verification request failed for payment ${paymentData.id}:`, errText);
            return res.status(400).send('Webhook verification failed');
        }

        const verifiedPayment = await verifyRes.json();
        const verifiedStatus = verifiedPayment.status;

        if (eventType === 'payment.succeeded' && verifiedStatus === 'succeeded') {
            const updateRes = await pool.query(
                "UPDATE orders SET payment_status = 'Оплачен' WHERE yookassa_payment_id = $1 RETURNING *",
                [paymentData.id]
            );
            console.log(`[YooKassa Webhook] Order with payment ID ${paymentData.id} verified and marked as Оплачен`);

            if (updateRes.rows.length > 0) {
                const order = updateRes.rows[0];
                sendTelegramNotification(order);
                sendCustomerEmail(order, 'payment_success');

                const { updateMsOrderStatus } = require('./moysklad_api');
                if (order.moysklad_id) {
                    await updateMsOrderStatus(order.moysklad_id, 'Оплачен');
                }
            }
        } else if (eventType === 'payment.canceled' && verifiedStatus === 'canceled') {
            const cancelRes = await pool.query(
                "UPDATE orders SET payment_status = 'Отменен' WHERE yookassa_payment_id = $1 AND payment_status = 'Ожидает оплаты' RETURNING *",
                [paymentData.id]
            );
            console.log(`[YooKassa Webhook] Order with payment ID ${paymentData.id} verified and marked as Отменен`);
            
            if (cancelRes.rows.length > 0) {
                const order = cancelRes.rows[0];
                const { updateMsOrderStatus } = require('./moysklad_api');
                if (order.moysklad_id) {
                    await updateMsOrderStatus(order.moysklad_id, 'Отменен');
                }
            }
        } else {
            console.log(`[YooKassa Webhook] Ignored verified payment state: event=${eventType}, status=${verifiedStatus}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[YooKassa Webhook] Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// --- SBERBANK CALLBACK / WEBHOOK ---
const sberbankCallbackHandler = async (req, res) => {
    try {
        const params = { ...req.query, ...req.body };
        const mdOrder = params.mdOrder || params.orderId;
        const orderNumber = params.orderNumber;

        console.log('[Sberbank Callback] Received callback params:', params);

        if (!mdOrder && !orderNumber) {
            return res.status(400).send('Missing mdOrder or orderNumber');
        }

        let order = null;
        if (mdOrder) {
            const result = await pool.query('SELECT * FROM orders WHERE sberbank_payment_id = $1', [mdOrder]);
            if (result.rows.length > 0) {
                order = result.rows[0];
            }
        }
        if (!order && orderNumber) {
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [parseInt(orderNumber, 10)]);
            if (result.rows.length > 0) {
                order = result.rows[0];
            }
        }

        if (!order) {
            console.error('[Sberbank Callback] Order not found for callback:', params);
            return res.status(404).send('Order not found');
        }

        // Call the status check helper to verify directly with Sberbank API and trigger side effects
        const updatedOrder = await updateSberbankOrderStatus(order);

        console.log(`[Sberbank Callback] Processed callback for order #${updatedOrder.id}. Payment status is now: ${updatedOrder.payment_status}`);
        
        return res.status(200).send('OK');
    } catch (err) {
        console.error('[Sberbank Callback] Error processing callback:', err);
        return res.status(500).send('Internal server error');
    }
};

app.get('/api/sberbank/callback', sberbankCallbackHandler);
app.post('/api/sberbank/callback', sberbankCallbackHandler);

app.post('/api/moysklad/webhook', async (req, res) => {
    try {
        const events = req.body && req.body.events;
        if (!events || !Array.isArray(events)) {
            return res.status(400).send('Invalid webhook data');
        }

        const { token, enabled } = await require('./moysklad_api').getMsSettings ? await require('./moysklad_api').getMsSettings() : { enabled: false };
        if (!enabled || !token) {
            return res.status(200).send('Sync disabled');
        }

        const msRequest = async (url) => {
            // SSRF check: ensure URL points only to official MoySklad domains
            if (!url.startsWith('https://api.moysklad.ru/') && !url.startsWith('https://online.moysklad.ru/')) {
                throw new Error(`SSRF Prevention: Invalid MoySklad URL: ${url}`);
            }
            const authHeader = token.includes(':') ? `Basic ${Buffer.from(token).toString('base64')}` : `Bearer ${token}`;
            const res = await globalThis.fetch(url, { headers: { 'Authorization': authHeader, 'Accept-Encoding': 'gzip' } });
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
            return await res.json();
        };

        for (const event of events) {
            if (event.meta && event.meta.type === 'customerorder') {
                const msOrderId = event.meta.href.split('/').pop();
                
                // Fetch the updated order from MS
                const msOrder = await msRequest(event.meta.href);
                if (msOrder && msOrder.state && msOrder.state.meta) {
                    const stateMetaUrl = msOrder.state.meta.href;
                    const stateInfo = await msRequest(stateMetaUrl);
                    
                    if (stateInfo && stateInfo.name) {
                        const msStateName = stateInfo.name;
                        
                        const newLocalStatus = msStateName;
                        if (newLocalStatus && newLocalStatus !== 'Оплачен') {
                            await pool.query(
                                'UPDATE orders SET status = $1 WHERE moysklad_id = $2 AND status != $1',
                                [newLocalStatus, msOrderId]
                            );
                            console.log(`[MoySklad Webhook] Order ${msOrderId} status updated to ${newLocalStatus}`);
                        } else if (msStateName === 'Оплачен') {
                            await pool.query(
                                "UPDATE orders SET payment_status = 'Оплачен' WHERE moysklad_id = $1 AND payment_status != 'Оплачен'",
                                [msOrderId]
                            );
                            console.log(`[MoySklad Webhook] Order ${msOrderId} payment_status updated to Оплачен`);
                        }
                    }
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[MoySklad Webhook] Error processing webhook:', error);
        // Reply with 200 so MS doesn't disable the webhook
        res.status(200).send('Error but OK');
    }
});

app.get('/api/moysklad/stock-by-sku', authenticateAdmin, async (req, res) => {
    try {
        const { sku } = req.query;
        if (!sku) {
            return res.status(400).json({ error: 'SKU is required' });
        }
        
        const { getMsStockBySku } = require('./moysklad_api');
        const stockData = await getMsStockBySku(sku);
        res.json(stockData || []);
    } catch (err) {
        console.error('Error fetching stock by SKU:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

app.get('/api/moysklad/stores', authenticateAdmin, async (req, res) => {
    try {
        const { getMsStores } = require('./moysklad_api');
        const stores = await getMsStores();
        res.json(stores || []);
    } catch (err) {
        console.error('Error fetching MS stores:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
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
