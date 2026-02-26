const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('../kapsula.html', 'utf-8');
const $ = cheerio.load(html);

const products = [];

// Try to find a JSON script block from Tilda first
const scripts = $('script');
let foundJson = false;
scripts.each((_, el) => {
    const content = $(el).html() || '';
    if (content.includes('t_store_data_') || content.includes('products: [') || content.includes('window.tStoreData')) {
        console.log('Found potential JSON store data block');
        // It's usually hard to regex safely, so let's stick to DOM parsing if possible.
    }
});

// Fallback to DOM parsing
$('.js-product').each((i, el) => {
    const $el = $(el);
    const name = $el.find('.js-product-name').text().trim() || $el.find('.t-store__card__title').text().trim();
    const desc = $el.find('.js-product-descr').text().trim() || $el.find('.t-store__card__descr').text().trim();

    // Img logic: could be a basic img tag or a bg image
    let img = $el.find('.js-product-img').attr('src');
    if (!img) {
        img = $el.find('.js-product-img').attr('data-original');
    }
    if (!img) {
        const bgImgStyle = $el.find('.t-bgimg').attr('style') || '';
        const match = bgImgStyle.match(/url\(['"]?(.*?)['"]?\)/);
        if (match) img = match[1];
        else img = $el.find('.t-bgimg').attr('data-original');
    }

    // Tilda stores variants usually in a hidden input or data attributes or spans
    let priceText = $el.find('.js-product-price').first().text().trim();

    products.push({
        name,
        desc,
        img,
        basePrice: priceText,
        brand: name.split(' ')[0] || ''
    });
});

fs.writeFileSync('output.json', JSON.stringify(products, null, 2));
console.log('Saved to output.json. Count:', products.length);
