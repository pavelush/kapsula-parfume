import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminPayments() {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMethod, setCurrentMethod] = useState({ name: '', is_active: true });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payments');
            if (res.ok) {
                const data = await res.json();
                setMethods(data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const method = currentMethod.id ? 'PUT' : 'POST';
            const url = currentMethod.id ? `/api/payments/${currentMethod.id}` : '/api/payments';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: currentMethod.name,
                    is_active: currentMethod.is_active
                })
            });

            if (res.ok) {
                fetchMethods();
                setIsModalOpen(false);
            } else {
                alert('Ошибка при сохранении способа оплаты');
            }
        } catch (error) {
            console.error('Error saving payment method:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот способ оплаты?')) return;

        try {
            const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMethods();
            } else {
                alert('Ошибка при удалении');
            }
        } catch (error) { }
    };

    const toggleStatus = async (method) => {
        try {
            const res = await fetch(`/api/payments/${method.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...method, is_active: !method.is_active })
            });

            if (res.ok) fetchMethods();
        } catch (error) { }
    };

    const openEditModal = (method) => {
        setCurrentMethod(method);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setCurrentMethod({ name: '', is_active: true });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Способы оплаты</h2>
                <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить способ
                </button>
            </div>

            {loading ? (
                <div className="text-white">Загрузка способов оплаты...</div>
            ) : (
                <div className="admin-table-container" style={{ maxWidth: '800px' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Название способа</th>
                                <th style={{ width: '150px', textAlign: 'center' }}>Статус</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.length > 0 ? methods.map(method => (
                                <tr key={method.id} style={{ opacity: method.is_active ? 1 : 0.5 }}>
                                    <td style={{ fontWeight: 500, fontSize: '1.1rem' }}>{method.name}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => toggleStatus(method)}
                                            style={{
                                                background: method.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: method.is_active ? '#34d399' : 'white',
                                                border: `1px solid ${method.is_active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.2)'}`,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {method.is_active ? 'Активен' : 'Отключен'}
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => openEditModal(method)} className="admin-action-btn" title="Редактировать">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(method.id)} className="admin-action-btn danger" style={{ marginLeft: '8px' }} title="Удалить">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Способы оплаты не найдены</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h3 className="text-xl text-white mb-6">{currentMethod.id ? 'Редактировать способ' : 'Новый способ оплаты'}</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Название способа оплаты</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentMethod.name}
                                    onChange={(e) => setCurrentMethod({ ...currentMethod, name: e.target.value })}
                                    placeholder="Например: СБП, Наличными при получении"
                                    required
                                    autoFocus
                                />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer', marginTop: '1.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={currentMethod.is_active}
                                    onChange={(e) => setCurrentMethod({ ...currentMethod, is_active: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-gold)' }}
                                />
                                Оплата активна на сайте
                            </label>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>Отмена</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
