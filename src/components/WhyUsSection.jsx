import React from 'react';
import { Star, Droplets, ShieldCheck } from 'lucide-react';

export default function WhyUsSection() {
    return (
        <section id="about" className="section" style={{ background: 'rgba(25, 25, 30, 0.4)', position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2>Почему <span className="text-gradient-gold">Kapsula Parfume?</span></h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                    <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div className="btn-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--gradient-glass)', border: '1px solid rgba(251, 191, 36, 0.3)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.1)' }}>
                            <Star size={36} color="var(--color-accent-gold)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem' }}>100% Оригинал</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Мы дорожим репутацией. Только подлинная селективная и нишевая парфюмерия из проверенных источников.</p>
                    </div>

                    <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', marginTop: '-15px' }}>
                        <div className="btn-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--gradient-glass)', border: '1px solid rgba(14, 165, 233, 0.3)', boxShadow: '0 0 20px rgba(14, 165, 233, 0.1)' }}>
                            <Droplets size={36} color="var(--color-accent-blue)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem' }}>Собери гардероб</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Удобные атомайзеры 3, 5, 10 и 100 мл позволяют собрать коллекцию роскошных ароматов без переплат за полноразмерные флаконы.</p>
                    </div>

                    <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div className="btn-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--gradient-glass)', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)' }}>
                            <ShieldCheck size={36} color="var(--color-accent-purple)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem' }}>Надежная упаковка</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Стильные стеклянные флаконы с металлическим спреем, которые не протекают и безупречно сохраняют аромат.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
