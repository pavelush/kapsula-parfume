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

                        const vols = [3, 5, 10, 100].filter(vol => {
                            const pData = found.prices && found.prices[vol];
                            if (!pData) return false;
                            if (!pData.price || String(pData.price).trim() === "") return false;
                            if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
                                if (Number(pData.stock) <= 0) return false;
                            }
                            return true;
                        });
                        setAvailableVolumes(vols);
                        if (vols.length > 0) setSelectedVolume(vols[0]);

                        const sameBrand = data.filter(p => p.brand === found.brand && p.id !== found.id);
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
                            background: `radial-gradient(circle at center, ${product.colorTheme}, transparent 70%)`,
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

                        <div>
                            <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Выберите объем</h3>
                            <div className="product-volumes-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {availableVolumes.map(vol => (
                                    <button
                                        key={vol}
                                        onClick={() => setSelectedVolume(vol)}
                                        className="volume-button"
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '30px',
                                            border: selectedVolume === vol ? 'none' : '1px solid var(--glass-border)',
                                            background: selectedVolume === vol ? 'var(--gradient-primary)' : 'rgba(0,0,0,0.3)',
                                            color: selectedVolume === vol ? 'white' : 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: selectedVolume === vol ? 600 : 400,
                                            transition: 'all 0.3s ease',
                                            boxShadow: selectedVolume === vol ? '0 4px 15px rgba(0,0,0,0.3)' : 'none'
                                        }}
                                    >
                                        {vol} мл
                                    </button>
                                ))}
                            </div>
                        </div>

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

                            <button
                                className="btn-primary"
                                style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, justifyContent: 'center' }}
                                onClick={() => addToCart(product, selectedVolume, currentPrice.price)}
                            >
                                <ShoppingBag size={20} />
                                В корзину
                            </button>
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
