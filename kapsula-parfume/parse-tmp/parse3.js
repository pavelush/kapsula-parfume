const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('../kapsula.html', 'utf-8');
const $ = cheerio.load(html);

const products = [];
// Let's print out all class names to see what we're working with
const classCounts = {};
$('*').each((i, el) => {
    const classes = $(el).attr('class');
    if (classes) {
        classes.split(' ').forEach(c => {
            classCounts[c] = (classCounts[c] || 0) + 1;
        });
    }
});

// Find classes that likely represent product titles or cards
const productClasses = Object.keys(classCounts).filter(c => c.includes('prod') || c.includes('card') || c.includes('item'));
console.log('Potential product classes:', productClasses.slice(0, 20));

// Tilda specific
$('.t-store__card, .t-item, .t703__title, .js-product').each((i, el) => {
     const text = $(el).text().trim();
     if(text.length > 5 && text.length < 100) products.push(text);
});

console.log('Found product-like texts:', products.length);
if (products.length > 0) {
    console.log(products.slice(0, 5));
} else {
    // maybe it's completely dynamic JS? Let's check for any script containing data
    let foundData = false;
    $('script').each((i, el) => {
        const text = $(el).html() || '';
        if (text.includes('Tom Ford') || text.includes('Baccarat')) {
            console.log('Found script with product names! Length:', text.length);
            fs.writeFileSync('script_data.js', text);
            foundData = true;
        }
    });
    console.log('Found data in script?', foundData);
}
