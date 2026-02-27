const pool = require('./db');

async function migrate() {
    try {
        console.log("Starting database migration...");

        // 1. Brands Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS brands (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        // Seed initial brands based on existing products if empty
        const brandsCheck = await pool.query(`SELECT COUNT(*) FROM brands`);
        if (parseInt(brandsCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO brands (name) 
                SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL
                ON CONFLICT DO NOTHING;
            `);
        }

        // 2. FAQs Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS faqs (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                sort_order INTEGER DEFAULT 0
            );
        `);

        // Seed initial FAQs if empty
        const faqsCheck = await pool.query(`SELECT COUNT(*) FROM faqs`);
        if (parseInt(faqsCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO faqs (question, answer, sort_order) VALUES
                ('Вы продаете оригинальную парфюмерию?', 'Да, мы гарантируем 100% подлинность. Вся продукция закупается напрямую у официальных дистрибьюторов. Мы дорожим своей репутацией и готовы предоставить любые проверки.', 1),
                ('Как правильно хранить парфюм?', 'Идеальные условия — темное, прохладное место без резких перепадов температур. Избегайте прямых солнечных лучей и высокой влажности (не храните в ванной).', 2),
                ('Что такое "распив" или "отливанты"?', 'Это оригинальный парфюм, перелитый из большого фабричного флакона в атомайзеры меньшего объема (3, 5, 10 мл) при помощи стерильных шприцев. Это отличный способ познакомиться с ароматом перед покупкой полного флакона.', 3),
                ('Стойкость парфюма в атомайзерах меньше?', 'Нет, стойкость и звучание абсолютно идентичны. Формула аромата не меняется при переливании, а наши атомайзеры герметичны и предотвращают испарение.', 4),
                ('Отправляете ли вы в другие города?', 'Да, мы осуществляем доставку по всей России через СДЭК и Почту России. Стоимость рассчитывается индивидуально при оформлении.', 5);
            `);
        }

        // 3. Settings Table (Footer info, Contacts, etc.)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                setting_key VARCHAR(255) UNIQUE NOT NULL,
                setting_value TEXT NOT NULL,
                description TEXT
            );
        `);

        // Seed initial settings
        const settingsCheck = await pool.query(`SELECT COUNT(*) FROM settings`);
        if (parseInt(settingsCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO settings (setting_key, setting_value, description) VALUES
                ('contact_phone', '+7 916 203 54 94', 'Номер телефона в футере'),
                ('contact_address', 'Россия, Москва, ТЦ Авиапарк (1 этаж)', 'Адрес магазина'),
                ('contact_hours', 'Ежедневно 10:00 - 22:00', 'Часы работы'),
                ('social_telegram', 'https://t.me/kapsulaparfum', 'Ссылка на Telegram'),
                ('social_instagram', 'https://www.instagram.com/kapsula.parfum', 'Ссылка на Instagram'),
                ('social_vk', 'https://vk.ru/kapsula.parfum', 'Ссылка на VK');
            `);
        }

        // 4. Payment Methods Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payment_methods (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT true
            );
        `);

        // Seed initial payment methods
        const paymentCheck = await pool.query(`SELECT COUNT(*) FROM payment_methods`);
        if (parseInt(paymentCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO payment_methods (name, is_active) VALUES
                ('Наличными при получении', true),
                ('Безналичная оплата', true);
            `);
        }

        // 5. Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50) NOT NULL,
                items_json JSONB NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(255),
                status VARCHAR(50) DEFAULT 'new', -- new, processing, completed, cancelled
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Migration completed successfully. Tables created and baseline data seeded.");
    } catch (err) {
        console.error("Error running migrations:", err);
    } finally {
        pool.end();
    }
}

migrate();
