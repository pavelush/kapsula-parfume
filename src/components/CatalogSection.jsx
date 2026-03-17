import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, Heart, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Removed mock data, we fetch it now :)

import ProductCard from './ProductCard';

export default function CatalogSection({ favorites = [], toggleFavorite = () => { }, addToCart = () => { } }) {
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    console.error("Failed to fetch products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);



    const checkHasStock = (product) => {
        return [3, 5, 10, 100].some(vol => {
            const pData = product.prices && product.prices[vol];
            if (!pData) return false;
            if (!pData.price || String(pData.price).trim() === "") return false;
            if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
                return Number(pData.stock) > 0;
            }
            return true;
        });
    };

    const brands = [...new Set(
        products
            .filter(checkHasStock)
            .map(f => f.brand)
    )].sort();

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const filteredFragrances = products.filter(product => {
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const hasStock = checkHasStock(product);
        return matchesBrand && hasStock;
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


            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2.5rem'
            }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem' }}>
                        <p style={{ color: 'var(--color-text-muted)' }}>Загрузка ароматов...</p>
                    </div>
                ) : filteredFragrances.length > 0 ? (
                    filteredFragrances.slice(0, visibleCount).map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isFavorite={favorites.includes(product.id)}
                            onToggleFavorite={toggleFavorite}
                            onAddToCart={addToCart}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Ничего не найдено по вашим фильтрам.</p>
                        <button onClick={() => setSelectedBrands([])} className="btn-secondary" style={{ padding: '10px 24px' }}>Сбросить фильтры</button>
                    </div>
                )}
            </div>

            {visibleCount < filteredFragrances.length && (
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button onClick={() => setVisibleCount(filteredFragrances.length)} className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                        Смотреть весь каталог <ChevronDown size={20} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                    </button>
                </div>
            )}
        </section>
    );
}
