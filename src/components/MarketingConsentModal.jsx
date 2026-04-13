import React from 'react';
import { X } from 'lucide-react';

export default function MarketingConsentModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{ width: '95%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s forwards', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 18, 20, 0.95)' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'white' }}>
                        Согласие на рекламную рассылку
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2.5rem', background: 'var(--color-bg)', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: '1.8' }}>
                    <p style={{ margin: 0 }}>
                        «Согласен на получение рекламных сообщений по электронной почте и СМС на оставленные мною на Сайте номера телефонов, адреса электронных почт, принадлежат мне. В случае прекращения использования указанных каналов связи я обязуюсь уведомить об этом руководство компании, которой принадлежит настоящий сайт. Я согласен с тем, что рекламные сообщения направляются мне до момента моей отписки от их получения посредством нажатия на специальную кнопку «Отписаться от рассылки» / направления письма об отказе получения рассылки на адрес электронной почты компании»
                    </p>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(18, 18, 20, 0.5)', textAlign: 'center' }}>
                    <button 
                        onClick={onClose}
                        className="btn-primary"
                        style={{ padding: '10px 32px', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' }}
                    >
                        Понятно
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
