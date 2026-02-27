import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, LayoutList, MessageSquare, Settings, CreditCard, ShoppingCart, LogOut } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';

// Placeholder components for routing before implementation
const AdminProducts = () => <div className="p-8"><h2 className="text-2xl mb-4 text-white">Товары</h2></div>;
const AdminBrands = () => <div className="p-8"><h2 className="text-2xl mb-4 text-white">Бренды</h2></div>;
const AdminFAQ = () => <div className="p-8"><h2 className="text-2xl mb-4 text-white">Вопросы (FAQ)</h2></div>;
const AdminSettings = () => <div className="p-8"><h2 className="text-2xl mb-4 text-white">Настройки футера</h2></div>;
const AdminPayments = () => <div className="p-8"><h2 className="text-2xl mb-4 text-white">Способы оплаты</h2></div>;

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
