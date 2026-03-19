import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import './AccessoriesSlider.css';

export default function AccessoriesSlider({ favorites = [], toggleFavorite = () => { }, addToCart = () => { } }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    const accessories = data.filter(p => p.category === 'Аксессуары' && checkHasStock(p));
                    setProducts(accessories);
                }
            } catch (error) {
                console.error("Error fetching Accessories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (loading || products.length === 0 || isPaused) return;

        const interval = setInterval(() => {
            if (sliderRef.current) {
                const { scrollLeft, offsetWidth, scrollWidth } = sliderRef.current;
                // If we are at the end, scroll back to start
                if (scrollLeft + offsetWidth >= scrollWidth - 10) {
                    sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scroll('right');
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [loading, products.length, isPaused]);

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

    const scroll = (direction) => {
        if (sliderRef.current) {
            const containerWidth = sliderRef.current.offsetWidth;
            const scrollAmount = direction === 'left' ? -containerWidth : containerWidth;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading || products.length === 0) {
        return null;
    }

    return (
        <section id="accessories" className="section container" style={{ paddingBottom: '0' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                <h2 className="fade-in-up">Аксессуары <span className="text-gradient">и Дополнения</span></h2>
                <p className="fade-in-up delay-1" style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    Идеальное дополнение к вашему образу.
                </p>
            </div>

            <div
                className="accessories-slider-wrapper fade-in-up delay-2"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <button
                    className="slider-btn left"
                    onClick={() => scroll('left')}
                    aria-label="Previous accessories"
                >
                    <ChevronLeft size={24} />
                </button>

                <div
                    className="accessories-slider-container"
                    ref={sliderRef}
                >
                    {products.map(product => (
                        <div key={product.id} className="accessories-slider-item">
                            <ProductCard
                                product={product}
                                isFavorite={favorites.includes(product.id)}
                                onToggleFavorite={toggleFavorite}
                                onAddToCart={addToCart}
                            />
                        </div>
                    ))}
                </div>

                <button
                    className="slider-btn right"
                    onClick={() => scroll('right')}
                    aria-label="Next accessories"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    );
}
