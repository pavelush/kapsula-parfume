const pool = require('./db');

const fragrances = [
    {
        name: "Bal D'Afrique",
        description: "Парижский авангард и африканская культура в одном флаконе. Теплый и романтичный аромат.",
        brand: "Byredo",
        colorTheme: "rgba(16, 185, 129, 0.15)",
        prices: JSON.stringify({
            3: { price: "1 500" },
            5: { price: "2 450" },
            10: { price: "4 900" }
        }),
        imgUrl: "/images/products/bal-dafrique.png"
    },
    {
        name: "Pink Molecule 090.09",
        description: "Яркая, искрящаяся интерпретация скандинавских пейзажей через призму розового шампанского.",
        brand: "Zarkoperfume",
        colorTheme: "rgba(236, 72, 153, 0.15)",
        prices: JSON.stringify({
            3: { price: "1 200" },
            5: { price: "1 600" },
            10: { price: "3 200" }
        }),
        imgUrl: "/images/products/pink-molecule.png"
    },
    {
        name: "Gentle Fluidity Gold",
        description: "Щедрый, обволакивающий шлейф. В его сердце мускус, кориандр и роскошная ваниль.",
        brand: "Maison Francis Kurkdjian",
        colorTheme: "rgba(251, 191, 36, 0.15)",
        prices: JSON.stringify({
            3: { price: "3 000" },
            5: { price: "4 700" },
            10: { price: "9 400" }
        }),
        imgUrl: "/images/products/gentle-fluidity.png"
    },
    {
        name: "Blue Talisman",
        description: "Бесконечная свежесть и элегантность, воплощенная в современном звучании груши и бергамота.",
        brand: "Ex Nihilo",
        colorTheme: "rgba(14, 165, 233, 0.15)",
        prices: JSON.stringify({
            3: { price: "3 000" },
            5: { price: "5 000" },
            10: { price: "10 000" }
        }),
        imgUrl: "/images/products/blue-talisman.png"
    },
    {
        name: "Guidance",
        description: "Увлекательное путешествие по сказочному лесу, где звучат ноты груши, ладана и лесного ореха.",
        brand: "Amouage",
        colorTheme: "rgba(217, 70, 239, 0.15)",
        prices: JSON.stringify({
            3: { price: "2 700" },
            5: { price: "4 500" },
            10: { price: "9 000" }
        }),
        imgUrl: "/images/products/guidance.png"
    },
    {
        name: "Morning Chess",
        description: "Тот самый легендарный аромат от Франсиса Кюркджяна. Слияние жасмина, шафрана и амбры.",
        brand: "Vilhelm Parfumerie",
        colorTheme: "rgba(220, 38, 38, 0.15)",
        prices: JSON.stringify({
            3: { price: "2 500" },
            5: { price: "4 000" },
            10: { price: "8 000" }
        }),
        imgUrl: "/images/products/morning-chess.webp"
    }
];

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                brand VARCHAR(255),
                "colorTheme" VARCHAR(50),
                prices JSONB,
                "imgUrl" VARCHAR(255)
            );
        `);
        console.log("Products table created or already exists.");

        // Clear existing data to avoid duplicates if run multiple times
        await pool.query(`TRUNCATE TABLE products RESTART IDENTITY`);

        for (const p of fragrances) {
            await pool.query(`
                INSERT INTO products (name, description, brand, "colorTheme", prices, "imgUrl")
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [p.name, p.description, p.brand, p.colorTheme, p.prices, p.imgUrl]);
        }
        console.log("Products inserted successfully.");
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        pool.end();
    }
}

initDB();
