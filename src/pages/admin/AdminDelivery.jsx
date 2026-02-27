import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, X } from 'lucide-react';

export default function AdminDelivery() {
    const [pickupPointsList, setPickupPointsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialPointState = { id: '', address: '', is_active: true };
    const [currentPoint, setCurrentPoint] = useState(initialPointState);

    useEffect(() => {
        fetchPickupPoints();
    }, []);

    const fetchPickupPoints = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pickup_points');
            if (res.ok) setPickupPointsList(await res.json());
        } catch (error) {
            console.error('Error fetching pickup points:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const method = currentPoint.id ? 'PUT' : 'POST';
            const url = currentPoint.id ? `/api/pickup_points/${currentPoint.id}` : '/api/pickup_points';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPoint)
            });

            if (res.ok) {
                fetchPickupPoints();
                setIsModalOpen(false);
            } else {
                alert('Ошибка при сохранении пункта выдачи');
            }
        } catch (error) {
            console.error('Error saving pickup point:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот пункт выдачи?')) return;
        try {
            const res = await fetch(`/api/pickup_points/${id}`, { method: 'DELETE' });
            if (res.ok) fetchPickupPoints();
            else alert('Ошибка при удалении пункта выдачи');
        } catch (error) { }
    };

    const openEditModal = (point) => {
        setCurrentPoint(point);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setCurrentPoint(initialPointState);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={24} color="var(--color-primary)" /> Самовывоз (Пункты выдачи)
                </h2>
                <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить пункт
                </button>
            </div>

            {loading ? (
                <div className="text-white">Загрузка...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Адрес пункта выдачи</th>
                                <th>Статус</th>
                                <th style={{ textAlign: 'right' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pickupPointsList.length > 0 ? pickupPointsList.map(point => (
                                <tr key={point.id}>
                                    <td style={{ color: 'var(--color-text-muted)' }}>#{point.id}</td>
                                    <td style={{ fontWeight: 500, color: 'white' }}>{point.address}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: point.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: point.is_active ? '#10b981' : '#ef4444'
                                        }}>
                                            {point.is_active ? 'Активен' : 'Неактивен'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => openEditModal(point)} className="admin-action-btn" title="Редактировать">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(point.id)} className="admin-action-btn danger" style={{ marginLeft: '8px' }} title="Удалить">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Пункты выдачи не найдены</td>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 className="text-xl text-white m-0">{currentPoint.id ? 'Редактировать пункт' : 'Новый пункт выдачи'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Полный адрес (например: Москва, ТЦ Авиапарк (1 этаж))</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={currentPoint.address}
                                    onChange={(e) => setCurrentPoint({ ...currentPoint, address: e.target.value })}
                                    required
                                    placeholder="Введите адрес для самовывоза"
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={currentPoint.is_active}
                                    onChange={(e) => setCurrentPoint({ ...currentPoint, is_active: e.target.checked })}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Точка активна и доступна для выбора</label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '8px 24px' }}>Отмена</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
