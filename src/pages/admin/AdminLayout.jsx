import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutList, MessageSquare, Settings, CreditCard, ShoppingCart, Home, MapPin, LogOut } from 'lucide-react';
import './Admin.css';

const navItems = [
    { name: 'Заказы', path: '/admin', icon: ShoppingCart },
    { name: 'Товары', path: '/admin/products', icon: Package },
    { name: 'Бренды', path: '/admin/brands', icon: LayoutList },
    { name: 'Доставка', path: '/admin/delivery', icon: MapPin },
    { name: 'FAQ', path: '/admin/faq', icon: MessageSquare },
    { name: 'Оплата', path: '/admin/payments', icon: CreditCard },
    { name: 'Настройки', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, onLogout }) {
    const location = useLocation();

    return (
        <div className="admin-container">
            {/* Main Content Area */}
            <main className="admin-main">
                {/* Top Header Navigation */}
                <header className="admin-header">
                    <div className="admin-header-left">
                        <div className="admin-logo">
                            <img src="/images/logo/logo.png" alt="Kapsula Admin" />

                        </div>
                    </div>

                    <div className="admin-header-center">
                        <nav className="admin-nav">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`admin-nav-item ${isActive ? 'active' : ''}`}
                                        title={item.name}
                                    >
                                        <Icon size={18} />
                                        <span className="nav-text">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="admin-header-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                            <Home size={18} />
                            <span>На сайт</span>
                        </Link>
                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                            <LogOut size={18} color="#ef4444" />
                            <span>Выйти</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
