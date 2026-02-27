import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, LayoutList, MessageSquare, Settings, CreditCard, ShoppingCart, LogOut } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';

import AdminProducts from './AdminProducts';
import AdminBrands from './AdminBrands';
import AdminFAQ from './AdminFAQ';
import AdminSettings from './AdminSettings';
import AdminPayments from './AdminPayments';

export default function AdminApp() {
    return (
        <AdminLayout>
            <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/brands" element={<AdminBrands />} />
                <Route path="/faq" element={<AdminFAQ />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/payments" element={<AdminPayments />} />
            </Routes>
        </AdminLayout>
    );
}
