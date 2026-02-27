import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, TrendingUp, X } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

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
                    phone: o.customer_phone,
                    paymentMethod: o.payment_method,
                    items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json,
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
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        Детали
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl text-white mb-6">Заказ #{selectedOrder.id}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Клиент</p>
                                <p style={{ fontSize: '1.1rem', color: 'white' }}>{selectedOrder.customer}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Телефон</p>
                                <p style={{ fontSize: '1.1rem', color: 'white' }}>{selectedOrder.phone}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Дата и статус</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>{selectedOrder.date}</span>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Способ оплаты</p>
                                <p style={{ fontSize: '1.1rem', color: 'white' }}>{selectedOrder.paymentMethod || 'Не указан'}</p>
                            </div>
                        </div>

                        <h3 className="text-xl text-white mb-4">Состав заказа</h3>
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                selectedOrder.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                                {item.imgUrl && <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: 'white', marginBottom: '4px' }}>{item.name}</p>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{item.brand} | {item.volume} мл</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 'bold', color: 'var(--color-accent-gold)', marginBottom: '4px' }}>{item.price} ₽</p>
                                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>x {item.quantity}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--color-text-muted)' }}>Нет данных о товарах</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                            <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Итого:</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-accent-gold)' }}>{selectedOrder.total.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
