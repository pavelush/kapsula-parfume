import React, { useEffect } from 'react';
import { ChevronRight, CreditCard, Truck, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function InfoPage() {
    const { pathname } = useLocation();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)', scrollBehavior: 'smooth' }}>
            <header style={{ padding: '2rem 5%', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '40px' }} />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Главная</Link>
                        <ChevronRight size={14} />
                        <span style={{ color: 'white' }}>Информация</span>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '4rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
                
                <section id="payment" style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--gradient-primary)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                            <CreditCard size={32} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Способы <span className="text-gradient-gold">оплаты</span></h2>
                    </div>
                    
                    <div className="glass-card" style={{ padding: '2.5rem', lineHeight: '1.8', borderRadius: '24px' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>
                            Оплата заказов в нашем интернет-магазине производится исключительно в безналичном порядке через платежный сервис <strong>ЮKassa</strong>.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '12px' }}>
                                <div style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>•</div>
                                <div><strong>Банковские карты:</strong> Мы принимаем карты МИР, Visa и Mastercard любого банка РФ.</div>
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '12px' }}>
                                <div style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>•</div>
                                <div><strong>SberPay / СБП:</strong> Быстрая оплата через приложения банков.</div>
                            </li>
                        </ul>
                        <p style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,191,36,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--color-accent-gold)', fontSize: '0.95rem' }}>
                            После успешной оплаты на ваш электронный адрес будет отправлен фискальный чек, подтверждающий совершение покупки.
                        </p>
                    </div>
                </section>

                <section id="delivery" style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--gradient-primary)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                            <Truck size={32} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Условия <span className="text-gradient-gold">доставки</span></h2>
                    </div>
                    
                    <div className="glass-card" style={{ padding: '2.5rem', lineHeight: '1.8', borderRadius: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>По всей России</h4>
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    Доставка осуществляется транспортной компанией <strong>СДЭК</strong> до пункта выдачи или курьером до двери. Стоимость рассчитывается автоматически при оформлении заказа.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Москва и МО</h4>
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    Доступна экспресс-доставка курьером в течение 24 часов после подтверждения заказа.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Самовывоз</h4>
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    Вы всегда можете забрать свой заказ в наших фирменных точках в ТЦ «Авиапарк» или ТЦ «Метрополис» бесплатно.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="returns" style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--gradient-primary)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                            <RefreshCw size={32} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Обмен и <span className="text-gradient-gold">возврат</span></h2>
                    </div>
                    
                    <div className="glass-card" style={{ padding: '2.5rem', lineHeight: '1.8', borderRadius: '24px' }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Согласно Постановлению Правительства РФ №2463 от 31.12.2020, <strong>парфюмерно-косметические товары надлежащего качества возврату и обмену не подлежат</strong>.
                        </p>
                        <h4 style={{ color: 'white', marginBottom: '1rem' }}>В каких случаях возможен возврат?</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '12px' }}>
                                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>!</div>
                                <div>Обнаружен производственный брак или повреждение упаковки при транспортировке.</div>
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '12px' }}>
                                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>!</div>
                                <div>Доставлен товар, не соответствующий заказу.</div>
                            </li>
                        </ul>
                        <p style={{ marginTop: '2rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                            При возникновении спорных ситуаций, пожалуйста, свяжитесь с нами по телефону +7 (916) 203-54-94 или напишите на capsulap@yandex.ru. Мы всегда идем навстречу нашим клиентам.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
