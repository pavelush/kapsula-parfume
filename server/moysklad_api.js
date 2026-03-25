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
                
                positions.push({
                    quantity: parseInt(item.quantity) || 1,
                    price: kopecks,
                    discount: 0,
                    vat: 0,
                    assortment: { meta: itemMeta }
                });
            } else {
                console.warn(`[MoySklad] Warning: Assortment with sku/article ${sku} not found in MS. It won't be added to the order.`);
            }
        }

        const deliveryInfo = order.delivery_type === 'delivery' 
            ? `Доставка: ${order.delivery_address || 'Не указан'}` 
            : `Самовывоз: ${order.delivery_address || 'Не указан'}`;
        
        const description = `Способ оплаты: ${order.payment_method || 'Не указан'}\n${deliveryInfo}\nСоздан на сайте: kapsula-parfume.ru`;

        // Create the MS Order
        // Using local order ID as the name to easily link them
        const msOrderBody = {
            name: String(order.id),
            organization: { meta: orgMeta },
            agent: { meta: agentMeta },
            description: description,
        };

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

module.exports = {
    createMsCustomerOrder,
    updateMsOrderStatus
};
