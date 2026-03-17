import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainSite from './pages/main/MainSite';
import AdminApp from './pages/admin/AdminApp';
import PrivacyPolicyPage from './pages/main/PrivacyPolicyPage';
import OfferPage from './pages/main/OfferPage';
import ProductPage from './pages/main/ProductPage';
import InfoPage from './pages/main/InfoPage';
import Header from './components/Header';
import CartModal from './components/CartModal';
import FavoritesModal from './components/FavoritesModal';
import SuccessOrderModal from './components/SuccessOrderModal';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
  const [successOrderId, setSuccessOrderId] = useState(null);

  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const settingsMap = {};
          data.forEach(item => {
            settingsMap[item.setting_key] = item.setting_value;
          });

          // Set Title
          if (settingsMap.seo_title) {
            document.title = settingsMap.seo_title;
          }

          // Set Description
          if (settingsMap.seo_description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
              metaDescription = document.createElement('meta');
              metaDescription.name = "description";
              document.head.appendChild(metaDescription);
            }
            metaDescription.content = settingsMap.seo_description;
          }

          // Inject Yandex Metrika (or other tracking code)
          if (settingsMap.yandex_metrika_code && !window.metrikaInjected) {
            window.metrikaInjected = true; // Prevent multiple injections

            // We use a safe approach by creating a wrapper div and extracting script tags
            // or simply injecting the raw HTML if it's safe (admin controls it).
            // A more robust way for raw HTML snippets (like counters) is to use Range.createContextualFragment
            const fragment = document.createRange().createContextualFragment(settingsMap.yandex_metrika_code);
            document.head.appendChild(fragment);
          }
        }
      } catch (error) {
        console.error('Failed to load SEO settings:', error);
      }
    };

    fetchSeoSettings();

    // Check for success payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    const successId = urlParams.get('success_order');
    if (successId) {
        setSuccessOrderId(successId);
        // Clean URL to prevent showing modal on reload
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isAdminRoute) return;
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, [isAdminRoute]);

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

  return (
    <>
      {!isAdminRoute && (
        <>
          <Header
            favorites={favorites}
            cartItems={cartItems}
            setIsFavoritesOpen={setIsFavoritesOpen}
            setIsCartOpen={setIsCartOpen}
          />
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
        </>
      )}

      {successOrderId && (
        <SuccessOrderModal 
          orderId={successOrderId} 
          onClose={() => setSuccessOrderId(null)} 
        />
      )}

      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/oferta" element={<OfferPage />} />
        <Route path="/payment" element={<InfoPage />} />
        <Route path="/delivery" element={<InfoPage />} />
        <Route path="/returns" element={<InfoPage />} />
        <Route path="/product/:slug" element={
          <ProductPage
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToCart={addToCart}
            cartItems={cartItems}
            setCartItems={setCartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        } />
        <Route path="/*" element={
          <MainSite
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToCart={addToCart}
            cartItems={cartItems}
            setCartItems={setCartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        } />
      </Routes>
    </>
  );
}

export default App;
