import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function CartModal({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, clearCart }) {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', paymentMethod: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPayments();
        }
    }, [isOpen]);

    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/payments');
            if (res.ok) {
                const data = await res.json();
                const active = data.filter(p => p.is_active);
                setPaymentMethods(active);
                if (active.length > 0) {
                    setFormData(prev => ({ ...prev, paymentMethod: active[0].name }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch payment methods', error);
        }
    };

    const totalAmount = cartItems.reduce((acc, item) => {
        // Parse "1 500" format to integer
        const price = parseInt(item.price.replace(/\s+/g, ''), 10) || 0;
        return acc + (price * item.quantity);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    items: cartItems,
                    total_price: totalAmount,
                    payment_method: formData.paymentMethod
                })
            });

            if (res.ok) {
                setSuccessMsg('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
                setTimeout(() => {
                    clearCart();
                    onClose();
                    setSuccessMsg('');
                    setFormData({ name: '', phone: '', paymentMethod: paymentMethods[0]?.name || '' });
                }, 3000);
            } else {
                alert('Ошибка при оформлении заказа');
            }
        } catch (error) {
            console.error('Submit order error', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', height: '100vh', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s forwards' }}>

                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingBag size={24} color="var(--color-accent-gold)" />
                        Корзина
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {successMsg ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#10b981' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                            <h3>{successMsg}</h3>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', paddingTop: '3rem' }}>
                            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>Ваша корзина пуста</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cartItems.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', position: 'relative' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                        {item.imgUrl ? <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{item.brand}</div>
                                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-accent-gold)', fontSize: '0.9rem' }}>
                                            <span>Объем: {item.volume} мл</span>
                                            <span style={{ fontWeight: 'bold' }}>{item.price} ₽</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                            <button onClick={() => updateQuantity(index, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(index, 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!successMsg && cartItems.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(18, 18, 20, 0.9)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                            <span>Итого:</span>
                            <span className="text-gradient-gold">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Ваше имя"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Ваш телефон"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <select
                                    required
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', appearance: 'none' }}
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method.id} value={method.name} style={{ color: 'black' }}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '14px', width: '100%', marginTop: '10px' }}>
                                {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}} />
        </div>
    );
}
