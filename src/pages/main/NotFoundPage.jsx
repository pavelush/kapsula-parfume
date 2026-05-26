import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function NotFoundPage() {
    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <header style={{ padding: '2rem 5%', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '40px' }} />
                    </Link>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ArrowLeft size={16} /> На главную
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 20px', position: 'relative', overflow: 'hidden' }}>
                {/* Background decorative glowing spheres */}
                <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, rgba(0,0,0,0) 70%)', top: '10%', left: '10%', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(146, 39, 143, 0.08) 0%, rgba(0,0,0,0) 70%)', bottom: '15%', right: '10%', filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none' }} />

                <div 
                    style={{ 
                        maxWidth: '550px', 
                        width: '100%', 
                        textAlign: 'center', 
                        zIndex: 1, 
                        background: 'linear-gradient(145deg, rgba(30,30,35,0.7) 0%, rgba(15,15,18,0.7) 100%)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px',
                        padding: '4rem 2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(10px)',
                        animation: 'fadeInUp 0.8s ease-out'
                    }}
                >
                    <div 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: '90px', 
                            height: '90px', 
                            borderRadius: '50%', 
                            background: 'rgba(251, 191, 36, 0.05)', 
                            border: '1px solid rgba(251, 191, 36, 0.15)',
                            marginBottom: '2rem',
                            color: 'var(--color-accent-gold)',
                            boxShadow: '0 0 30px rgba(251, 191, 36, 0.1)',
                            animation: 'float 3s ease-in-out infinite'
                        }}
                    >
                        <Compass size={40} style={{ animation: 'spin 12s linear infinite' }} />
                    </div>

                    <h1 
                        style={{ 
                            fontSize: '6rem', 
                            fontWeight: 800, 
                            margin: '0 0 1rem 0', 
                            lineHeight: 1,
                            fontFamily: 'Montserrat, sans-serif',
                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.4) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-2px'
                        }}
                    >
                        404
                    </h1>

                    <h2 
                        style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: 700, 
                            color: 'white', 
                            marginBottom: '1rem',
                            fontFamily: 'Montserrat, sans-serif'
                        }}
                    >
                        Страница не найдена
                    </h2>

                    <p 
                        style={{ 
                            color: 'var(--color-text-muted)', 
                            fontSize: '1.05rem', 
                            lineHeight: '1.6', 
                            marginBottom: '2.5rem',
                            padding: '0 1rem'
                        }}
                    >
                        Похоже, этот аромат еще не создан или ссылка устарела. Давайте вернемся к выбору вашего идеального парфюма.
                    </p>

                    <Link 
                        to="/" 
                        className="btn-primary" 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            textDecoration: 'none', 
                            padding: '16px 36px', 
                            fontSize: '1.05rem', 
                            borderRadius: '12px',
                            fontWeight: 600,
                            boxShadow: '0 10px 20px -10px rgba(251, 191, 36, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Вернуться в каталог
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
