import React, { useState, useEffect } from 'react';
import CatalogSection from '../../components/CatalogSection';
import FAQSection from '../../components/FAQSection';
import CartModal from '../../components/CartModal';
import FavoritesModal from '../../components/FavoritesModal';
import { ShoppingBag, ChevronRight, Menu, X, Star, Droplets, ShieldCheck, Heart } from 'lucide-react';
import './MainSite.css';

function MainSite() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('kapsula_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load favorites', e);
      return [];
    }
  });
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kapsula_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    contact_phone: '+7 916 203 54 94',
    contact_address: 'Россия, Москва, ТЦ Авиапарк (1 этаж)',
    contact_hours: 'Ежедневно 10:00 - 22:00',
    contact_map_url: 'https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=166160100779',
    social_telegram: 'https://t.me/kapsulaparfum',
    social_instagram: 'https://www.instagram.com/kapsula.parfum',
    social_vk: 'https://vk.ru/kapsula.parfum',
    social_tiktok: 'https://www.tiktok.com/@kapsulaparfum?_r=1&_t=ZS-93gqFKeHXou'
  });

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const addToCart = (product, volume, price) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.volume === volume);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.volume === volume
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, volume, price, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  useEffect(() => {
    try {
      localStorage.setItem('kapsula_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('kapsula_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cartItems]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const map = {};
          data.forEach(item => { map[item.setting_key] = item.setting_value; });
          setSettings(prev => ({ ...prev, ...map }));
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products for favorites modal", error);
      }
    };
    fetchProducts();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* Navigation */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <nav>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '45px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))', transition: 'all 0.3s ease' }} />
          </div>

          <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
            <a href="#catalog" onClick={() => setMobileMenuOpen(false)}>Каталог</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Вопросы</a>
            <a href="#contacts" onClick={() => setMobileMenuOpen(false)}>Контакты</a>
          </div>

          <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-icon" style={{ position: 'relative' }} title="Избранное" onClick={() => setIsFavoritesOpen(true)}>
              <Heart size={20} fill={favorites.length > 0 ? "var(--color-accent-gold, #fbbf24)" : "none"} color={favorites.length > 0 ? "var(--color-accent-gold, #fbbf24)" : "currentColor"} />
              {favorites.length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--gradient-primary)', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {favorites.length}
                </span>
              )}
            </button>
            <button className="btn-icon" style={{ position: 'relative' }} onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--color-accent-blue)', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'none' }}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            <button className="btn-primary" style={{ display: 'none' }}>В корзину</button>
          </div>
        </nav>
      </header>

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

        {/* Features / About Section */}
        <section id="about" className="section" style={{ background: 'rgba(25, 25, 30, 0.4)', position: 'relative' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2>Почему <span className="text-gradient-gold">Kapsula Parfume?</span></h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
              <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div className="btn-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--gradient-glass)', border: '1px solid rgba(251, 191, 36, 0.3)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.1)' }}>
                  <Star size={36} color="var(--color-accent-gold)" />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>100% Оригинал</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Мы дорожим репутацией. Только подлинная селективная и нишевая парфюмерия из проверенных источников.</p>
              </div>

              <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', transform: 'translateY(-15px)' }}>
                <div className="btn-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--gradient-glass)', border: '1px solid rgba(14, 165, 233, 0.3)', boxShadow: '0 0 20px rgba(14, 165, 233, 0.1)' }}>
                  <Droplets size={36} color="var(--color-accent-blue)" />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>Собери гардероб</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Удобные атомайзеры 3, 5, 10 и 100 мл позволяют собрать коллекцию роскошных ароматов без переплат за полноразмерные флаконы.</p>
              </div>

              <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div className="btn-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--gradient-glass)', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)' }}>
                  <ShieldCheck size={36} color="var(--color-accent-purple)" />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>Надежная упаковка</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Стильные стеклянные флаконы с металлическим спреем, которые не протекают и безупречно сохраняют аромат.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section Refactored to Component */}
        <FAQSection />

      </main>

      <footer id="contacts" style={{ background: 'var(--color-bg-secondary)', padding: '5rem 5% 2rem', borderTop: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'var(--gradient-primary)' }}></div>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <div className="logo" style={{ marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
              <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '55px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))', transition: 'all 0.3s ease' }} />
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '300px' }}>
              Расширяй свои парфюмерные горизонты с эксклюзивными отливантами ведущих мировых брендов.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Навигация</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-muted)' }}>
              <a href="#catalog" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChevronRight size={14} /> Каталог</a>
              <a href="#faq" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChevronRight size={14} /> Вопросы и ответы</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Контакты</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-muted)' }}>
              <a href={`tel:${settings.contact_phone.replace(/[^0-9+]/g, '')}`} style={{ fontSize: '1.3rem', color: 'white', fontWeight: 600 }}>{settings.contact_phone}</a>
              <p>{settings.contact_address}</p>
              <p style={{ display: 'inline-block', padding: '5px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.9rem', width: 'fit-content' }}>{settings.contact_hours}</p>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {settings.social_telegram && (
                  <a href={settings.social_telegram} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ width: '40px', height: '40px' }} title="Telegram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.33-.94.49-1.34.48-.44-.01-1.28-.24-1.9-.44-.77-.24-1.38-.37-1.33-.78.03-.21.32-.42.88-.64 3.46-1.5 5.77-2.5 6.94-2.99 3.29-1.37 3.97-1.61 4.41-1.62.1 0 .32.02.46.12.12.09.15.21.16.31-.01.07-.01.12-.02.2z" /></svg>
                  </a>
                )}
                {settings.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ width: '40px', height: '40px' }} title="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.37.89s.67.81.89 1.37c.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.89 1.37s-.81.67-1.37.89c-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41-.56-.22-.96-.48-1.37-.89s-.67-.81-.89-1.37c-.16-.42-.36-1.05-.41-2.22C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.89-1.37s.81-.67 1.37-.89c.42-.16 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.29.06-2.17.26-2.94.56-.79.31-1.46.72-2.13 1.39S.87 3.36.56 4.15C.26 4.92.06 5.8.01 7.1.01 8.38 0 8.79 0 12s.01 3.62.07 4.9c.06 1.29.26 2.17.56 2.94.31.79.72 1.46 1.39 2.13s1.34 1.08 2.13 1.39c.77.3 1.65.5 2.94.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.29-.06 2.17-.26 2.94-.56.79-.31 1.46-.72 2.13-1.39s1.08-1.34 1.39-2.13c.3-.77.5-1.65.56-2.94.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.29-.26-2.17-.56-2.94-.31-.79-.72-1.46-1.39-2.13S20.64.87 19.87.56C19.1.26 18.22.06 16.93.01 15.65.01 15.24 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm5.23-9.5a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z" /></svg>
                  </a>
                )}
                {settings.social_vk && (
                  <a href={settings.social_vk} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ width: '40px', height: '40px' }} title="VKontakte">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.08 2H8.92C3.13 2 2 3.13 2 8.92v6.16C2 20.87 3.13 22 8.92 22h6.16c5.79 0 6.92-1.13 6.92-6.92V8.92C22 3.13 20.87 2 15.08 2Zm2.55 13.56c.49.54 1.01 1.05 1.47 1.62.24.28.45.67.14.99-.24.22-.65.21-.97.21h-2.14c-.6 0-.98-.24-1.33-.7-.41-.56-.83-1.12-1.29-1.65-.25-.28-.53-.33-.84-.14-.42.24-.55.67-.55 1.13v.8c0 .35-.15.54-.51.56-1.46.04-2.81-.33-3.99-1.2-1.39-1.04-2.42-2.4-3.26-3.95-.53-.98-.99-1.99-1.42-3.01-.15-.36-.05-.59.35-.61h2.15c.34 0 .58.15.72.48.51 1.25 1.1 2.45 1.94 3.49.19.24.41.33.68.21.31-.14.41-.42.41-.75v-2.3c0-.42-.14-.64-.52-.75.2-.17.44-.26.7-.26h1.9c.32.06.44.24.44.58v2.79c0 .4.15.54.45.42.27-.11.48-.31.67-.54.67-.85 1.21-1.78 1.65-2.75.14-.3.34-.44.66-.44h2.24c.05 0 .11 0 .16.02.39.09.47.33.31.66-.54.99-1.12 1.96-1.8 2.85-.31.42-.32.68.04 1.08Z" /></svg>
                  </a>
                )}
                {settings.social_tiktok && (
                  <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ width: '40px', height: '40px' }} title="TikTok">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.24-2.42.86-4.99 2.98-6.31 1.4-.89 3.12-1.25 4.75-1.06V11.2c-1.16-.27-2.39-.12-3.47.33-1.07.45-1.95 1.34-2.37 2.4-.41 1.05-.33 2.27.24 3.24.59.99 1.63 1.64 2.79 1.8 1.25.17 2.54-.15 3.55-.88.94-.69 1.53-1.74 1.66-2.9.11-1.04.05-2.09.05-3.13V0h1.76z" /></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Yandex Map Wrap */}
        {settings.contact_map_url && (
          <div className="container" style={{ marginBottom: '3rem', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
            <iframe
              src={settings.contact_map_url}
              width="100%"
              height="400"
              frameBorder="0"
              allowFullScreen={true}
              style={{ position: 'relative', display: 'block' }}
            ></iframe>
          </div>
        )}
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <span>© {new Date().getFullYear()} Kapsula Parfume. Все права защищены.</span>
          <a href="/privacy" style={{ textDecoration: 'none', color: 'var(--color-text-muted)', transition: 'color 0.3s ease' }}>Политика конфиденциальности</a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .nav-links {
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100vh;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            transition: left 0.3s ease;
            z-index: 99;
          }
          .nav-links.mobile-active {
            left: 0;
          }
          .menu-toggle {
            display: block !important;
            }
          }
        }
      `}} />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteIds={favorites}
        products={products}
        toggleFavorite={toggleFavorite}
        addToCart={addToCart}
      />
    </div>
  );
}

export default MainSite;
