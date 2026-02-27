import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch orders
                const ordersRes = await fetch('/api/orders');
                const ordersData = ordersRes.ok ? await ordersRes.json() : [];

                // Fetch products to count them
                const productsRes = await fetch('/api/products');
                const productsData = productsRes.ok ? await productsRes.json() : [];

                const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_price), 0);

                setStats({
                    totalOrders: ordersData.length,
                    revenue: totalRevenue,
                    totalProducts: productsData.length
                });

                // Format orders for display
                const formattedOrders = ordersData.map(o => ({
                    id: o.id,
                    customer: o.customer_name,
                    total: Number(o.total_price),
                    status: o.status,
                    date: new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
                }));

                setRecentOrders(formattedOrders);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new': return <span className="badge new">Новый</span>;
            case 'processing': return <span className="badge processing">В обработке</span>;
            case 'completed': return <span className="badge completed">Завершен</span>;
            case 'cancelled': return <span className="badge cancelled">Отменен</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    if (loading) return <div className="text-white">Загрузка данных панели...</div>;

    return (
        <div>
            <h2 className="text-2xl text-white mb-6">Сводка</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '15px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', color: 'var(--color-accent-gold)' }}>
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Общая выручка</p>
                        <h3 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>{stats.revenue.toLocaleString('ru-RU')} ₽</h3>
                    </div>
                </div>

                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '15px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', color: 'var(--color-accent-blue)' }}>
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Всего заказов</p>
                        <h3 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>{stats.totalOrders}</h3>
                    </div>
                </div>

                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--color-accent-purple)' }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Активных товаров</p>
                        <h3 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>{stats.totalProducts}</h3>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl text-white mb-4">Последние заказы</h2>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Заказа</th>
                            <th>Клиент</th>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.date}</td>
                                <td style={{ fontWeight: 'bold' }}>{order.total.toLocaleString('ru-RU')} ₽</td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td>
                                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Детали</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
