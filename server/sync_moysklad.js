require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function syncWithMoySklad() {
    console.log('[MoySklad Sync] Скрипт синхронизации запущен...');
    const client = await pool.connect();

    try {
        // 1. Получаем настройки
        const settingsRes = await client.query('SELECT setting_key, setting_value FROM settings WHERE setting_key IN ($1, $2)', ['moysklad_token', 'moysklad_sync_enabled']);
        let token = '';
        let syncEnabled = 'false';

        settingsRes.rows.forEach(row => {
            if (row.setting_key === 'moysklad_token') token = row.setting_value;
            if (row.setting_key === 'moysklad_sync_enabled') syncEnabled = row.setting_value;
        });

        if (syncEnabled !== 'true' || !token) {
            console.log('[MoySklad Sync] Синхронизация выключена в настройках или не указан токен. Пропуск.');
            return;
        }

        console.log('[MoySklad Sync] Настройки получены. Скачиваем ассортимент из МойСклад...');

        // 2. Скачиваем ассортимент (используем fetch, доступный глобально в Node 18+)
        // API МойСклад: https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment
        // Поддерживает Basic Auth (телефон:пароль) или Bearer токен
        const authHeader = token.includes(':')
            ? `Basic ${Buffer.from(token).toString('base64')}`
            : `Bearer ${token}`;

        const msResponse = await globalThis.fetch('https://api.moysklad.ru/api/remap/1.2/entity/assortment', {
            headers: {
                'Authorization': authHeader,
                'Accept-Encoding': 'gzip'
            }
        });

        if (!msResponse.ok) {
            throw new Error(`МойСклад API Error: ${msResponse.status} ${msResponse.statusText}`);
        }

        const msData = await msResponse.json();
        const assortment = msData.rows || [];

        console.log(`[MoySklad Sync] Загружено ${assortment.length} позиций из МойСклад. Обновляем локальную базу...`);

        // Создаем Map для быстрого поиска по артикулу (или коду)
        // В МойСклад SKU можно хранить в article или code
        const msMap = new Map();
        assortment.forEach(item => {
            if (item.article) msMap.set(item.article, item);
            if (item.code) msMap.set(item.code, item); // Fallback to code
        });

        // 3. Получаем все товары из локальной БД
        const productsRes = await client.query('SELECT id, name, prices FROM products');
        let updatedCount = 0;

        // 4. Обновляем товары
        for (const product of productsRes.rows) {
            let pricesChanged = false;
            let currentPrices = product.prices;

            if (typeof currentPrices === 'object' && currentPrices !== null) {
                // Итерируемся по объемам (3, 5, 10, 100)
                for (const vol of Object.keys(currentPrices)) {
                    const volumeData = currentPrices[vol];

                    if (volumeData && volumeData.sku) {
                        const msItem = msMap.get(volumeData.sku);

                        if (msItem) {
                            // Цена в МойСклад хранится в копейках (salePrices[0].value)
                            const msPriceInKopecks = msItem.salePrices && msItem.salePrices.length > 0 ? msItem.salePrices[0].value : null;
                            const msStock = msItem.stock !== undefined ? msItem.stock : 0;

                            if (msPriceInKopecks !== null) {
                                // Конвертируем копейки в рубли и форматируем как строку '1 500' для сохранения
                                const msPrice = Math.round(msPriceInKopecks / 100);
                                const formattedNewPrice = msPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

                                // Обновляем данные, только если они изменились
                                if (volumeData.price !== formattedNewPrice || volumeData.stock !== msStock) {
                                    volumeData.price = formattedNewPrice;
                                    volumeData.stock = msStock;
                                    pricesChanged = true;
                                }
                            }
                        }
                    }
                }
            }

            // 5. Сохраняем обратно в БД, если были изменения
            if (pricesChanged) {
                await client.query('UPDATE products SET prices = $1 WHERE id = $2', [JSON.stringify(currentPrices), product.id]);
                updatedCount++;
            }
        }

        console.log(`[MoySklad Sync] Синхронизация завершена успешно! Обновлено товаров: ${updatedCount}.`);

    } catch (error) {
        console.error('[MoySklad Sync] Ошибка синхронизации:', error);
    } finally {
        client.release();
    }
}

// Если скрипт запущен напрямую
if (require.main === module) {
    syncWithMoySklad().then(() => pool.end());
}

module.exports = syncWithMoySklad;
