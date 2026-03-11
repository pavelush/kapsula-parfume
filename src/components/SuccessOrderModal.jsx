import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, MapPin, X } from 'lucide-react';

export default function SuccessOrderModal({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        
        const fetchOrder = async () => {
            try {
                // Since there isn't a public GET /api/orders/:id, we can fetch all and filter
                // However, the admin route might not be accessible.
                // For simplicity, we just show a beautiful generic success message with the ID if we can't fetch it,
                // or we can add a public endpoint to get order status by ID.
                const res = await fetch(`/api/order_status/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    // Fallback if endpoint doesn't exist
                    setOrder({ id: orderId });
                }
            } catch (err) {
                console.error("Failed to fetch order", err);
                setOrder({ id: orderId });
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (!orderId) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div 
                style={{
                    background: 'linear-gradient(145deg, rgba(30,30,35,0.95) 0%, rgba(20,20,22,0.95) 100%)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '3rem 2rem',
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(251, 191, 36, 0.1)',
                    animation: 'modalPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        color: 'var(--color-text-muted)', borderRadius: '50%',
                        width: '36px', height: '36px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                    <X size={20} />
                </button>

                <div 
                    style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.5rem',
                        animation: 'pulseGreen 2s infinite'
                    }}
                >
                    <CheckCircle size={48} color="#10b981" style={{ animation: 'scaleIn 0.5s 0.2s both' }} />
                </div>

                <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem', fontWeight: 600 }}>Заказ успешно оплачен!</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Спасибо за покупку. Мы уже начали собирать ваш заказ.
                </p>

                <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={18} /> Номер заказа
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-accent-gold)' }}>#{order?.id || orderId}</span>
                    </div>

                    {!loading && order?.items_json && (
                        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Товары:</span>
                            <div style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '5px' }}>
                                {(() => {
                                    const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
                                    return items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '4px', color: 'white' }}>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                                                {item.name} ({item.volume} мл) x{item.quantity}
                                            </span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                    
                    {order?.delivery_address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {order.delivery_type === 'delivery' ? <Truck size={18} color="var(--color-accent-gold)" style={{ marginTop: '2px', flexShrink: 0 }} /> : <MapPin size={18} color="var(--color-accent-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />}
                            <div style={{ flexGrow: 1 }}>
                                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    {order.delivery_type === 'delivery' ? 'Адрес доставки:' : 'Пункт выдачи:'}
                                </span>
                                <span style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.4, display: 'block' }}>
                                    {order.delivery_address}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={onClose}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px' }}
                >
                    Продолжить покупки
                </button>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes modalPop {
                    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes pulseGreen {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes scaleIn {
                    0% { transform: scale(0); }
                    100% { transform: scale(1); }
                }
            `}} />
        </div>
    );
}
