import React, { useState } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart }) => {
    const availableVolumes = [3, 5, 10, 100].filter(vol => {
        const pData = product.prices && product.prices[vol];
        if (!pData) return false;
        if (!pData.price || String(pData.price).trim() === "") return false;
        if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
            if (Number(pData.stock) <= 0) return false;
        }
        return true;
    });
    const [selectedVolume, setSelectedVolume] = useState(availableVolumes.length > 0 ? availableVolumes[0] : 3);
    const [isHovered, setIsHovered] = useState(false);
    const currentPrice = product.prices[selectedVolume] || { price: "0" };

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
                overflow: 'hidden',
                padding: '20px' // Added padding to prevent clipping when scaling on hover
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
                <Link to={`/product/${product.slug}`} style={{
                    width: '100%',
                    height: '100%',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'block'
                }}>
                    <img
                        src={product.imgUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'lighten' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <div style={{ display: 'none', width: '100%', height: '100%', background: `linear-gradient(135deg, transparent, ${product.colorTheme})`, opacity: 0.5, borderRadius: '10px' }}></div>
                </Link>
            </div>

            {/* Details Area (Bottom Half) */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, zIndex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--color-accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: 600 }}>{product.brand}</p>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3, transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-accent-gold)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>{product.name}</h3>
                    </Link>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    {/* Volume Selector - Hidden for Accessories */}
                    {product.category !== 'Аксессуары' && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '4px', background: 'rgba(0,0,0,0.4)', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
                            {availableVolumes.map(vol => (
                                <button
                                    key={vol}
                                    onClick={() => setSelectedVolume(vol)}
                                    style={{
                                        flex: 1,
                                        maxWidth: 'calc(25% - 6px)',
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
                    )}
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
                        <button
                            className="btn-primary"
                            style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={(e) => { e.preventDefault(); onAddToCart(product, selectedVolume, currentPrice.price); }}
                        >
                            <ShoppingBag size={18} /> В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
