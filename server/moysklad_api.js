const pool = require('./db');
// Fetch is available globally in Node 18+

// Helper to get MS token
async function getMsSettings() {
    const res = await pool.query(
        "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('moysklad_token', 'moysklad_sync_enabled')"
    );
    let token = '';
    let enabled = 'false';
    res.rows.forEach(r => {
        if (r.setting_key === 'moysklad_token') token = r.setting_value;
        if (r.setting_key === 'moysklad_sync_enabled') enabled = r.setting_value;
    });
    return { token, enabled: enabled === 'true' };
}

// No local to MS map needed since we use native MS keys

// Helper for MS API
async function msRequest(endpoint, token, method = 'GET', body = null) {
    const authHeader = token.includes(':')
        ? `Basic ${Buffer.from(token).toString('base64')}`
        : `Bearer ${token}`;

    const headers = {
        'Authorization': authHeader,
        'Accept-Encoding': 'gzip'
    };

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await globalThis.fetch(`https://api.moysklad.ru/api/remap/1.2${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`MS API Error: ${res.status} ${res.statusText} - ${errText}`);
    }

    // Sometimes MS returns empty response (like 200 OK for updates or deletes without body)
    const resText = await res.text();
    return resText ? JSON.parse(resText) : null;
}

// 1. Get Organization
async function getOrganizationMeta(token) {
    const data = await msRequest('/entity/organization?limit=1', token);
    if (data && data.rows && data.rows.length > 0) {
        return data.rows[0].meta;
    }
    throw new Error('Организация не найдена в МойСклад');
}

// 2. Get or Create Counterparty
async function getOrCreateCounterpartyMeta(token, name, phone, email) {
    // Try to find by phone
    const cleanPhone = phone ? phone.replace(/\\D/g, '') : '';
    let filter = '';
    
    if (cleanPhone) filter = `phone~${cleanPhone}`;
    else if (email) filter = `email=${email}`;
    else filter = `name=${encodeURIComponent(name || 'Покупатель')}`;

    const data = await msRequest(`/entity/counterparty?filter=${filter}&limit=1`, token);
    
    if (data && data.rows && data.rows.length > 0) {
        return data.rows[0].meta;
    }

    // Create new
    const newCp = {
        name: name || 'Покупатель',
        phone: phone || '',
        email: email || '',
        companyType: 'individual'
    };
    
    const created = await msRequest('/entity/counterparty', token, 'POST', newCp);
    return created.meta;
}

// 3. Find Assortment Item Meta by SKU
async function findAssortmentMeta(token, sku) {
    // Search by article or code
    let data = await msRequest(`/entity/assortment?filter=article=${encodeURIComponent(sku)}&limit=1`, token);
    if (!data || data.rows.length === 0) {
        data = await msRequest(`/entity/assortment?filter=code=${encodeURIComponent(sku)}&limit=1`, token);
    }
    if (data && data.rows && data.rows.length > 0) {
         // Need to extract the specific type meta (product or variant)
         return {
             href: data.rows[0].meta.href,
             type: data.rows[0].meta.type,
             mediaType: data.rows[0].meta.mediaType
         };
    }
    return null;
}

async function getOrderStateMeta(token, stateName) {
    try {
        const data = await msRequest('/entity/customerorder/metadata', token);
        if (data && data.states) {
            const state = data.states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
            if (state) return state.meta;
        }
    } catch (e) {
        console.error('Error fetching state meta', e);
    }
    return null;
}

async function createMsCustomerOrder(order, items) {
    try {
        const { token, enabled } = await getMsSettings();
        if (!enabled || !token) {
            console.log('[MoySklad] Sync disabled or no token, skipping MS order creation.');
            return null;
        }

        console.log(`[MoySklad] Creating order for local order ID ${order.id}...`);

        const orgMeta = await getOrganizationMeta(token);
        const agentMeta = await getOrCreateCounterpartyMeta(token, order.customer_name, order.customer_phone, order.email);

        const positions = [];
        
        // Items must have a valid SKU
        for (const item of items) {
            let sku = '';
            if (item.prices && item.prices[item.volume] && item.prices[item.volume].sku) {
                sku = item.prices[item.volume].sku;
            }

            if (!sku) {
                console.warn(`[MoySklad] Warning: item ${item.name} has no sku, cannot add to MS order.`);
                continue; // Cannot add item without sku mapping
            }

            const itemMeta = await findAssortmentMeta(token, sku);
            
            if (itemMeta) {
                // MS requires price in kopecks
                const priceNum = String(item.price || '0').replace(/[^\d]/g, '');
                const kopecks = parseInt(priceNum, 10) * 100 || 0;

                // Проверяем, является ли SKU общим для нескольких объемов (т.е. остаток ведется в мл)
                let isSharedSku = false;
                const volumeVal = parseInt(item.volume) || 1;
                
                if (item.prices && sku) {
                    let skuCount = 0;
                    for (const vol of Object.keys(item.prices)) {
                        if (item.prices[vol] && item.prices[vol].sku === sku) {
                            skuCount++;
                        }
                    }
                    isSharedSku = skuCount > 1;
                }

                let positionQty = parseInt(item.quantity) || 1;
                let positionPrice = kopecks;

                if (isSharedSku) {
                    // Если SKU общий, значит, товар в МойСклад измеряется в мл
                    // Количество = количество заказанных флаконов * объем флакона в мл
                    positionQty = positionQty * volumeVal;
                    // Цена за 1 мл = цена флакона / объем флакона в мл
                    positionPrice = Math.round(kopecks / volumeVal);
                }
                
                positions.push({
                    quantity: positionQty,
                    price: positionPrice,
                    discount: 0,
                    vat: 0,
                    assortment: { meta: itemMeta },
                    reserve: positionQty // Резервируем товар в МойСклад
                });
            } else {
                console.warn(`[MoySklad] Warning: Assortment with sku/article ${sku} not found in MS. It won't be added to the order.`);
            }
        }

        const deliveryInfo = order.delivery_type === 'delivery' 
            ? `Доставка: ${order.delivery_address || 'Не указан'}` 
            : `Самовывоз: ${order.delivery_address || 'Не указан'}`;
        
        const description = `Способ оплаты: ${order.payment_method || 'Не указан'}\n${deliveryInfo}\nСоздан на сайте: kapsula-parfume.ru`;

        let msStoreId = null;
        if (order.delivery_type === 'pickup' && order.delivery_address) {
            try {
                const pickupPointRes = await pool.query(
                    'SELECT moysklad_store_id FROM pickup_points WHERE address = $1 LIMIT 1',
                    [order.delivery_address]
                );
                if (pickupPointRes.rows.length > 0) {
                    msStoreId = pickupPointRes.rows[0].moysklad_store_id;
                }
            } catch (dbErr) {
                console.error('[MoySklad] Failed to check store for pickup point:', dbErr.message);
            }
        }

        // Create the MS Order
        // Using local order ID as the name to easily link them
        const msOrderBody = {
            name: String(order.id),
            organization: { meta: orgMeta },
            agent: { meta: agentMeta },
            description: description,
        };

        if (msStoreId) {
            msOrderBody.store = {
                meta: {
                    href: `https://api.moysklad.ru/api/remap/1.2/entity/store/${msStoreId}`,
                    type: 'store',
                    mediaType: 'application/json'
                }
            };
        }

        // Attach state using native naming
        const stateName = order.status || 'Новый';
        const stateMeta = await getOrderStateMeta(token, stateName);
        if (stateMeta) {
            msOrderBody.state = { meta: stateMeta };
        }

        if (positions.length > 0) {
            msOrderBody.positions = positions;
        }

        const createdMsOrder = await msRequest('/entity/customerorder', token, 'POST', msOrderBody);
        console.log(`[MoySklad] Order created successfully. MS ID: ${createdMsOrder.id}`);
        return createdMsOrder.id;

    } catch (error) {
        console.error('[MoySklad] Failed to create order in MS:', error.message);
        return null; // Return null so the local code won't blow up if MS fails
    }
}

async function updateMsOrderStatus(msOrderId, localStatus) {
    if (!msOrderId) return;
    
    try {
        const { token, enabled } = await getMsSettings();
        if (!enabled || !token) return;

        const targetStateName = localStatus;
        if (!targetStateName) return; // No mapping

        // Fetch the state meta
        const stateMeta = await getOrderStateMeta(token, targetStateName);
        if (stateMeta) {
            await msRequest(`/entity/customerorder/${msOrderId}`, token, 'PUT', {
                state: { meta: stateMeta }
            });
            console.log(`[MoySklad] Updated MS order ${msOrderId} to state ${targetStateName}`);
        } else {
            console.warn(`[MoySklad] State '${targetStateName}' not found in MS metadata. MS order not updated.`);
        }
    } catch (error) {
         console.error('[MoySklad] Failed to update MS order status:', error.message);
    }
}

async function getMsStockBySku(sku) {
    try {
        const { token, enabled } = await getMsSettings();
        if (!enabled || !token) {
            console.log('[MoySklad] Stock query skipped: sync disabled or no token.');
            return null;
        }

        const itemMeta = await findAssortmentMeta(token, sku);
        if (!itemMeta) {
            console.log(`[MoySklad] Assortment not found for SKU: ${sku}`);
            return null;
        }

        const endpoint = `/report/stock/bystore?filter=${itemMeta.type}=${encodeURIComponent(itemMeta.href)}`;
        const stockData = await msRequest(endpoint, token);

        if (stockData && stockData.rows && stockData.rows.length > 0) {
            return stockData.rows[0].stockByStore || [];
        }
        return [];
    } catch (error) {
        console.error(`[MoySklad] Failed to fetch stock by SKU (${sku}):`, error.message);
        return null;
    }
}

async function getMsStores() {
    try {
        const { token, enabled } = await getMsSettings();
        if (!enabled || !token) {
            console.log('[MoySklad] Sync disabled or no token, skipping stores fetch.');
            return [];
        }
        const data = await msRequest('/entity/store', token);
        if (data && data.rows) {
            return data.rows.map(row => ({
                id: row.id,
                name: row.name,
                href: row.meta.href
            }));
        }
        return [];
    } catch (error) {
        console.error('[MoySklad] Failed to fetch stores:', error.message);
        return [];
    }
}

let assortmentCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getAssortmentMapping(token) {
    const now = Date.now();
    if (assortmentCache && (now - lastCacheTime < CACHE_TTL)) {
        return assortmentCache;
    }

    console.log('[MoySklad Stock Sync] Fetching assortment for cache...');
    const data = await msRequest('/entity/assortment?limit=1000', token);
    const hrefToSku = new Map();
    if (data && data.rows) {
        data.rows.forEach(item => {
            const sku = item.article || item.code;
            if (sku && item.meta && item.meta.href) {
                hrefToSku.set(item.meta.href.split('?')[0], sku);
            }
        });
    }

    assortmentCache = hrefToSku;
    lastCacheTime = now;
    return hrefToSku;
}

const storeStocksCache = new Map();
const STORE_STOCK_TTL = 2 * 60 * 1000; // 2 minutes

async function getMsStockByStore(storeId) {
    const now = Date.now();
    if (storeStocksCache.has(storeId)) {
        const cached = storeStocksCache.get(storeId);
        if (now - cached.time < STORE_STOCK_TTL) {
            return cached.map;
        }
    }

    try {
        const { token, enabled } = await getMsSettings();
        if (!enabled || !token) {
            console.log('[MoySklad] Stock query by store skipped: sync disabled or no token.');
            return null;
        }

        const hrefToSku = await getAssortmentMapping(token);
        const endpoint = `/report/stock/bystore?filter=store=https://api.moysklad.ru/api/remap/1.2/entity/store/${storeId}&limit=1000`;
        const stockData = await msRequest(endpoint, token);

        const skuStockMap = new Map();
        if (stockData && stockData.rows) {
            stockData.rows.forEach(row => {
                if (row.meta && row.meta.href) {
                    const cleanHref = row.meta.href.split('?')[0];
                    const sku = hrefToSku.get(cleanHref);
                    if (sku) {
                        const storeStock = row.stockByStore ? row.stockByStore[0] : null;
                        const stock = storeStock ? storeStock.stock : 0;
                        const reserve = storeStock ? storeStock.reserve : 0;
                        const available = stock - reserve;
                        skuStockMap.set(sku, Math.max(0, available));
                    }
                }
            });
        }
        
        storeStocksCache.set(storeId, { time: now, map: skuStockMap });
        return skuStockMap;
    } catch (error) {
        console.error(`[MoySklad] Failed to fetch stock by store (${storeId}):`, error.message);
        return null;
    }
}

async function createMsPaymentIn(msOrderId) {
    if (!msOrderId) return null;
    
    try {
        const { token, enabled } = await getMsSettings();
        if (!enabled || !token) {
            console.log('[MoySklad] Sync disabled or no token, skipping payment document creation.');
            return null;
        }

        console.log(`[MoySklad] Checking payment state for order ${msOrderId}...`);

        // 1. Fetch order details to get organization, agent, and sum
        const order = await msRequest(`/entity/customerorder/${msOrderId}`, token);
        if (!order) {
            console.error(`[MoySklad] Order ${msOrderId} not found, cannot create payment.`);
            return null;
        }

        // 2. Prevent duplicate payment document creation
        if (order.payedSum > 0) {
            console.log(`[MoySklad] Order ${msOrderId} is already paid (payedSum: ${order.payedSum}). Skipping payment creation.`);
            return null;
        }

        // 3. Prepare paymentin payload
        const paymentBody = {
            organization: { meta: order.organization.meta },
            agent: { meta: order.agent.meta },
            sum: order.sum,
            operations: [
                {
                    meta: {
                        href: order.meta.href,
                        type: 'customerorder',
                        mediaType: 'application/json'
                    },
                    linkedSum: order.sum
                }
            ]
        };

        // 4. Create paymentin
        console.log(`[MoySklad] Creating Incoming Payment for order ${msOrderId}...`);
        const paymentIn = await msRequest('/entity/paymentin', token, 'POST', paymentBody);
        console.log(`[MoySklad] Incoming payment created successfully. Payment ID: ${paymentIn.id}`);
        return paymentIn;
    } catch (error) {
        console.error('[MoySklad] Failed to create Incoming Payment in MS:', error.message);
        return null;
    }
}

module.exports = {
    createMsCustomerOrder,
    updateMsOrderStatus,
    getMsStockBySku,
    getMsStores,
    getMsStockByStore,
    createMsPaymentIn
};


