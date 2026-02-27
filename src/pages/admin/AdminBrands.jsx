import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function AdminBrands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBrand, setCurrentBrand] = useState({ name: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const method = currentBrand.id ? 'PUT' : 'POST';
            const url = currentBrand.id ? `/api/brands/${currentBrand.id}` : '/api/brands';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: currentBrand.name })
            });

            if (res.ok) {
                fetchBrands();
                setIsModalOpen(false);
                setCurrentBrand({ name: '' });
            } else {
                alert('Ошибка при сохранении бренда');
            }
        } catch (error) {
            console.error('Error saving brand:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот бренд?')) return;

        try {
            const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBrands();
            } else {
                alert('Ошибка при удалении бренда');
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
        }
    };

    const openEditModal = (brand) => {
        setCurrentBrand(brand);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setCurrentBrand({ name: '' });
        setIsModalOpen(true);
    };

    const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Управление брендами</h2>
                <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить бренд
                </button>
            </div>

            <div className="admin-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="var(--color-text-muted)" />
                <input
                    type="text"
                    placeholder="Поиск бренда..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1rem' }}
                />
            </div>

            {loading ? (
                <div className="text-white">Загрузка брендов...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Название бренда</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBrands.length > 0 ? filteredBrands.map(brand => (
                                <tr key={brand.id}>
                                    <td>#{brand.id}</td>
                                    <td style={{ fontWeight: 500 }}>{brand.name}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => openEditModal(brand)} className="admin-action-btn" title="Редактировать">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(brand.id)} className="admin-action-btn danger" style={{ marginLeft: '8px' }} title="Удалить">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Бренды не найдены</td>
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
                        <h3 className="text-xl text-white mb-6">{currentBrand.id ? 'Редактировать бренд' : 'Новый бренд'}</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Название бренда</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentBrand.name}
                                    onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
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
