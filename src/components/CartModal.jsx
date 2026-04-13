import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import OfferModal from './OfferModal';

export default function CartModal({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, clearCart, products = [] }) {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [pickupPoints, setPickupPoints] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        paymentMethod: '',
        deliveryType: 'pickup',
        deliveryAddress: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [isConsentGiven, setIsConsentGiven] = useState(false);
    const [isOfferConsentGiven, setIsOfferConsentGiven] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPayments();
            fetchPickupPoints();
        }
    }, [isOpen]);

    const fetchPickupPoints = async () => {
        try {
            const res = await fetch('/api/pickup_points');
            if (res.ok) {
                const data = await res.json();
                const active = data.filter(p => p.is_active);
                setPickupPoints(active);
                if (active.length > 0 && formData.deliveryType === 'pickup' && !formData.deliveryAddress) {
                    setFormData(prev => ({ ...prev, deliveryAddress: active[0].address }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch pickup points', error);
        }
    };

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

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const numbers = value.replace(/\D/g, ''); // Extract only digits
        
        if (!numbers) {
            setFormData({ ...formData, phone: '' });
            return;
        }

        let formatted = '+7';
        // If the user starts typing '9' (which is common in Russia)
        let rest = numbers;
        if (numbers[0] === '7' || numbers[0] === '8') {
            rest = numbers.substring(1);
        }
        
        if (rest.length > 0) {
            formatted += ' (' + rest.substring(0, 3);
        }
        if (rest.length >= 4) {
            formatted += ') ' + rest.substring(3, 6);
        }
        if (rest.length >= 7) {
            formatted += '-' + rest.substring(6, 8);
        }
        if (rest.length >= 9) {
            formatted += '-' + rest.substring(8, 10);
        }
        
        setFormData({ ...formData, phone: formatted });
    };

    const enrichedCartItems = cartItems.map(item => {
        if (products.length === 0) return { ...item, isOutOfStock: false, livePrice: item.price, maxStock: null };
        
        const liveProduct = products.find(p => p.id === item.id);
        let isOutOfStock = false;
        let livePrice = item.price;
        let maxStock = null;

        if (!liveProduct) {
            isOutOfStock = true;
        } else {
            const pData = liveProduct.prices && liveProduct.prices[item.volume];
            if (pData) {
                if (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") {
                    maxStock = Number(pData.stock);
                    if (maxStock <= 0) isOutOfStock = true;
                }
                if (pData.price) livePrice = pData.price;
            } else {
                isOutOfStock = true;
            }
        }
        return { ...item, isOutOfStock, livePrice, maxStock };
    });

    const hasOutOfStock = enrichedCartItems.some(item => item.isOutOfStock);
    const hasExceededStock = enrichedCartItems.some(item => item.maxStock !== null && item.quantity > item.maxStock);
    const isSubmitDisabled = cartItems.length === 0 || hasOutOfStock || hasExceededStock;

    const totalAmount = enrichedCartItems.reduce((acc, item) => {
        if (item.isOutOfStock) return acc;
        // Parse "1 500" or "1.300" format to integer
        const priceStr = String(item.livePrice || '0').replace(/[^\d]/g, '');
        const price = parseInt(priceStr, 10) || 0;
        return acc + (price * item.quantity);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitDisabled) return;

        setIsSubmitting(true);
        try {
            const itemsToSubmit = enrichedCartItems
                .filter(i => !i.isOutOfStock)
                .map(({ isOutOfStock, livePrice, maxStock, ...rest }) => ({ ...rest, price: livePrice }));

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    email: formData.email,
                    items: itemsToSubmit,
                    total_price: totalAmount,
                    payment_method: formData.paymentMethod,
                    delivery_type: formData.deliveryType,
                    delivery_address: formData.deliveryAddress
                })
            });

            if (res.ok) {
                const responseData = await res.json();

                if (responseData.confirmation_url) {
                    clearCart();
                    window.location.href = responseData.confirmation_url;
                    return; // Stop execution to let the browser navigate
                }

                setSuccessMsg('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
                setTimeout(() => {
                    clearCart();
                    onClose();
                    setSuccessMsg('');
                    setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        paymentMethod: paymentMethods[0]?.name || '',
                        deliveryType: 'pickup',
                        deliveryAddress: ''
                    });
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
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={(e) => e.stopPropagation()} className="glass-panel" style={{ width: '100%', maxWidth: '400px', height: '100vh', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s forwards' }}>

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
                            {enrichedCartItems.map((item, index) => {
                                const isPlusDisabled = item.isOutOfStock || (item.maxStock !== null && item.quantity >= item.maxStock);
                                const isExceeded = item.maxStock !== null && item.quantity > item.maxStock;
                                
                                return (
                                    <div key={index} style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', position: 'relative', opacity: item.isOutOfStock ? 0.6 : 1 }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                            {item.imgUrl ? <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: item.isOutOfStock ? 'grayscale(100%)' : 'none' }} /> : null}
                                        </div>
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{item.brand}</div>
                                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-accent-gold)', fontSize: '0.9rem' }}>
                                                <span>{item.category === 'Аксессуары' ? '' : `Объем: ${item.volume} мл`}</span>
                                                {item.isOutOfStock ? (
                                                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Нет в наличии</span>
                                                ) : isExceeded ? (
                                                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Доступно: {item.maxStock}</span>
                                                ) : (
                                                    <span style={{ fontWeight: 'bold' }}>{item.livePrice} ₽</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                                <button disabled={item.isOutOfStock} onClick={() => updateQuantity(index, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: item.isOutOfStock ? 'not-allowed' : 'pointer', opacity: item.isOutOfStock ? 0.5 : 1 }}>-</button>
                                                <span style={{ color: item.isOutOfStock || isExceeded ? '#ef4444' : 'inherit' }}>{item.quantity}</span>
                                                <button disabled={isPlusDisabled} onClick={() => updateQuantity(index, 1, item.maxStock)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: isPlusDisabled ? 'not-allowed' : 'pointer', opacity: isPlusDisabled ? 0.3 : 1 }}>+</button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
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
                                    placeholder="+7 (999) 000-00-00"
                                    required
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Ваш Email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', marginBottom: '1rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: formData.deliveryType === 'pickup' ? 'white' : 'var(--color-text-muted)' }}>
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="pickup"
                                        checked={formData.deliveryType === 'pickup'}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                deliveryType: e.target.value,
                                                deliveryAddress: pickupPoints.length > 0 ? pickupPoints[0].address : ''
                                            });
                                        }}
                                    />
                                    Самовывоз
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: formData.deliveryType === 'delivery' ? 'white' : 'var(--color-text-muted)' }}>
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="delivery"
                                        checked={formData.deliveryType === 'delivery'}
                                        onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value, deliveryAddress: '' })}
                                    />
                                    Доставка
                                </label>
                            </div>

                            {formData.deliveryType === 'delivery' && (
                                <div>
                                    <textarea
                                        placeholder="Адрес доставки (Город, Улица, Дом, Квартира)"
                                        required
                                        rows="2"
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>
                            )}

                            {formData.deliveryType === 'pickup' && (
                                <div>
                                    <select
                                        required
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="" disabled style={{ color: 'black' }}>Выберите пункт выдачи...</option>
                                        {pickupPoints.map(point => (
                                            <option key={point.id} value={point.address} style={{ color: 'black' }}>
                                                {point.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    <input
                                        type="checkbox"
                                        required
                                        checked={isConsentGiven}
                                        onChange={(e) => setIsConsentGiven(e.target.checked)}
                                        style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--color-accent-gold)' }}
                                    />
                                    <span>
                                        Я даю согласие на обработку персональных данных в соответствии с{' '}
                                        <span
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsPrivacyModalOpen(true);
                                            }}
                                            style={{ color: 'var(--color-accent-gold)', textDecoration: 'underline', cursor: 'pointer' }}
                                        >
                                            политикой конфиденциальности
                                        </span>
                                    </span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    <input
                                        type="checkbox"
                                        required
                                        checked={isOfferConsentGiven}
                                        onChange={(e) => setIsOfferConsentGiven(e.target.checked)}
                                        style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--color-accent-gold)' }}
                                    />
                                    <span>
                                        Я согласен с условиями{' '}
                                        <span
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsOfferModalOpen(true);
                                            }}
                                            style={{ color: 'var(--color-accent-gold)', textDecoration: 'underline', cursor: 'pointer' }}
                                        >
                                            публичной оферты
                                        </span>
                                    </span>
                                </label>
                            </div>

                            <button type="submit" className="btn-primary" disabled={isSubmitting || !isConsentGiven || !isOfferConsentGiven || hasOutOfStock} style={{ padding: '14px', width: '100%', marginTop: '10px', opacity: (!isConsentGiven || !isOfferConsentGiven || isSubmitting || hasOutOfStock) ? 0.5 : 1, cursor: (!isConsentGiven || !isOfferConsentGiven || isSubmitting || hasOutOfStock) ? 'not-allowed' : 'pointer' }}>
                                {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
            <OfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} />

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
