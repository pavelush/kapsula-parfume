import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, Heart, Filter, X } from 'lucide-react';

// Mock data based on the real site context and aesthetic requirements
const fragrances = [
    {
        id: 1,
        name: "Bal D'Afrique",
        description: "Парижский авангард и африканская культура в одном флаконе. Теплый и романтичный аромат.",
        brand: "Byredo",
        colorTheme: "rgba(16, 185, 129, 0.15)", // Green theme
        prices: {
            3: { price: "1 500" },
            5: { price: "2 450" },
            10: { price: "4 900" }
        },
        imgUrl: "/images/products/bal-dafrique.png"
    },
    {
        id: 2,
        name: "Pink Molecule 090.09",
        description: "Яркая, искрящаяся интерпретация скандинавских пейзажей через призму розового шампанского.",
        brand: "Zarkoperfume",
        colorTheme: "rgba(236, 72, 153, 0.15)", // Pink theme
        prices: {
            3: { price: "1 200" },
            5: { price: "1 600" },
            10: { price: "3 200" }
        },
        imgUrl: "/images/products/pink-molecule.png"
    },
    {
        id: 3,
        name: "Gentle Fluidity Gold",
        description: "Щедрый, обволакивающий шлейф. В его сердце мускус, кориандр и роскошная ваниль.",
        brand: "Maison Francis Kurkdjian",
        colorTheme: "rgba(251, 191, 36, 0.15)", // Gold/Yellow theme
        prices: {
            3: { price: "3 000" },
            5: { price: "4 700" },
            10: { price: "9 400" }
        },
        imgUrl: "/images/products/gentle-fluidity.png"
    },
    {
        id: 4,
        name: "Blue Talisman",
        description: "Бесконечная свежесть и элегантность, воплощенная в современном звучании груши и бергамота.",
        brand: "Ex Nihilo",
        colorTheme: "rgba(14, 165, 233, 0.15)", // Blue theme
        prices: {
            3: { price: "3 000" },
            5: { price: "5 000" },
            10: { price: "10 000" }
        },
        imgUrl: "/images/products/blue-talisman.png"
    },
    {
        id: 5,
        name: "Guidance",
        description: "Увлекательное путешествие по сказочному лесу, где звучат ноты груши, ладана и лесного ореха.",
        brand: "Amouage",
        colorTheme: "rgba(217, 70, 239, 0.15)", // Purple theme
        prices: {
            3: { price: "2 700" },
            5: { price: "4 500" },
            10: { price: "9 000" }
        },
        imgUrl: "/images/products/guidance.png"
    },
    {
        id: 6,
        name: "Morning Chess",
        description: "Тот самый легендарный аромат от Франсиса Кюркджяна. Слияние жасмина, шафрана и амбры.",
        brand: "Vilhelm Parfumerie",
        colorTheme: "rgba(220, 38, 38, 0.15)", // Red theme
        prices: {
            3: { price: "2 500" },
            5: { price: "4 000" },
            10: { price: "8 000" }
        },
        imgUrl: "/images/products/morning-chess.webp"
    }
];

const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
    const [selectedVolume, setSelectedVolume] = useState(5); // Default 5ml
    const [isHovered, setIsHovered] = useState(false);
    const currentPrice = product.prices[selectedVolume];

    return (
        <div
            className="glass-card"
            style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background glow specific to product theme */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle at center, ${product.colorTheme}, transparent 60%)`,
                opacity: isHovered ? 1 : 0.4,
                transition: 'all 0.5s ease',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Image Area placeholder (Top Half) */}
            <div style={{
                width: '100%',
                height: '220px',
                background: 'rgba(0,0,0,0.2)',
                borderBottom: '1px solid var(--glass-border)',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <button
                    onClick={(e) => { e.preventDefault(); onToggleFavorite(product.id); }}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: isFavorite ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0,0,0,0.4)',
                        border: `1px solid ${isFavorite ? 'rgba(251, 191, 36, 0.5)' : 'var(--glass-border)'}`,
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 2,
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.3s ease',
                        color: isFavorite ? 'var(--color-accent-gold, #fbbf24)' : 'white'
                    }}
                    title={isFavorite ? "Убрать из избранного" : "В избранное"}
                >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <div style={{
                    width: '100%',
                    height: '100%',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <img
                        src={product.imgUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'lighten' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <div style={{ display: 'none', width: '100%', height: '100%', background: `linear-gradient(135deg, transparent, ${product.colorTheme})`, opacity: 0.5, borderRadius: '10px' }}></div>
                </div>
            </div>

            {/* Details Area (Bottom Half) */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, zIndex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--color-accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: 600 }}>{product.brand}</p>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{product.name}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    {/* Volume Selector */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '4px', background: 'rgba(0,0,0,0.4)', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
                        {[3, 5, 10].map(vol => (
                            <button
                                key={vol}
                                onClick={() => setSelectedVolume(vol)}
                                style={{
                                    flex: 1,
                                    padding: '8px 0',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: selectedVolume === vol ? 'var(--gradient-primary)' : 'transparent',
                                    color: selectedVolume === vol ? 'white' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: selectedVolume === vol ? 600 : 400,
                                    transition: 'all 0.3s ease',
                                    boxShadow: selectedVolume === vol ? '0 4px 10px rgba(0,0,0,0.3)' : 'none'
                                }}
                            >
                                {vol} мл
                            </button>
                        ))}
                    </div>

                    {/* Price & Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            {currentPrice.oldPrice && (
                                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginBottom: '-5px' }}>
                                    {currentPrice.oldPrice} ₽
                                </span>
                            )}
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                                {currentPrice.price} ₽
                            </span>
                        </div>
                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                            <ShoppingBag size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CatalogSection({ favorites = [], toggleFavorite = () => { } }) {
    const [selectedBrands, setSelectedBrands] = useState([]);

    // Calculate max price and min price from products based on their minimal variation
    const maxAvailablePrice = Math.max(...fragrances.map(f => Math.max(...Object.values(f.prices).map(p => parseInt(p.price.replace(/[^\d]/g, ''), 10)))));
    const minAvailablePrice = Math.min(...fragrances.map(f => Math.min(...Object.values(f.prices).map(p => parseInt(p.price.replace(/[^\d]/g, ''), 10)))));

    const [maxPrice, setMaxPrice] = useState(maxAvailablePrice);

    const brands = [...new Set(fragrances.map(f => f.brand))].sort();

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const filteredFragrances = fragrances.filter(product => {
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const productMinPrice = Math.min(...Object.values(product.prices).map(p => parseInt(p.price.replace(/[^\d]/g, ''), 10)));
        const matchesPrice = productMinPrice <= maxPrice;

        return matchesBrand && matchesPrice;
    });

    return (
        <section id="catalog" className="section container">
            <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                <h2 className="fade-in-up">Коллекция <span className="text-gradient">Ароматов</span></h2>
                <p className="fade-in-up delay-1" style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    Тщательно отобранная нишевая и селективная парфюмерия. Выберите оптимальный объем для знакомства или постоянного использования.
                </p>
            </div>

            {/* Filters Section */}
            <div className="glass-card fade-in-up delay-2" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 280px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white' }}><Filter size={18} /> Бренды</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {brands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => toggleBrand(brand)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: `1px solid ${selectedBrands.includes(brand) ? 'var(--color-accent-gold)' : 'var(--glass-border)'}`,
                                    background: selectedBrands.includes(brand) ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                                    color: selectedBrands.includes(brand) ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {brand}
                                {selectedBrands.includes(brand) && <X size={12} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: '1 1 280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Цена до:</h4>
                        <span style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>{maxPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        step="100"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                        style={{ width: '100%', accentColor: 'var(--color-accent-gold)', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', outline: 'none', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <span>{minAvailablePrice.toLocaleString('ru-RU')} ₽</span>
                        <span>{maxAvailablePrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2.5rem'
            }}>
                {filteredFragrances.length > 0 ? (
                    filteredFragrances.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isFavorite={favorites.includes(product.id)}
                            onToggleFavorite={toggleFavorite}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Ничего не найдено по вашим фильтрам.</p>
                        <button onClick={() => { setSelectedBrands([]); setMaxPrice(maxAvailablePrice); }} className="btn-secondary" style={{ padding: '10px 24px' }}>Сбросить фильтры</button>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                    Смотреть весь каталог <ChevronDown size={20} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                </button>
            </div>
        </section>
    );
}
