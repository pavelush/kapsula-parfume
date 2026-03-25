import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, TrendingUp, X } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        totalProducts: 0
    });
    const [allOrders, setAllOrders] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

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

            // We use native Russian strings in the DB now. No normalization needed.
            const normalizeStatus = (statusStr) => statusStr || 'Новый';

            // Format orders for display
            const formattedOrders = ordersData.map(o => ({
                id: o.id,
                customer: o.customer_name,
                phone: o.customer_phone,
                email: o.email,
                paymentMethod: o.payment_method,
                deliveryType: o.delivery_type,
                deliveryAddress: o.delivery_address,
                items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json,
                total: Number(o.total_price),
                status: normalizeStatus(o.status),
                paymentStatus: o.payment_status || 'Не оплачен',
                date: new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
            }));

            setAllOrders(formattedOrders);
            setRecentOrders(formattedOrders);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setRecentOrders(allOrders);
        } else {
            setRecentOrders(allOrders.filter(o => o.status === statusFilter));
        }
    }, [statusFilter, allOrders]);

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот заказ? Это действие необратимо.')) return;
        try {
            const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
            if (res.ok) {
                setAllOrders(prev => prev.filter(o => o.id !== orderId));
                setSelectedOrder(null);
            } else {
                alert('Не удалось удалить заказ');
            }
        } catch (error) {
            console.error('Error deleting order', error);
            alert('Сетевая ошибка при удалении заказа');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                // Update local state
                const updatedOrders = allOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
                setAllOrders(updatedOrders);
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } else {
                alert('Не удалось изменить статус заказа');
            }
        } catch (error) {
            console.error('Status update error', error);
        }
    };

    const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/payment_status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: newPaymentStatus })
            });
            if (res.ok) {
                const updatedOrders = allOrders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o);
                setAllOrders(updatedOrders);
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
                }
            } else {
                alert('Не удалось изменить статус оплаты');
            }
        } catch (error) {
            console.error('Payment status update error', error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Новый': return <span className="badge new" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Новый</span>;
            case 'Подтвержден': return <span className="badge processing" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9' }}>Подтвержден</span>;
            case 'Собран': return <span className="badge processing" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Собран</span>;
            case 'Отправлен': return <span className="badge processing" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Отправлен</span>;
            case 'Отгружен': return <span className="badge processing" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>Отгружен</span>;
            case 'Доставлен': return <span className="badge completed" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>Доставлен</span>;
            case 'Возврат': return <span className="badge cancelled" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Возврат</span>;
            case 'Отменен': return <span className="badge cancelled" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Отменен</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const getPaymentStatusBadge = (status) => {
        switch (status) {
            case 'Оплачен': return <span className="badge completed" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>Оплачен</span>;
            case 'Ожидает оплаты': return <span className="badge processing" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>Ожидает</span>;
            case 'Отменен': return <span className="badge cancelled" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Отменен</span>;
            case 'Ошибка': return <span className="badge cancelled" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Ошибка</span>;
            case 'Не оплачен':
            default: return <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' }}>Не оплачен</span>;
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="text-2xl text-white m-0">Заказы</h2>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {[
                        { id: 'all', label: 'Все' },
                        { id: 'Новый', label: 'Новый' },
                        { id: 'Подтвержден', label: 'Подтвержден' },
                        { id: 'Собран', label: 'Собран' },
                        { id: 'Отправлен', label: 'Отправлен' },
                        { id: 'Отгружен', label: 'Отгружен' },
                        { id: 'Доставлен', label: 'Доставлен' },
                        { id: 'Возврат', label: 'Возврат' },
                        { id: 'Отменен', label: 'Отменен' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setStatusFilter(filter.id)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: statusFilter === filter.id ? 'var(--color-primary)' : 'var(--glass-border)',
                                background: statusFilter === filter.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: statusFilter === filter.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Заказа</th>
                            <th>Клиент</th>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Оплата</th>
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
                                <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
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
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Контакты</p>
                                <p style={{ fontSize: '1.1rem', color: 'white' }}>{selectedOrder.phone}</p>
                                {selectedOrder.email && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{selectedOrder.email}</p>}
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Доставка</p>
                                <p style={{ fontSize: '1.1rem', color: 'white' }}>
                                    {selectedOrder.deliveryType === 'pickup' ? 'Самовывоз' : (selectedOrder.deliveryType === 'delivery' ? 'Курьером/Почтой' : 'Не указана')}
                                </p>
                                {selectedOrder.deliveryAddress && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{selectedOrder.deliveryAddress}</p>}
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Оплата ({selectedOrder.paymentMethod || 'Не указан'})</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                                    <select
                                        value={selectedOrder.paymentStatus}
                                        onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                                        style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        <option value="Не оплачен" style={{ color: 'black' }}>Не оплачен</option>
                                        <option value="Ожидает оплаты" style={{ color: 'black' }}>Ожидает оплаты</option>
                                        <option value="Оплачен" style={{ color: 'black' }}>Оплачен</option>
                                        <option value="Отменен" style={{ color: 'black' }}>Отменен</option>
                                        <option value="Ошибка" style={{ color: 'black' }}>Ошибка</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Дата и статус</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                    <span style={{ color: 'white' }}>{selectedOrder.date}</span>
                                    {getStatusBadge(selectedOrder.status)}
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Изменить статус:</span>
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Новый" style={{ color: 'black' }}>Новый</option>
                                            <option value="Подтвержден" style={{ color: 'black' }}>Подтвержден</option>
                                            <option value="Собран" style={{ color: 'black' }}>Собран</option>
                                            <option value="Отправлен" style={{ color: 'black' }}>Отправлен</option>
                                            <option value="Отгружен" style={{ color: 'black' }}>Отгружен</option>
                                            <option value="Доставлен" style={{ color: 'black' }}>Доставлен</option>
                                            <option value="Возврат" style={{ color: 'black' }}>Возврат</option>
                                            <option value="Отменен" style={{ color: 'black' }}>Отменен</option>
                                        </select>
                                    </div>
                                </div>
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
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                            >
                                <X size={18} /> Удалить заказ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
