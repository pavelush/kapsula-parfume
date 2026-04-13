import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('kapsula_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('kapsula_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '600px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(15px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '20px',
            zIndex: 3000,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.5s ease-out forwards',
            color: 'white'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {!isExpanded ? (
                        <>
                            Мы собираем данные cookie для сервиса веб-аналитики Яндекс.Метрика.{' '}
                            <span 
                                onClick={() => setIsExpanded(true)}
                                style={{ color: 'var(--color-accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Подробнее
                            </span>
                        </>
                    ) : (
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                            Мы используем такие технологии, как файлы cookie для сервиса веб-аналитики
                            Яндекс.Метрика, и обрабатываем персональные данные, такие как IP-адрес или
                            информацию браузера, для персонализации рекламы, которую вы видите. Это
                            помогает нам показывать вам более релевантную рекламу и улучшает вашу работу
                            в интернете. Мы также используем эти данные для измерения результатов или
                            настройки содержания нашего веб-сайта. Поскольку мы ценим вашу
                            конфиденциальность, мы просим вашего разрешения на использование этих
                            технологий. Вы всегда можете изменить или отозвать свое согласие позже в
                            разделе «Политика конфиденциальности».
                        </div>
                    )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={handleAccept}
                        className="btn-primary"
                        style={{ 
                            padding: '8px 24px', 
                            borderRadius: '8px', 
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        Согласен
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 40px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(229, 178, 93, 0.3);
                }
            `}} />
        </div>
    );
}
