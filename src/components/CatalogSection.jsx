import React, { useState } from 'react';
import { ShoppingBag, ChevronDown } from 'lucide-react';

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
        imgUrl: "https://static.tildacdn.com/stor3963-3565-4835-a438-373161353930/e9cdaaa2ce3d4a655b7e62f75c637d08.png"
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
        imgUrl: "https://static.tildacdn.com/stor6631-3537-4664-b830-663065616131/c05a4b6ed5466ccb83903995491d427e.png"
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
        imgUrl: "https://static.tildacdn.com/stor3966-6238-4362-b830-303966653166/c864343337355786b4b263b5c0c48999.png"
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
        imgUrl: "https://static.tildacdn.com/stor6231-3866-4963-b662-666563336638/049801f9f6dfd028ad36404b504f0221.png"
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
        imgUrl: "https://static.tildacdn.com/stor3830-3435-4634-b538-313831653565/0d23fce2320c4054f2fa01249a8fd4d8.png"
    },
    {
        id: 6,
        name: "Baccarat Rouge 540",
        description: "Тот самый легендарный аромат от Франсиса Кюркджяна. Слияние жасмина, шафрана и амбры.",
        brand: "Maison Francis Kurkdjian",
        colorTheme: "rgba(220, 38, 38, 0.15)", // Red theme
        prices: {
            3: { price: "2 500" },
            5: { price: "4 000" },
            10: { price: "8 000" }
        },
        imgUrl: "https://static.tildacdn.com/stor6662-6238-4234-b235-373262333633/c8ce4ad533f8e5837ff2ce3462f8373b.png"
    }
];

const ProductCard = ({ product }) => {
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

export default function CatalogSection() {
    return (
        <section id="catalog" className="section container">
            <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
                <h2 className="fade-in-up">Коллекция <span className="text-gradient">Ароматов</span></h2>
                <p className="fade-in-up delay-1" style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    Тщательно отобранная нишевая и селективная парфюмерия. Выберите оптимальный объем для знакомства или постоянного использования.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2.5rem'
            }}>
                {fragrances.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                    Смотреть весь каталог <ChevronDown size={20} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                </button>
            </div>
        </section>
    );
}
