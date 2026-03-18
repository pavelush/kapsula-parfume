import React from 'react';
import { ChevronRight, Award, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function CertificatesPage() {
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
                        <span style={{ color: 'white' }}>Сертификаты</span>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '4rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                        Гарантия <span className="text-gradient-gold">подлинности</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Мы работаем только с официальными дистрибьюторами и гарантируем 100% аутентичность всей представленной продукции.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', padding: '1rem', borderRadius: '15px' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Стандарты качества</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    Вся продукция соответствует техническому регламенту Таможенного союза "О безопасности парфюмерно-косметической продукции" (ТР ТС 009/2011).
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', padding: '1rem', borderRadius: '15px' }}>
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Официальная декларация</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    Декларация о соответствии ЕАЭС подтверждает безопасность и высокое качество парфюмерии CLIVE CHRISTIAN.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', padding: '1rem', borderRadius: '15px' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Прозрачность</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    Мы предоставляем все необходимые документы по запросу покупателя, подтверждая путь каждого флакона.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ 
                            background: 'white', 
                            padding: '1rem', 
                            borderRadius: '20px', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'zoom-in',
                            overflow: 'hidden'
                        }}>
                            <img 
                                src="/images/certificates/certificate.png" 
                                alt="Декларация о соответствии ЕАЭС" 
                                style={{ width: '100%', borderRadius: '10px', display: 'block' }} 
                            />
                        </div>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Декларация о соответствии: ЕАЭС N RU Д-GB.РА10.В.63668/23
                        </p>
                    </div>
                </div>
                

            </main>

            <Footer />
        </div>
    );
}
