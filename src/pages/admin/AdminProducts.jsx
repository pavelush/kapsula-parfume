import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const initialProductState = {
        name: '', description: '', brand: '', colorTheme: 'rgba(251, 191, 36, 0.15)', imgUrl: '',
        price_3: '', price_5: '', price_10: '', price_100: ''
    };
    const [currentProduct, setCurrentProduct] = useState(initialProductState);

    useEffect(() => {
        fetchProducts();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/brands');
            if (res.ok) setBrands(await res.json());
        } catch (err) { }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Format prices back to JSON
        const pricesJson = {
            3: { price: currentProduct.price_3 },
            5: { price: currentProduct.price_5 },
            10: { price: currentProduct.price_10 },
            100: { price: currentProduct.price_100 }
        };

        const payload = {
            name: currentProduct.name,
            description: currentProduct.description,
            brand: currentProduct.brand,
            colorTheme: currentProduct.colorTheme,
            prices: pricesJson,
            imgUrl: currentProduct.imgUrl
        };

        try {
            const method = currentProduct.id ? 'PUT' : 'POST';
            const url = currentProduct.id ? `/api/products/${currentProduct.id}` : '/api/products';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchProducts();
                setIsModalOpen(false);
            } else {
                alert('Ошибка при сохранении товара');
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) fetchProducts();
            else alert('Ошибка при удалении товара');
        } catch (error) { }
    };

    const openEditModal = (product) => {
        setCurrentProduct({
            ...product,
            price_3: product.prices['3']?.price || '',
            price_5: product.prices['5']?.price || '',
            price_10: product.prices['10']?.price || '',
            price_100: product.prices['100']?.price || '',
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setCurrentProduct(initialProductState);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Управление товарами</h2>
                <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить товар
                </button>
            </div>

            <div className="admin-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="var(--color-text-muted)" />
                <input
                    type="text"
                    placeholder="Поиск по названию или бренду..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1rem' }}
                />
            </div>

            {loading ? (
                <div className="text-white">Загрузка товаров...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Фото</th>
                                <th>Бренд / Название</th>
                                <th>Цены (3 / 5 / 10 / 100 мл)</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {product.imgUrl ? <img src={product.imgUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={20} color="var(--color-text-muted)" />}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{product.brand}</div>
                                        <div style={{ fontWeight: 500, color: 'white' }}>{product.name}</div>
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>
                                        {product.prices['3']?.price || '-'} / {product.prices['5']?.price || '-'} / {product.prices['10']?.price || '-'} / {product.prices['100']?.price || '-'} ₽
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => openEditModal(product)} className="admin-action-btn" title="Редактировать">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="admin-action-btn danger" style={{ marginLeft: '8px' }} title="Удалить">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Товары не найдены</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 className="text-xl text-white m-0">{currentProduct.id ? 'Редактировать товар' : 'Новый товар'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Бренд</label>
                                    <select
                                        className="form-control"
                                        value={currentProduct.brand}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, brand: e.target.value })}
                                        required
                                    >
                                        <option value="">Выберите бренд</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Название парфюма</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.name}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Описание</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={currentProduct.description}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>URL изображения (/images/products/...)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.imgUrl}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, imgUrl: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Цветовая тема (RGBA свечение)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.colorTheme}
                                        placeholder="rgba(251, 191, 36, 0.15)"
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, colorTheme: e.target.value })}
                                    />
                                </div>
                            </div>

                            <h4 style={{ color: 'white', marginBottom: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>Цены</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Цена 3 мл (формат "1 500")</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.price_3}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price_3: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Цена 5 мл</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.price_5}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price_5: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Цена за 10 мл (₽)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={currentProduct.price_10}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price_10: e.target.value })}
                                        placeholder="Например: 1500"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Цена за 100 мл (₽)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={currentProduct.price_100}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price_100: e.target.value })}
                                        placeholder="Например: 10000"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '8px 24px' }}>Отмена</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>Сохранить товар</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
