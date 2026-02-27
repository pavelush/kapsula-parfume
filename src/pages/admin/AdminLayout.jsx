import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutList, MessageSquare, Settings, CreditCard, ShoppingCart, Home, MapPin } from 'lucide-react';
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

export default function AdminLayout({ children }) {
    const location = useLocation();

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar glass-card">
                <div className="admin-logo">
                    <img src="/images/logo/logo.png" alt="Kapsula Admin" />
                    <span>Admin Panel</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-bottom-actions">
                    <Link to="/" className="admin-nav-item" style={{ color: 'var(--color-text-muted)' }}>
                        <Home size={20} />
                        <span>На сайт</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Top Header */}
                <header className="admin-header glass-card">
                    <h1 className="text-gradient-gold">Управление магазином Kapsula</h1>
                    <div className="admin-user">
                        <span>С возвращением, Admin!</span>
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
