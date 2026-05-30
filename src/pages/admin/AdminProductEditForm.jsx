import React from 'react';
import { ChevronLeft, ChevronRight, Wand2, RefreshCw, Scissors, Image as ImageIcon, Check, ExternalLink } from 'lucide-react';
import ImageEditorModal from '../../components/ImageEditorModal';

export default function AdminProductEditForm({
    viewMode,
    currentProduct,
    setCurrentProduct,
    setViewMode,
    brands,
    isSavingProduct,
    handleSave,
    fetchMsStock,
    msWarehouseStock,
    loadingMsStock,
    handleAutofill,
    isAutofilling,
    handleAutofillField,
    autofillingFields = {},
    handleImageUpload,
    foundUrls,
    currentUrlIndex,
    handleNextImage,
    isUpdatingImage,
    isImageEditorOpen,
    setIsImageEditorOpen,
    isHoveringImage,
    setIsHoveringImage,
    filteredProducts,
    handlePrevProduct,
    handleNextProduct,
    hasUnsavedChanges,
    activeVolumeTab,
    setActiveVolumeTab,
    PRESET_COLORS,
    saveMessage
}) {
    const currentIndex = viewMode === 'edit' ? filteredProducts.findIndex(p => p.id === currentProduct.id) : -1;
    const totalFiltered = filteredProducts.length;

    const handleBack = () => {
        if (hasUnsavedChanges()) {
            const confirm = window.confirm('У вас есть несохраненные изменения. Вернуться к списку без сохранения?');
            if (!confirm) return;
        }
        setViewMode('list');
    };

    return (
        <div className="admin-edit-container">
            {/* Header */}
            <div className="admin-edit-header">
                <div>
                    <div className="admin-edit-breadcrumbs">
                        <span className="admin-edit-breadcrumbs-link" onClick={handleBack}>Управление товарами</span>
                        <span>/</span>
                        <span>{viewMode === 'edit' ? `${currentProduct.brand} ${currentProduct.name}` : 'Новый товар'}</span>
                    </div>
                    <h2 className="admin-edit-title">
                        {viewMode === 'edit' ? 'Редактирование товара' : 'Добавление нового товара'}
                    </h2>
                </div>

                <div className="admin-edit-actions">
                    {viewMode === 'edit' && totalFiltered > 1 && (
                        <div className="product-nav-controls">
                            <button 
                                type="button" 
                                className="product-nav-btn" 
                                onClick={handlePrevProduct} 
                                disabled={currentIndex <= 0}
                                title="Предыдущий товар"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="product-nav-indicator">
                                {currentIndex + 1} из {totalFiltered}
                            </span>
                            <button 
                                type="button" 
                                className="product-nav-btn" 
                                onClick={handleNextProduct} 
                                disabled={currentIndex === -1 || currentIndex >= totalFiltered - 1}
                                title="Следующий товар"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {saveMessage && (
                        <span style={{ 
                            color: saveMessage.includes('Ошибка') ? '#EF4444' : '#10B981', 
                            fontSize: '0.9rem', 
                            fontWeight: '600', 
                            marginRight: '8px',
                            background: saveMessage.includes('Ошибка') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: saveMessage.includes('Ошибка') ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            animation: 'fadeIn 0.25s ease-out'
                        }}>
                            {saveMessage}
                        </span>
                    )}
                    <button 
                        type="button" 
                        onClick={handleBack} 
                        className="btn-secondary" 
                        style={{ padding: '10px 24px', borderRadius: '8px' }}
                        disabled={isSavingProduct}
                    >
                        Закрыть
                    </button>
                    <button 
                        type="submit" 
                        form="product-form" 
                        className="btn-primary" 
                        style={{ padding: '10px 24px', borderRadius: '8px', opacity: isSavingProduct ? 0.7 : 1 }}
                        disabled={isSavingProduct}
                    >
                        {isSavingProduct ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>

            {/* Main Edit Grid */}
            <form id="product-form" onSubmit={handleSave}>
                <div className="admin-edit-grid">
                    
                    {/* Left Column: Basic Details & SEO & Prices */}
                    <div className="admin-edit-main-card">
                        
                        <h3 className="editor-section-title">Основная информация</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ marginBottom: 0 }}>Название товара</label>
                                {currentProduct.brand && currentProduct.name && (
                                    <button
                                        type="button"
                                        onClick={handleAutofill}
                                        disabled={isAutofilling}
                                        title="Автозаполнение полей товара (Aromo.ru)"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
                                            transition: 'all 0.2s ease',
                                            opacity: isAutofilling ? 0.7 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(124, 58, 237, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(124, 58, 237, 0.3)';
                                        }}
                                    >
                                        <Wand2 size={12} className={isAutofilling ? 'wand-spinner' : ''} />
                                        {isAutofilling ? 'Заполнение...' : 'Автозаполнение'}
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                className="form-control"
                                value={currentProduct.name}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                required
                                placeholder="Например: Bleu de Chanel"
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <label style={{ marginBottom: 0 }}>Краткое описание</label>
                                <button
                                    type="button"
                                    onClick={() => handleAutofillField('description')}
                                    disabled={autofillingFields['description']}
                                    title="Заполнить краткое описание"
                                    className="field-autofill-btn"
                                >
                                    <Wand2 size={13} className={autofillingFields['description'] ? 'wand-spinner' : ''} />
                                </button>
                            </div>
                            <textarea
                                className="form-control"
                                rows="2"
                                value={currentProduct.description || ''}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                placeholder="Краткое описание товара для карточки в каталоге"
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <label style={{ marginBottom: 0 }}>Полное описание</label>
                                <button
                                    type="button"
                                    onClick={() => handleAutofillField('fullDescription')}
                                    disabled={autofillingFields['fullDescription']}
                                    title="Заполнить полное описание"
                                    className="field-autofill-btn"
                                >
                                    <Wand2 size={13} className={autofillingFields['fullDescription'] ? 'wand-spinner' : ''} />
                                </button>
                            </div>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={currentProduct.fullDescription || ''}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, fullDescription: e.target.value })}
                                placeholder="Полное описание парфюма, история бренда, характер аромата"
                            />
                        </div>

                        {currentProduct.category === 'Парфюмерия' && (
                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <label style={{ marginBottom: 0 }}>Пирамида композиции</label>
                                    <button
                                        type="button"
                                        onClick={() => handleAutofillField('compositionPyramid')}
                                        disabled={autofillingFields['compositionPyramid']}
                                        title="Заполнить пирамиду композиции"
                                        className="field-autofill-btn"
                                    >
                                        <Wand2 size={13} className={autofillingFields['compositionPyramid'] ? 'wand-spinner' : ''} />
                                    </button>
                                </div>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={currentProduct.compositionPyramid || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, compositionPyramid: e.target.value })}
                                    placeholder="Верхние ноты: ... Средние ноты: ... Базовые ноты: ..."
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <label style={{ marginBottom: 0 }}>Характеристики</label>
                                <button
                                    type="button"
                                    onClick={() => handleAutofillField('characteristics')}
                                    disabled={autofillingFields['characteristics']}
                                    title="Заполнить характеристики"
                                    className="field-autofill-btn"
                                >
                                    <Wand2 size={13} className={autofillingFields['characteristics'] ? 'wand-spinner' : ''} />
                                </button>
                            </div>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={currentProduct.characteristics || ''}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, characteristics: e.target.value })}
                                placeholder="Год выпуска, страна бренда, стойкость, шлейф"
                            />
                        </div>


                        {/* Prices & Stocks */}
                        <h3 className="editor-section-title" style={{ marginTop: '1.5rem' }}>
                            {currentProduct.category !== 'Аксессуары' ? 'Цены, объемы и МойСклад' : 'Цена и МойСклад'}
                        </h3>
                        
                        {currentProduct.category !== 'Аксессуары' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                                {['3', '5', '10'].map(vol => (
                                    <button
                                        key={vol}
                                        type="button"
                                        onClick={() => setActiveVolumeTab(vol)}
                                        style={{
                                            padding: '8px 20px',
                                            background: activeVolumeTab === vol ? 'var(--color-accent-gold)' : 'transparent',
                                            color: activeVolumeTab === vol ? 'black' : 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: activeVolumeTab === vol ? '600' : '400',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {vol} мл
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Цена (₽)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProduct.volumes[activeVolumeTab]?.price || ''}
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
                                    value={currentProduct.volumes[activeVolumeTab]?.sku || ''}
                                    onChange={(e) => setCurrentProduct({
                                        ...currentProduct,
                                        volumes: {
                                            ...currentProduct.volumes,
                                            [activeVolumeTab]: { ...currentProduct.volumes[activeVolumeTab], sku: e.target.value }
                                        }
                                    })}
                                    onBlur={(e) => fetchMsStock(e.target.value)}
                                    placeholder="Например: ART-123"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Остаток на складе</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={currentProduct.volumes[activeVolumeTab]?.stock ?? ''}
                                    onChange={(e) => setCurrentProduct({
                                        ...currentProduct,
                                        volumes: {
                                            ...currentProduct.volumes,
                                            [activeVolumeTab]: { ...currentProduct.volumes[activeVolumeTab], stock: e.target.value }
                                        }
                                    })}
                                    placeholder="Например: 10"
                                />
                            </div>
                        </div>

                        {currentProduct.volumes[activeVolumeTab]?.sku && (
                            <div style={{ marginTop: '1rem', padding: '1.2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Остатки по складам (МойСклад):</span>
                                    {loadingMsStock && <span style={{ color: 'var(--color-accent-gold)' }}>Загрузка...</span>}
                                </div>
                                {loadingMsStock ? (
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Получение данных из МойСклад...</div>
                                ) : msWarehouseStock && msWarehouseStock.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                        {msWarehouseStock.map((wh) => {
                                            const available = (wh.stock || 0) - (wh.reserve || 0);
                                            return (
                                                <div key={wh.name} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ fontWeight: '500', color: 'white', fontSize: '0.9rem', marginBottom: '2px' }}>{wh.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: available > 0 ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }}>
                                                        Доступно: <strong style={{ color: available > 0 ? '#10B981' : '#EF4444' }}>{available}</strong> 
                                                        <span style={{ opacity: 0.7, marginLeft: '6px' }}>(физ: {wh.stock || 0}, рез: {wh.reserve || 0})</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        Нет данных по складам или товар с кодом "{currentProduct.volumes[activeVolumeTab]?.sku}" не найден в МойСклад.
                                    </div>
                                )}
                            </div>
                        )}



                    </div>

                    {/* Right Column: Widgets */}
                    <div className="admin-edit-side-card">
                        
                        {/* Product Status */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 className="editor-section-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Статус товара</h3>
                                {currentProduct.id && currentProduct.slug && (
                                    <a
                                        href={`/product/${currentProduct.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Открыть товар на сайте"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: 'var(--color-accent-gold)',
                                            fontSize: '0.85rem',
                                            textDecoration: 'none',
                                            transition: 'opacity 0.2s',
                                            cursor: 'pointer',
                                            marginTop: '-4px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <span>На сайт</span>
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={currentProduct.is_active}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, is_active: e.target.checked })}
                                    style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent-gold)', cursor: 'pointer' }}
                                />
                                <label htmlFor="is_active" style={{ marginBottom: 0, cursor: 'pointer', color: 'white', fontWeight: '500', fontSize: '0.95rem' }}>
                                    Показывать на сайте
                                </label>
                            </div>
                        </div>

                        {/* Product Image */}
                        <div>
                            <h3 className="editor-section-title">Изображение</h3>
                            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                {currentProduct.imgUrl ? (
                                    <div 
                                        onMouseEnter={() => setIsHoveringImage(true)}
                                        onMouseLeave={() => setIsHoveringImage(false)}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '180px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '8px'
                                        }}
                                    >
                                        <img src={currentProduct.imgUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                                        
                                        <button
                                            type="button"
                                            onClick={() => setIsImageEditorOpen(true)}
                                            title="Редактировать фото (обрезка, удаление фона)"
                                            style={{
                                                position: 'absolute',
                                                left: '8px',
                                                bottom: '8px',
                                                background: 'rgba(15, 23, 42, 0.85)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#f8fafc',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                                transition: 'all 0.2s ease',
                                                zIndex: 10
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#7c3aed';
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <Scissors size={15} />
                                        </button>

                                        {foundUrls && (foundUrls.length > 1 || (foundUrls.length === 1 && currentUrlIndex === -1)) && (
                                            <button
                                                type="button"
                                                onClick={handleNextImage}
                                                disabled={isUpdatingImage}
                                                title={currentUrlIndex === -1 ? 'Загрузить фото из найденных источников' : `Найти другое фото (вариант ${currentUrlIndex + 1} из ${foundUrls.length})`}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    bottom: '8px',
                                                    background: 'rgba(15, 23, 42, 0.85)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#f8fafc',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                                    transition: 'all 0.2s ease',
                                                    opacity: isUpdatingImage ? 0.6 : 1,
                                                    zIndex: 10
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#7c3aed';
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <RefreshCw size={14} className={isUpdatingImage ? 'image-spinner' : ''} />
                                            </button>
                                        )}

                                        {isHoveringImage && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '200px',
                                                right: '0',
                                                zIndex: 100,
                                                background: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '12px',
                                                padding: '8px',
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.7), 0 8px 10px -6px rgba(0,0,0,0.7)',
                                                width: '280px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                animation: 'fadeIn 0.2s ease-out'
                                            }}>
                                                <img 
                                                    src={currentProduct.imgUrl} 
                                                    alt="Full Preview" 
                                                    style={{ 
                                                        maxWidth: '100%',
                                                        maxHeight: '260px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px'
                                                    }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                                        <ImageIcon size={32} />
                                        <span style={{ fontSize: '0.8rem' }}>Изображение отсутствует</span>
                                    </div>
                                )}

                                <div style={{ width: '100%' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="file-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                    />
                                    <label 
                                        htmlFor="file-upload" 
                                        className="btn-secondary" 
                                        style={{ display: 'block', textAlign: 'center', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                                    >
                                        Загрузить новое фото
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Color Glow Theme */}
                        <div>
                            <h3 className="editor-section-title">Цветовая тема (свечение)</h3>
                            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            title={color.name}
                                            onClick={() => setCurrentProduct({ ...currentProduct, colorTheme: color.value })}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                border: currentProduct.colorTheme === color.value ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                                background: color.value.replace('0.15', '1'),
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease',
                                                transform: currentProduct.colorTheme === color.value ? 'scale(1.15)' : 'scale(1)'
                                            }}
                                        >
                                            {currentProduct.colorTheme === color.value && <Check size={14} color="white" />}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProduct.colorTheme}
                                    placeholder="rgba(251, 191, 36, 0.15)"
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, colorTheme: e.target.value })}
                                    style={{ fontSize: '0.8rem', opacity: 0.8 }}
                                />
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div>
                            <h3 className="editor-section-title">SEO настройки</h3>
                            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <label style={{ marginBottom: 0 }}>URL (slug)</label>
                                        <button
                                            type="button"
                                            onClick={() => handleAutofillField('slug')}
                                            disabled={autofillingFields['slug']}
                                            title="Сгенерировать URL"
                                            className="field-autofill-btn"
                                        >
                                            <Wand2 size={13} className={autofillingFields['slug'] ? 'wand-spinner' : ''} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.slug || ''}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value })}
                                        placeholder="bleu-de-chanel (оставьте пустым для автогенерации из названия)"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <label style={{ marginBottom: 0 }}>SEO Title</label>
                                        <button
                                            type="button"
                                            onClick={() => handleAutofillField('seoTitle')}
                                            disabled={autofillingFields['seoTitle']}
                                            title="Заполнить SEO Title"
                                            className="field-autofill-btn"
                                        >
                                            <Wand2 size={13} className={autofillingFields['seoTitle'] ? 'wand-spinner' : ''} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.seoTitle || ''}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, seoTitle: e.target.value })}
                                        placeholder="Заголовок для поисковиков (оставьте пустым для автозаполнения)"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <label style={{ marginBottom: 0 }}>SEO Description</label>
                                        <button
                                            type="button"
                                            onClick={() => handleAutofillField('seoDescription')}
                                            disabled={autofillingFields['seoDescription']}
                                            title="Заполнить SEO Description"
                                            className="field-autofill-btn"
                                        >
                                            <Wand2 size={13} className={autofillingFields['seoDescription'] ? 'wand-spinner' : ''} />
                                        </button>
                                    </div>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={currentProduct.seoDescription || ''}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, seoDescription: e.target.value })}
                                        placeholder="Описание для поисковиков (оставьте пустым для автозаполнения из краткого описания)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FSA Registry Link */}
                        <div>
                            <h3 className="editor-section-title">Декларация Росаккредитации</h3>
                            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Ссылка на реестр (FSA)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentProduct.fsa_link || ''}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, fsa_link: e.target.value })}
                                        placeholder="https://pub.fsa.gov.ru/rds/declaration/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>

            {isImageEditorOpen && (
                <ImageEditorModal
                    imageUrl={currentProduct.imgUrl}
                    onSave={(newUrl) => {
                        setCurrentProduct(prev => ({ ...prev, imgUrl: newUrl }));
                        setIsImageEditorOpen(false);
                    }}
                    onClose={() => setIsImageEditorOpen(false)}
                />
            )}
        </div>
    );
}
