import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import OfferModal from './OfferModal';
import MarketingConsentModal from './MarketingConsentModal';

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
    const [isMarketingConsentGiven, setIsMarketingConsentGiven] = useState(false);
    const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);

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

    const enrichedCartItems = cartItems.map((item, index) => {
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
                if (pData.price) livePrice = pData.price;
                
                const totalStockVal = (pData.stock !== undefined && pData.stock !== null && pData.stock !== "") ? Number(pData.stock) : null;
                if (totalStockVal !== null) {
                    const sku = pData.sku;
                    const isMlBased = liveProduct.category !== 'Аксессуары';

                    if (isMlBased) {
                        // Calculate how much ml is consumed by OTHER items in the cart of the same SKU
                        let otherUsedMl = 0;
                        cartItems.forEach((otherItem, otherIdx) => {
                            if (otherIdx !== index) {
                                const otherProd = products.find(p => p.id === otherItem.id);
                                if (otherProd) {
                                    const otherPData = otherProd.prices && otherProd.prices[otherItem.volume];
                                    if (otherPData && otherPData.sku === sku) {
                                        otherUsedMl += otherItem.quantity * Number(otherItem.volume);
                                    }
                                }
                            }
                        });
                        const availableMl = totalStockVal - otherUsedMl;
                        maxStock = Math.floor(availableMl / Number(item.volume));
                        if (maxStock <= 0) {
                            isOutOfStock = true;
                        }
                    } else {
                        // Standard item (measured in pieces)
                        let otherUsedPcs = 0;
                        cartItems.forEach((otherItem, otherIdx) => {
                            if (otherIdx !== index && otherItem.id === item.id && otherItem.volume === item.volume) {
                                otherUsedPcs += otherItem.quantity;
                            }
                        });
                        maxStock = totalStockVal - otherUsedPcs;
                        if (maxStock <= 0) {
                            isOutOfStock = true;
                        }
                    }
                }
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
                const errData = await res.json().catch(() => ({}));
                alert(errData.error || 'Ошибка при оформлении заказа');
            }
        } catch (error) {
            console.error('Submit order error', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100dvh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={(e) => e.stopPropagation()} className="glass-panel" style={{ width: '100%', maxWidth: '420px', height: '100dvh', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s forwards' }}>

                {/* Header */}
                <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <ShoppingBag size={22} color="var(--color-accent-gold)" />
                        Корзина
                    </h2>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={24} /></button>
                </div>

                {successMsg ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', color: '#10b981' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'scaleUp 0.3s ease-out' }}>✓</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 500 }}>{successMsg}</h3>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                        <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1rem' }}>Ваша корзина пуста</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Scrollable Content */}
                        <div className="cart-scroll-container" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Cart Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {enrichedCartItems.map((item, index) => {
                                    const isPlusDisabled = item.isOutOfStock || (item.maxStock !== null && item.quantity >= item.maxStock);
                                    const isExceeded = item.maxStock !== null && item.quantity > item.maxStock;
                                    
                                    return (
                                        <div key={index} style={{ display: 'flex', gap: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: '12px', position: 'relative', opacity: item.isOutOfStock ? 0.6 : 1 }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {item.imgUrl ? <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: item.isOutOfStock ? 'grayscale(100%)' : 'none' }} /> : null}
                                            </div>
                                            <div style={{ flexGrow: 1, paddingRight: '20px' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', tracking: '0.05em' }}>{item.brand}</div>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px', color: 'white', lineHeight: '1.3' }}>{item.name}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-accent-gold)', fontSize: '0.85rem' }}>
                                                    <span>{item.category === 'Аксессуары' ? '' : `Объем: ${item.volume} мл`}</span>
                                                    {item.isOutOfStock ? (
                                                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Нет в наличии</span>
                                                    ) : isExceeded ? (
                                                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Доступно: {item.maxStock}</span>
                                                    ) : (
                                                        <span style={{ fontWeight: 600 }}>{item.livePrice} ₽</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                                    <button type="button" disabled={item.isOutOfStock} onClick={() => updateQuantity(index, -1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '4px', cursor: item.isOutOfStock ? 'not-allowed' : 'pointer', opacity: item.isOutOfStock ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>-</button>
                                                    <span style={{ color: item.isOutOfStock || isExceeded ? '#ef4444' : 'white', fontSize: '0.9rem', minWidth: '14px', textAlign: 'center' }}>{item.quantity}</span>
                                                    <button type="button" disabled={isPlusDisabled} onClick={() => updateQuantity(index, 1, item.maxStock)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '4px', cursor: isPlusDisabled ? 'not-allowed' : 'pointer', opacity: isPlusDisabled ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>+</button>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeFromCart(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}><Trash2 size={15} /></button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0 -0.5rem' }} />

                            {/* Checkout Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.2rem 0', color: 'white' }}>Оформление заказа</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Ваше имя"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="tel"
                                            placeholder="+7 (999) 000-00-00"
                                            required
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Ваш Email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', margin: '0.2rem 0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: formData.deliveryType === 'pickup' ? 'white' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                            <input
                                                                  checked={formData.deliveryType === 'pickup'}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        deliveryType: e.target.value,
                                                        deliveryAddress: pickupPoints.length > 0 ? pickupPoints[0].address : ''
                                                    });
                                                }}
                                                style={{ accentColor: 'var(--color-accent-gold)' }}
                                            />
                                            Самовывоз
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: formData.deliveryType === 'delivery' ? 'white' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                            <input
                                                type="radio"
                                                name="deliveryType"
                                                value="delivery"
                                                checked={formData.deliveryType === 'delivery'}
                                                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value, deliveryAddress: '' })}
                                                style={{ accentColor: 'var(--color-accent-gold)' }}
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
                                                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    )}
 
                                    {formData.deliveryType === 'pickup' && (
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                required
                                                value={formData.deliveryAddress}
                                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', appearance: 'none', fontSize: '0.9rem', paddingRight: '30px' }}
                                            >
                                                <option value="" disabled style={{ color: 'black' }}>Выберите пункт выдачи...</option>
                                                {pickupPoints.map(point => (
                                                    <option key={point.id} value={point.address} style={{ color: 'black' }}>
                                                        {point.address}
                                                    </option>
                                                ))}
                                            </select>
                                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid white' }} />
                                        </div>
                                    )}

                                    <div style={{ position: 'relative' }}>
                                        <select
                                            required
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', appearance: 'none', fontSize: '0.9rem', paddingRight: '30px' }}
                                        >
                                            {paymentMethods.map(method => (
                                                <option key={method.id} value={method.name} style={{ color: 'black' }}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid white' }} />
                                    </div>
                                </div>

                                {/* Consent checkboxes */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.4rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>
                                        <input
                                            type="checkbox"
                                            required
                                            checked={isConsentGiven}
                                            onChange={(e) => setIsConsentGiven(e.target.checked)}
                                            style={{ marginTop: '2px', width: '14px', height: '14px', flexShrink: 0, accentColor: 'var(--color-accent-gold)' }}
                                        />
                                        <span>
                                            Даю согласие на обработку персональных данных в соответствии с{' '}
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

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>
                                        <input
                                            type="checkbox"
                                            required
                                            checked={isOfferConsentGiven}
                                            onChange={(e) => setIsOfferConsentGiven(e.target.checked)}
                                            style={{ marginTop: '2px', width: '14px', height: '14px', flexShrink: 0, accentColor: 'var(--color-accent-gold)' }}
                                        />
                                        <span>
                                            Согласен с условиями{' '}
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

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>
                                        <input
                                            type="checkbox"
                                            checked={isMarketingConsentGiven}
                                            onChange={(e) => setIsMarketingConsentGiven(e.target.checked)}
                                            style={{ marginTop: '2px', width: '14px', height: '14px', flexShrink: 0, accentColor: 'var(--color-accent-gold)' }}
                                        />
                                        <span>
                                            Согласен на получение{' '}
                                            <span
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsMarketingModalOpen(true);
                                                }}
                                                style={{ color: 'var(--color-accent-gold)', textDecoration: 'underline', cursor: 'pointer' }}
                                            >
                                                рекламных сообщений
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(18, 18, 20, 0.95)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Итого к оплате:</span>
                                <span className="text-gradient-gold" style={{ fontSize: '1.25rem' }}>{totalAmount.toLocaleString('ru-RU')} ₽</span>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting || !isConsentGiven || !isOfferConsentGiven || hasOutOfStock}
                                style={{
                                    padding: '12px',
                                    width: '100%',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    opacity: (!isConsentGiven || !isOfferConsentGiven || isSubmitting || hasOutOfStock) ? 0.5 : 1,
                                    cursor: (!isConsentGiven || !isOfferConsentGiven || isSubmitting || hasOutOfStock) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
            <OfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} />
            <MarketingConsentModal isOpen={isMarketingModalOpen} onClose={() => setIsMarketingModalOpen(false)} />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .cart-scroll-container::-webkit-scrollbar {
                    width: 4px;
                }
                .cart-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .cart-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
            `}} />
        </div>
    );
}
