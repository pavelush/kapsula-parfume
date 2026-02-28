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

    React.useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('adminToken', token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
    };

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
