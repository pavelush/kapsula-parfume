const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
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

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const includeAll = req.query.all === 'true';
        const query = includeAll
            ? 'SELECT * FROM products ORDER BY id ASC'
            : 'SELECT * FROM products WHERE is_active = true ORDER BY id ASC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, brand, description, "fullDescription", "imgUrl", "colorTheme", prices, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active !== undefined ? is_active : true]
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
        const { name, brand, description, fullDescription, imgUrl, colorTheme, prices, is_active } = req.body;
        const activeValue = is_active !== undefined ? is_active : true;
        const result = await pool.query(
            'UPDATE products SET name = $1, brand = $2, description = $3, "fullDescription" = $4, "imgUrl" = $5, "colorTheme" = $6, prices = $7, is_active = $8 WHERE id = $9 RETURNING *',
            [name, brand, description, fullDescription, imgUrl, colorTheme, prices, activeValue, id]
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

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, customer_phone, email, items, total_price, payment_method, delivery_type, delivery_address } = req.body;
        const result = await pool.query(
            'INSERT INTO orders (customer_name, customer_phone, email, items_json, total_price, payment_method, delivery_type, delivery_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [customer_name, customer_phone, email, JSON.stringify(items), total_price, payment_method, delivery_type, delivery_address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
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

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
