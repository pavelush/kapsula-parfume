import React, { useState, useEffect } from 'react';
import CatalogSection from '../../components/CatalogSection';
import FAQSection from '../../components/FAQSection';
import WhyUsSection from '../../components/WhyUsSection';
import Footer from '../../components/Footer';
import { ChevronRight } from 'lucide-react';
import './MainSite.css';

function MainSite({ favorites, toggleFavorite, addToCart, cartItems, setCartItems, isCartOpen, setIsCartOpen }) {
  // Header and Modal states moved to App.jsx
  useEffect(() => {
    // Settings logic moved to individual components, leaving this for potential future main-page specific needs
  }, []);

  return (
    <div className="app-container">


      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="fade-in-up">
              Твой аромат <br />
              <span className="text-gradient">всегда с тобой</span>
            </h1>
            <p className="fade-in-up delay-1">
              Эксклюзивная оригинальная парфюмерия.
              Удобные форматы 3, 5, 10 и 100 мл для тех, кто ценит качество, стиль и возможность меняться.
            </p>
            <div className="hero-actions fade-in-up delay-2">
              <a href="#catalog" className="btn-primary" style={{ textDecoration: 'none' }}>
                Перейти в каталог <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </section>

        {/* Catalog Section Refactored to Component */}
        <CatalogSection favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />

        {/* Features / About Section Refactored to Component */}
        <WhyUsSection />

        {/* FAQ Section Refactored to Component */}
        <FAQSection />

      </main>

      <Footer />


    </div>
  );
}

export default MainSite;
