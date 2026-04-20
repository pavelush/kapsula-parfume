import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, X, Check, Eye, EyeOff } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'Золотой', value: 'rgba(251, 191, 36, 0.15)' },
    { name: 'Розовый', value: 'rgba(236, 72, 153, 0.15)' },
    { name: 'Изумрудный', value: 'rgba(16, 185, 129, 0.15)' },
    { name: 'Голубой', value: 'rgba(14, 165, 233, 0.15)' },
    { name: 'Пурпурный', value: 'rgba(217, 70, 239, 0.15)' },
    { name: 'Красный', value: 'rgba(220, 38, 38, 0.15)' },
    { name: 'Оранжевый', value: 'rgba(249, 115, 22, 0.15)' },
    { name: 'Белый/Серебро', value: 'rgba(255, 255, 255, 0.15)' }
];

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('Все');

    const [activeVolumeTab, setActiveVolumeTab] = useState('3');

    // Form state
    const initialProductState = {
        name: '', description: '', fullDescription: '', brand: '', category: 'Парфюмерия', colorTheme: 'rgba(251, 191, 36, 0.15)', imgUrl: '',
        volumes: {
            1: { price: '', sku: '', stock: '' },
            3: { price: '', sku: '', stock: '' },
            5: { price: '', sku: '', stock: '' },
            10: { price: '', sku: '', stock: '' },
            100: { price: '', sku: '', stock: '' }
        },
        is_active: true,
        slug: '', seoTitle: '', seoDescription: '', fsa_link: ''
    };
    const [currentProduct, setCurrentProduct] = useState(initialProductState);

    useEffect(() => {
        fetchProducts();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products?all=true');
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
        const pricesJson = currentProduct.volumes;

        const transliterate = (text) => {
            const ru = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
                'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
                'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
                'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
                'я': 'ya'
            };
            return text.toLowerCase().split('').map(char => ru[char] || char).join('').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        };

        const finalSlug = currentProduct.slug || transliterate(currentProduct.name);
        const finalSeoTitle = currentProduct.seoTitle || `${currentProduct.name} - ${currentProduct.brand}`;
        const finalSeoDescription = currentProduct.seoDescription || currentProduct.description;

        const payload = {
            name: currentProduct.name,
            description: currentProduct.description,
            fullDescription: currentProduct.fullDescription,
            brand: currentProduct.brand,
            category: currentProduct.category,
            colorTheme: currentProduct.colorTheme,
            prices: pricesJson,
            imgUrl: currentProduct.imgUrl,
            is_active: currentProduct.is_active,
            slug: finalSlug,
            seoTitle: finalSeoTitle,
            seoDescription: finalSeoDescription,
            fsa_link: currentProduct.fsa_link
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
            fullDescription: product.fullDescription || '',
            category: product.category || 'Парфюмерия',
            volumes: {
                1: { price: product.prices['1']?.price || '', sku: product.prices['1']?.sku || '', stock: product.prices['1']?.stock ?? '' },
                3: { price: product.prices['3']?.price || '', sku: product.prices['3']?.sku || '', stock: product.prices['3']?.stock ?? '' },
                5: { price: product.prices['5']?.price || '', sku: product.prices['5']?.sku || '', stock: product.prices['5']?.stock ?? '' },
                10: { price: product.prices['10']?.price || '', sku: product.prices['10']?.sku || '', stock: product.prices['10']?.stock ?? '' },
                100: { price: product.prices['100']?.price || '', sku: product.prices['100']?.sku || '', stock: product.prices['100']?.stock ?? '' }
            },
            is_active: product.is_active !== undefined ? product.is_active : true,
            slug: product.slug || '',
            seoTitle: product.seoTitle || '',
            seoDescription: product.seoDescription || '',
            fsa_link: product.fsa_link || ''
        });
        setActiveVolumeTab(product.category === 'Аксессуары' ? '1' : '3');
        setIsModalOpen(true);
    };

    const handleToggleActive = async (product) => {
        const payload = {
            ...product,
            is_active: !product.is_active
        };
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) fetchProducts();
        } catch (error) {
            console.error('Error toggling product status:', error);
        }
    };

    const openAddModal = () => {
        setCurrentProduct(initialProductState);
        setActiveVolumeTab('3');
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p => {
        const searchLower = searchQuery.toLowerCase();
        
        // Check standard fields
        let matchesSearch = p.name.toLowerCase().includes(searchLower) || (p.brand && p.brand.toLowerCase().includes(searchLower));
        
        // Also check if any SKU matches the search
        if (!matchesSearch && p.prices) {
            matchesSearch = Object.values(p.prices).some(
                volData => volData && volData.sku && volData.sku.toLowerCase().includes(searchLower)
            );
        }

        const matchesCategory = activeCategoryFilter === 'Все' || (p.category || 'Парфюмерия') === activeCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentProduct(prev => ({ ...prev, imgUrl: data.url }));
            } else {
                alert('Ошибка при загрузке изображения');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Ошибка при загрузке изображения');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Управление товарами</h2>
                <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить товар
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {['Все', 'Парфюмерия', 'Аксессуары'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                        style={{
                            padding: '8px 16px',
                            background: activeCategoryFilter === cat ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.05)',
                            color: activeCategoryFilter === cat ? 'black' : 'white',
                            border: '1px solid',
                            borderColor: activeCategoryFilter === cat ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: activeCategoryFilter === cat ? '600' : '400'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="admin-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="var(--color-text-muted)" />
                <input
                    type="text"
                    placeholder="Поиск по названию, бренду или SKU..."
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
                                <th>Категория / Бренд / Название</th>
                                <th>Цены</th>
                                <th>Код (SKU)</th>
                                <th>Остатки</th>
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
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{product.category || 'Парфюмерия'} | {product.brand}</div>
                                        <div style={{ fontWeight: 500, color: 'white', opacity: product.is_active ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {product.name}
                                            {!product.is_active && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Скрыт</span>}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>
                                        {product.category === 'Аксессуары' 
                                            ? `${product.prices['1']?.price || '-'} ₽` 
                                            : `${product.prices['3']?.price || '-'} / ${product.prices['5']?.price || '-'} / ${product.prices['10']?.price || '-'} / ${product.prices['100']?.price || '-'} ₽`}
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>
                                        {product.category === 'Аксессуары' 
                                            ? `${product.prices['1']?.sku || '-'}` 
                                            : `${product.prices['3']?.sku || '-'} / ${product.prices['5']?.sku || '-'} / ${product.prices['10']?.sku || '-'} / ${product.prices['100']?.sku || '-'}`}
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>
                                        {product.category === 'Аксессуары' 
                                            ? `${product.prices['1']?.stock || '-'}` 
                                            : `${product.prices['3']?.stock || '-'} / ${product.prices['5']?.stock || '-'} / ${product.prices['10']?.stock || '-'} / ${product.prices['100']?.stock || '-'}`}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleToggleActive(product)} className="admin-action-btn" title={product.is_active ? "Скрыть из каталога" : "Показать в каталоге"} style={{ marginRight: '8px', color: product.is_active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                                            {product.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
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
                            <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={currentProduct.is_active}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, is_active: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-gold)' }}
                                />
                                <label htmlFor="is_active" style={{ marginBottom: 0, cursor: 'pointer', color: 'white' }}>Показывать этот товар в каталоге</label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Категория</label>
                                    <select
                                        className="form-control"
                                        value={currentProduct.category}
                                        onChange={(e) => {
                                            const newCategory = e.target.value;
                                            setCurrentProduct({ ...currentProduct, category: newCategory });
                                            setActiveVolumeTab(newCategory === 'Аксессуары' ? '1' : '3');
                                        }}
                                        required
                                    >
                                        <option value="Парфюмерия">Парфюмерия</option>
                                        <option value="Аксессуары">Аксессуары</option>
                                    </select>
                                </div>
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
                                    <label>Название</label>
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
                                <label>Краткое описание</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={currentProduct.description || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Полное описание</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={currentProduct.fullDescription || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, fullDescription: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Изображение товара (загрузить файл)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control"
                                        style={{ padding: '6px' }}
                                        onChange={handleImageUpload}
                                    />
                                    {currentProduct.imgUrl && (
                                        <div style={{ marginTop: '10px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img src={currentProduct.imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Цветовая тема (свечение)</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                title={color.name}
                                                onClick={() => setCurrentProduct({ ...currentProduct, colorTheme: color.value })}
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    border: currentProduct.colorTheme === color.value ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                                    background: color.value.replace('0.15', '1'), // Solid color for the button
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s ease',
                                                    transform: currentProduct.colorTheme === color.value ? 'scale(1.15)' : 'scale(1)'
                                                }}
                                            >
                                                {currentProduct.colorTheme === color.value && <Check size={16} color="white" />}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.colorTheme}
                                        placeholder="rgba(251, 191, 36, 0.15)"
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, colorTheme: e.target.value })}
                                        style={{ fontSize: '0.8rem', opacity: 0.7 }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Ссылка на реестр Росаккредитации (FSA)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProduct.fsa_link || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, fsa_link: e.target.value })}
                                    placeholder="https://pub.fsa.gov.ru/..."
                                />
                            </div>

                            <h4 style={{ color: 'white', marginBottom: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>SEO настройки</h4>
                            <div className="form-group">
                                <label>URL (slug)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProduct.slug || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value })}
                                    placeholder="nazvanie-tovara (оставьте пустым для автогенерации)"
                                />
                            </div>
                            <div className="form-group">
                                <label>SEO Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProduct.seoTitle || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, seoTitle: e.target.value })}
                                    placeholder="Заголовок для поисковиков (оставьте пустым для автозаполнения)"
                                />
                            </div>
                            <div className="form-group">
                                <label>SEO Description</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={currentProduct.seoDescription || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, seoDescription: e.target.value })}
                                    placeholder="Описание для поисковиков (оставьте пустым для автозаполнения из краткого описания)"
                                />
                            </div>

                            {currentProduct.category !== 'Аксессуары' ? (
                                <>
                                    <h4 style={{ color: 'white', marginBottom: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>Настройка объемов и цен (МойСклад)</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                        {['3', '5', '10', '100'].map(vol => (
                                            <button
                                                key={vol}
                                                type="button"
                                                onClick={() => setActiveVolumeTab(vol)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: activeVolumeTab === vol ? 'var(--color-accent-gold)' : 'transparent',
                                                    color: activeVolumeTab === vol ? 'black' : 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: activeVolumeTab === vol ? '600' : '400',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {vol} мл
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <h4 style={{ color: 'white', marginBottom: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>Настройка цены и остатка (МойСклад)</h4>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Цена (₽)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.volumes[activeVolumeTab].price}
                                        onChange={(e) => setCurrentProduct({
                                            ...currentProduct,
                                            volumes: {
                                                ...currentProduct.volumes,
                                                [activeVolumeTab]: { ...currentProduct.volumes[activeVolumeTab], price: e.target.value }
                                            }
                                        })}
                                        placeholder="Например: 1 500"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Код товара (MS SKU)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.volumes[activeVolumeTab].sku}
                                        onChange={(e) => setCurrentProduct({
                                            ...currentProduct,
                                            volumes: {
                                                ...currentProduct.volumes,
                                                [activeVolumeTab]: { ...currentProduct.volumes[activeVolumeTab], sku: e.target.value }
                                            }
                                        })}
                                        placeholder="Например: ART-123"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Остаток на складе</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={currentProduct.volumes[activeVolumeTab].stock}
                                        onChange={(e) => setCurrentProduct({
                                            ...currentProduct,
                                            volumes: {
                                                ...currentProduct.volumes,
                                                [activeVolumeTab]: { ...currentProduct.volumes[activeVolumeTab], stock: e.target.value }
                                            }
                                        })}
                                        placeholder="Например: 10"
                                    />
                                    <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.4rem', fontSize: '0.75rem' }}>Если остаток 0, кнопка скроется на сайте.</small>
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
