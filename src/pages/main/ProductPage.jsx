import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Heart } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import Footer from '../../components/Footer';

export default function ProductPage({ favorites = [], toggleFavorite = () => { }, addToCart = () => { } }) {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVolume, setSelectedVolume] = useState(null);
    const [availableVolumes, setAvailableVolumes] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Fetch all products and find by slug
                // Note: since we don't have a GET /api/products/:slug endpoint yet, we fetch all and filter
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    const found = data.find(p => p.slug === slug);
                    if (found) {
                        setProduct(found);
                        document.title = found.seoTitle || `${found.name} - ${found.brand}`;
                        let metaDesc = document.querySelector('meta[name="description"]');
                        if (!metaDesc) {
                            metaDesc = document.createElement('meta');
                            metaDesc.name = 'description';
                            document.head.appendChild(metaDesc);
                        }
                        metaDesc.content = found.seoDescription || found.description;

                        const checkVolValid = (vol) => {
                            const pData = found.prices && found.prices[vol];
                            if (!pData) return false;
                            if (!pData.price || String(pData.price).trim() === "") return false;
                            return true;
                        };

                        const vols = found.category === 'Аксессуары'
                            ? ['1'].filter(checkVolValid)
                            : [3, 5, 10, 100].filter(checkVolValid);

                        setAvailableVolumes(vols);

                        // Select the first IN STOCK volume if possible, otherwise just the first available
                        const checkStock = (v) => {
                            const pd = found.prices && found.prices[v];
                            if (pd && pd.stock !== undefined && pd.stock !== null && pd.stock !== "") {
                                return Number(pd.stock) > 0;
                            }
                            return true;
                        };

                        if (vols.length > 0) {
                            const firstInStock = vols.find(v => checkStock(v));
                            setSelectedVolume(firstInStock || vols[0]);
                        } else if (found.category === 'Аксессуары') {
                            setSelectedVolume('1');
                        }

                        const sameBrand = data.filter(p => {
                            if (p.brand !== found.brand || p.id === found.id) return false;

                            // Reusable stock check logic
                            const checkHasStock = (product) => {
                                const volsToCheck = product.category === 'Аксессуары' ? ['1'] : [3, 5, 10, 100];
                                return volsToCheck.some(vol => {
                                    const pData = product.prices && product.prices[vol];
                                    if (!pData) return false;
                                    if (!pData.price || String(pData.price).trim() === "") return false;
                                    if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
                                        return Number(pData.stock) > 0;
                                    }
                                    return true;
                                });
                            };

                            return checkHasStock(p);
                        });
                        const shuffled = sameBrand.sort(() => 0.5 - Math.random());
                        setRecommendedProducts(shuffled.slice(0, 3));
                    } else {
                        navigate('/'); // redirect if not found
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Загрузка...</p>
            </div>
        );
    }

    if (!product) return null;

    const currentPrice = product.prices[selectedVolume] || { price: "0" };
    const isFavorite = favorites.includes(product.id);

    // Helper to check if a specific volume is in stock
    const isVolumeInStock = (vol) => {
        const pData = product.prices && product.prices[vol];
        if (!pData) return false;
        if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
            return Number(pData.stock) > 0;
        }
        return true;
    };

    const isCurrentVolumeInStock = isVolumeInStock(selectedVolume);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
            <div className="container" style={{ flexGrow: 1, paddingBottom: '4rem', paddingLeft: '5%', paddingRight: '5%' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        fontSize: '1rem',
                        padding: 0
                    }}
                >
                    <ChevronLeft size={20} /> Назад
                </button>

                <div className="product-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem', alignItems: 'start' }}>

                    {/* Image Section */}
                    <div className="product-image-container" style={{ position: 'relative', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            background: `radial-gradient(circle at center, ${product.colorTheme || 'var(--color-primary)'}, transparent 70%)`,
                            opacity: 0.3,
                            pointerEvents: 'none',
                            zIndex: 0
                        }} />
                        <button
                            onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: isFavorite ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0,0,0,0.4)',
                                border: `1px solid ${isFavorite ? 'rgba(251, 191, 36, 0.5)' : 'var(--glass-border)'}`,
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
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
                            <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <img
                            src={product.imgUrl}
                            alt={product.name}
                            className="product-image"
                            style={{ width: '100%', maxWidth: '400px', height: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1, mixBlendMode: 'lighten' }}
                        />
                    </div>

                    {/* Details Section */}
                    <div className="product-details-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <p style={{ color: 'var(--color-accent-gold)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', fontWeight: 600 }}>
                                {product.brand}
                            </p>
                            <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
                                {product.name}
                            </h1>
                        </div>

                        <div className="product-description-container" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Описание</h3>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                                {product.fullDescription || "Полное описание скоро появится"}
                            </p>
                        </div>

                        {product.fsa_link && (
                            <div style={{
                                background: '#f352df2b',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                border: '1px solid var(--glass-border)',
                                marginTop: '-1rem'
                            }}>
                                <img
                                    src="/images/logo-fsa.png"
                                    alt="ФСА Логотип"
                                    style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }}
                                />
                                <div style={{ fontSize: '0.85rem', color: '#ffffffff', lineHeight: 1.4 }}>
                                    <strong style={{ display: 'block', marginBottom: '2px', color: '#ffffffff' }}>Безопасен</strong>
                                    Это подтверждено документами из{' '}
                                    <a
                                        href={product.fsa_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#5d9eff', textDecoration: 'none' }}
                                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        реестра Росаккредитации
                                    </a>
                                </div>
                            </div>
                        )}

                        {product.category !== 'Аксессуары' && (
                            <div>
                                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Выберите объем</h3>
                                <div className="product-volumes-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {availableVolumes.map(vol => {
                                        const inStock = isVolumeInStock(vol);
                                        const isSelected = selectedVolume === vol;

                                        let bg = 'rgba(0,0,0,0.3)';
                                        if (isSelected) {
                                            bg = inStock ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)';
                                        }

                                        let textColor = 'var(--color-text-muted)';
                                        if (isSelected) {
                                            textColor = 'white';
                                        } else if (!inStock) {
                                            textColor = 'rgba(255,255,255,0.4)';
                                        }

                                        let border = '1px solid var(--glass-border)';
                                        if (isSelected) {
                                            border = inStock ? 'none' : '1px solid rgba(255,255,255,0.3)';
                                        }

                                        return (
                                            <button
                                                key={vol}
                                                onClick={() => setSelectedVolume(vol)}
                                                className="volume-button"
                                                style={{
                                                    padding: '10px 16px',
                                                    borderRadius: '30px',
                                                    border: border,
                                                    background: bg,
                                                    color: textColor,
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: isSelected && inStock ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                                                    opacity: inStock ? 1 : 0.6,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '80px'
                                                }}
                                            >
                                                <span>{vol} мл</span>
                                                {!inStock && (
                                                    <span style={{
                                                        display: 'block',
                                                        fontSize: '0.65rem',
                                                        color: isSelected ? '#ff8888' : '#ff4444',
                                                        marginTop: '4px',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        Нет в наличии
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="product-action-container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div>
                                {currentPrice.oldPrice && (
                                    <span style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginBottom: '-5px' }}>
                                        {currentPrice.oldPrice} ₽
                                    </span>
                                )}
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>
                                    {currentPrice.price} ₽
                                </span>
                            </div>

                            {isCurrentVolumeInStock ? (
                                <button
                                    className="btn-primary"
                                    style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, justifyContent: 'center' }}
                                    onClick={() => addToCart(product, selectedVolume, currentPrice.price)}
                                >
                                    <ShoppingBag size={20} />
                                    В корзину
                                </button>
                            ) : (
                                <button
                                    style={{
                                        padding: '16px 32px',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexGrow: 1,
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#ff4444',
                                        borderRadius: '30px',
                                        cursor: 'not-allowed',
                                        fontWeight: 600
                                    }}
                                    disabled
                                >
                                    Нет в наличии
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {recommendedProducts.length > 0 && (
                <div style={{ padding: '4rem 5%', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '2rem', textAlign: 'center' }}>Больше от {product.brand}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                        {recommendedProducts.map(p => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                isFavorite={favorites.includes(p.id)}
                                onToggleFavorite={toggleFavorite}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                </div>
            )}

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .product-page-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                    .product-page-grid h1 {
                        font-size: 1.75rem !important;
                    }
                    .product-image-container {
                        padding: 1.5rem !important;
                        border-radius: 20px !important;
                    }
                    .product-image {
                        max-width: 280px !important;
                    }
                    .product-details-container {
                        gap: 1.5rem !important;
                    }
                    .product-description-container {
                        padding: 1rem !important;
                    }
                    .product-volumes-container {
                        gap: 0.5rem !important;
                    }
                    .volume-button {
                        padding: 10px 18px !important;
                        font-size: 0.95rem !important;
                    }
                    .product-action-container {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 1.5rem !important;
                        text-align: center;
                    }
                    .product-action-container button {
                        width: 100% !important;
                    }
                }
            `}} />
        </div>
    );
}
