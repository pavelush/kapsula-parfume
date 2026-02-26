const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('../kapsula.html', 'utf-8');
const $ = cheerio.load(html);

// 1. Try to find the Tilda JSON payload (it often contains all products clearly)
let productsData = [];

$('script').each((i, el) => {
    const text = $(el).html() || '';
    // Tilda stores products in a variable like tcart_dict or similar, or directly in a script block initialization
    if (text.includes("products: [{") || text.includes("tStoreData") || text.includes('t_store_data')) {
        // Try extracting JSON
        const match = text.match(/products:\s*(\[.*?\])\s*,\s*\n/s) || text.match(/'products':\s*(\[.*?\])/s);
        if (match) {
            try {
                // It's a JS object, not strict JSON, but let's try a loose eval or parse
                // Since this is node, eval is safe enough on our own downloaded file
                const parsed = eval("(" + match[1] + ")");
                productsData = parsed;
            } catch (e) {
                console.log("Failed to eval products array");
            }
        }
    }
});

// Fallback: parse standard Tilda store blocks
if (productsData.length === 0) {
    $('.t-store__card, .t-item').each((i, el) => {
        const $el = $(el);
        const name = $el.find('.js-store-prod-name, .t-store__card__title, .js-product-name').text().trim();
        if (!name) return; // Not a product

        const desc = $el.find('.js-store-prod-descr, .t-store__card__descr, .js-product-descr').text().trim();
        const price = $el.find('.js-product-price, .js-store-prod-price').first().text().trim();

        let img = $el.find('.js-product-img').attr('data-original') || $el.find('.js-product-img').attr('src');
        if (!img) {
            const bgImg = $el.find('.t-bgimg').attr('data-original') || $el.find('.t-bgimg').attr('style');
            if (bgImg && bgImg.includes('url')) {
                const m = bgImg.match(/url\(['"]?(.*?)['"]?\)/);
                if (m) img = m[1];
            } else if (bgImg) {
                img = bgImg;
            }
        }

        // Tilda often uses relative /images or absolute https

        productsData.push({ name, desc, price, img });
    });
}


// 2. Contacts / Socials / Logo
const siteInfo = {
    logo: $('img.t228__imglogo').attr('src') || $('img.js-logo').attr('src'),
    phone: $('a[href^="tel:"]').first().text().trim() || $('a[href^="tel:"]').first().attr('href'),
    email: $('a[href^="mailto:"]').first().text().trim() || $('a[href^="mailto:"]').first().attr('href'),
    socials: []
};

$('a[href*="wa.me"], a[href*="whatsapp"], a[href*="t.me"], a[href*="telegram"], a[href*="instagram.com"], a[href*="vk.com"]').each((i, el) => {
    siteInfo.socials.push($(el).attr('href'));
});
// deduplicate socials
siteInfo.socials = [...new Set(siteInfo.socials)];

fs.writeFileSync('parsed_data.json', JSON.stringify({ products: productsData, siteInfo }, null, 2));
console.log('Saved to parsed_data.json. Products:', productsData.length);
