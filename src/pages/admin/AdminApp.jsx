import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, LayoutList, MessageSquare, Settings, CreditCard, ShoppingCart, LogOut } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminDelivery from './AdminDelivery';

import AdminProducts from './AdminProducts';
import AdminBrands from './AdminBrands';
import AdminFAQ from './AdminFAQ';
import AdminSettings from './AdminSettings';
import AdminPayments from './AdminPayments';

export default function AdminApp() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

    React.useEffect(() => {
        const originalFetch = window.fetch;

        // Global fetch interceptor to send credentials and handle 401 Unauthorized
        window.fetch = async (url, options = {}) => {
            options.credentials = options.credentials || 'same-origin';
            try {
                const response = await originalFetch(url, options);
                if (response.status === 401 && url.toString().startsWith('/api/')) {
                    console.warn('[Admin Security] Session expired or invalid token (401). Logging out.');
                    setIsAuthenticated(false);
                }
                return response;
            } catch (err) {
                throw err;
            }
        };

        // Check if session is already active via HttpOnly cookie
        const checkAuth = async () => {
            try {
                const res = await originalFetch('/api/admin/check', { credentials: 'same-origin' });
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout request failed:', err);
        }
        setIsAuthenticated(false);
    };

    if (isCheckingAuth) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg)',
                color: 'white',
                fontSize: '1.2rem'
            }}>
                Загрузка...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return (
        <AdminLayout onLogout={handleLogout}>
            <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/brands" element={<AdminBrands />} />
                <Route path="/delivery" element={<AdminDelivery />} />
                <Route path="/faq" element={<AdminFAQ />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/payments" element={<AdminPayments />} />
            </Routes>
        </AdminLayout>
    );
}
