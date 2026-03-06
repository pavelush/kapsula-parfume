import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function FavoritesModal({ isOpen, onClose, favoriteIds, products = [], toggleFavorite, addToCart }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    // Map the favorite IDs to their full product objects
    const favoriteProducts = favoriteIds.map(id => products.find(p => p.id === id)).filter(Boolean);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'flex-end'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    height: '100%',
                    background: 'var(--color-bg-secondary)',
                    borderLeft: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease'
                }}
            >
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Избранное</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {favoriteProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '40px' }}>
                            <p>В избранном пока ничего нет</p>
                            <button onClick={onClose} className="btn-secondary" style={{ marginTop: '20px' }}>
                                В каталог
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {favoriteProducts.map(product => {
                                // Default to smallest volume for add to cart
                                const availableVolumes = [3, 5, 10, 100].filter(vol => product.prices && product.prices[vol] && product.prices[vol].price && String(product.prices[vol].price).trim() !== "");
                                const defaultVolume = availableVolumes.length > 0 ? availableVolumes[0] : 3;
                                const defaultPrice = product.prices[defaultVolume] ? product.prices[defaultVolume].price : '0';

                                return (
                                    <div key={product.id} style={{
                                        display: 'flex',
                                        gap: '15px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        padding: '10px',
                                        borderRadius: '12px'
                                    }}>
                                        <div
                                            style={{ display: 'flex', flex: 1, gap: '15px', cursor: 'pointer' }}
                                            onClick={() => {
                                                onClose();
                                                navigate(`/product/${product.slug || product.id}`);
                                            }}
                                        >
                                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.5)', flexShrink: 0 }}>
                                                <img src={product.imgUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-gold)', textTransform: 'uppercase' }}>{product.brand}</span>
                                                <h4 style={{ fontSize: '1rem', margin: '2px 0 5px 0', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--color-accent-gold)'} onMouseOut={(e) => e.target.style.color = 'white'}>{product.name}</h4>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <button
                                                onClick={() => toggleFavorite(product.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '5px' }}
                                                title="Удалить из избранного"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    addToCart(product, defaultVolume, defaultPrice);
                                                    onClose();
                                                }}
                                                style={{
                                                    background: 'var(--gradient-primary)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                                title="В корзину"
                                            >
                                                <ShoppingBag size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}} />
        </div>
    );
}
