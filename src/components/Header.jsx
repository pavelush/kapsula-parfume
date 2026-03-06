import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Menu, X } from 'lucide-react';
import '../pages/main/MainSite.css';

export default function Header({ favorites, cartItems, setIsFavoritesOpen, setIsCartOpen }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <nav>
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                        <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '45px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))', transition: 'all 0.3s ease' }} />
                    </div>

                    <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                        <a href="/#catalog" onClick={() => setMobileMenuOpen(false)}>Каталог</a>
                        <a href="/#faq" onClick={() => setMobileMenuOpen(false)}>Вопросы</a>
                        <a href="/#contacts" onClick={() => setMobileMenuOpen(false)}>Контакты</a>
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
                    </div>
                </nav>
            </header>
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
        </>
    );
}
