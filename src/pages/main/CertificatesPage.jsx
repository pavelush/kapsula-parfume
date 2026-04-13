import React, { useState } from 'react';
import { ChevronRight, Award, ShieldCheck, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function CertificatesPage() {
    const [zoomedImage, setZoomedImage] = useState(null);

    const CERTIFICATES = [
        {
            id: 1,
            image: "/images/certificates/certificate.jpg",
            number: "ЕАЭС N RU Д-GB.РА10.В.63668/23",
            description: "Декларация о соответствии: ЕАЭС N RU Д-GB.РА10.В.63668/23"
        },
        {
            id: 2,
            image: "/images/certificates/certificate_2.jpg",
            number: "ЕАЭС N RU Д-GB.РА09.В.55062/25",
            description: "Декларация о соответствии (Escentric Molecules): ЕАЭС N RU Д-GB.РА09.В.55062/25"
        }
    ];

    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)', scrollBehavior: 'smooth' }}>
            {/* Zoom Modal */}
            {zoomedImage && (
                <div 
                    onClick={() => setZoomedImage(null)}
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        background: 'rgba(0,0,0,0.9)', 
                        backdropFilter: 'blur(10px)',
                        zIndex: 1000, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                        padding: '2rem'
                    }}
                >
                    <button 
                        onClick={() => setZoomedImage(null)}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={zoomedImage} 
                        alt="Декларация о соответствии ЕАЭС" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            borderRadius: '10px',
                            boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                        }} 
                    />
                </div>
            )}

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
                                    Декларация о соответствии ЕАЭС подтверждает безопасность и высокое качество парфюмерии.
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                        {CERTIFICATES.map(cert => (
                            <div key={cert.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                        src={cert.image}
                                        alt={cert.description}
                                        onClick={() => setZoomedImage(cert.image)}
                                        style={{ width: '100%', borderRadius: '10px', display: 'block' }}
                                    />
                                </div>
                                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    {cert.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>


            </main>

            <Footer />
        </div>
    );
}
