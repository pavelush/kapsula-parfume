import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import './Admin.css';

export default function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                onLogin(data.token);
            } else {
                setError(data.error || 'Ошибка авторизации');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--gradient-glass)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Lock size={32} color="var(--color-accent-gold)" />
                </div>

                <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Админ-панель</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Войдите для управления магазином</p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Логин</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-control"
                            required
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                            required
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'center',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
}
