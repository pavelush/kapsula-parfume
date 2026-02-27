const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, brand, description, imgUrl, colorTheme, prices } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, brand, description, "imgUrl", "colorTheme", prices) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, brand, description, imgUrl, colorTheme, prices]
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
        const { name, brand, description, imgUrl, colorTheme, prices } = req.body;
        const result = await pool.query(
            'UPDATE products SET name = $1, brand = $2, description = $3, "imgUrl" = $4, "colorTheme" = $5, prices = $6 WHERE id = $7 RETURNING *',
            [name, brand, description, imgUrl, colorTheme, prices, id]
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
        const result = await pool.query('SELECT * FROM settings ORDER BY id ASC');
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

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, customer_phone, items, total_price, payment_method } = req.body;
        const result = await pool.query(
            'INSERT INTO orders (customer_name, customer_phone, items_json, total_price, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [customer_name, customer_phone, JSON.stringify(items), total_price, payment_method]
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
