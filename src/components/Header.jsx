import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Menu, X, MapPin, ChevronDown } from 'lucide-react';
import '../pages/main/MainSite.css';

export default function Header({ favorites, cartItems, setIsFavoritesOpen, setIsCartOpen, pickupPoints = [], selectedStore = null, setSelectedStore = () => {} }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.store-selector-container')) {
                setIsOpen(false);
            }
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [isOpen]);

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <nav>
                    <div className="logo-store-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                            <img className="header-logo" src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '45px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))', transition: 'all 0.3s ease' }} />
                        </div>

                        {/* Store Selector Dropdown */}
                        {pickupPoints.length > 0 && (
                            <div className="store-selector-container" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(255, 255, 255, 0.07)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '20px',
                                        padding: '5px 12px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                    }}
                                    className="store-selector-btn"
                                >
                                    <MapPin size={13} color="var(--color-accent-gold, #fbbf24)" />
                                    <span className="store-selector-text">
                                        {selectedStore ? (selectedStore.address.split(',').slice(1).join(',').trim() || selectedStore.address) : 'Выбрать магазин'}
                                    </span>
                                    <ChevronDown size={13} style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                                </button>

                                {isOpen && (
                                    <div
                                        className="store-dropdown"
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            left: 0,
                                            width: '260px',
                                            background: 'rgba(20, 20, 20, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            WebkitBackdropFilter: 'blur(20px)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '16px',
                                            padding: '8px 0',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            zIndex: 200,
                                        }}
                                    >
                                        <div style={{ padding: '8px 16px 4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                            Выберите магазин
                                        </div>
                                        {pickupPoints.map(store => {
                                            const isSelected = selectedStore && store.id === selectedStore.id;
                                            return (
                                                <button
                                                    key={store.id}
                                                    onClick={() => {
                                                        setSelectedStore(store);
                                                        setIsOpen(false);
                                                    }}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        background: isSelected ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                                                        border: 'none',
                                                        padding: '10px 16px',
                                                        color: isSelected ? 'var(--color-accent-gold, #fbbf24)' : 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: isSelected ? 600 : 400,
                                                    }}
                                                    onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                                                    onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                                                            {store.address}
                                                        </span>
                                                        {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-gold, #fbbf24)', flexShrink: 0 }} />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                        <div className="mobile-menu-header">
                            <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '35px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}>
                                <X size={28} />
                            </button>
                        </div>
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
        .mobile-menu-header {
          display: none;
        }
        .store-selector-text {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .header {
            padding: 10px 3% !important;
          }
          .header.scrolled {
            padding: 8px 3% !important;
          }
          .logo-store-wrapper {
            gap: 0.5rem !important;
          }
          .header-logo {
            height: 32px !important;
          }
          .store-selector-btn {
            padding: 4px 8px !important;
            gap: 4px !important;
            font-size: 0.75rem !important;
          }
          .store-selector-text {
            max-width: 70px;
          }
          .nav-actions {
            gap: 0.6rem !important;
          }
          .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 20px 5%;
            position: absolute;
            top: 0;
            left: 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .nav-links {
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100vh;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            display: flex;
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
        @media (max-width: 380px) {
          .store-selector-text {
            max-width: 50px;
          }
        }
      `}} />
        </>
    );
}
