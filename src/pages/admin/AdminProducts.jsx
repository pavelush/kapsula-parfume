import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, X, Check, Eye, EyeOff, ExternalLink, Wand2, RefreshCw, Scissors } from 'lucide-react';
import ImageEditorModal from '../../components/ImageEditorModal';
import AdminProductEditForm from './AdminProductEditForm';

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
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit' | 'create'
    const [originalProduct, setOriginalProduct] = useState(null);
    const [saveMessage, setSaveMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('Парфюмерия');

    const [activeVolumeTab, setActiveVolumeTab] = useState('3');
    const [msWarehouseStock, setMsWarehouseStock] = useState([]);
    const [loadingMsStock, setLoadingMsStock] = useState(false);

    // Form state
    const initialProductState = {
        name: '', description: '', fullDescription: '', brand: '', category: 'Парфюмерия', colorTheme: 'rgba(251, 191, 36, 0.15)', imgUrl: '',
        volumes: {
            1: { price: '', sku: '', stock: '' },
            3: { price: '', sku: '', stock: '' },
            5: { price: '', sku: '', stock: '' },
            10: { price: '', sku: '', stock: '' }
        },
        is_active: true,
        slug: '', seoTitle: '', seoDescription: '', fsa_link: '',
        compositionPyramid: '', characteristics: ''
    };
    const [currentProduct, setCurrentProduct] = useState(initialProductState);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [foundUrls, setFoundUrls] = useState([]);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [isUpdatingImage, setIsUpdatingImage] = useState(false);
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    // Autofill cache and loading states for individual fields
    const [autofillCache, setAutofillCache] = useState({ brand: '', name: '', data: null });
    const [autofillingFields, setAutofillingFields] = useState({});
    const [cacheUsedFields, setCacheUsedFields] = useState({});

    // Reset autofill cache if product brand or name changes
    useEffect(() => {
        setAutofillCache({ brand: '', name: '', data: null });
        setCacheUsedFields({});
    }, [currentProduct.brand, currentProduct.name]);

    useEffect(() => {
        fetchProducts();
        fetchBrands();
    }, []);

    const fetchMsStock = async (sku) => {
        if (!sku) {
            setMsWarehouseStock([]);
            return;
        }
        setLoadingMsStock(true);
        try {
            const res = await fetch(`/api/moysklad/stock-by-sku?sku=${encodeURIComponent(sku)}`);
            if (res.ok) {
                const data = await res.json();
                setMsWarehouseStock(data);
            } else {
                setMsWarehouseStock([]);
            }
        } catch (error) {
            console.error('Error fetching MS warehouse stock:', error);
            setMsWarehouseStock([]);
        } finally {
            setLoadingMsStock(false);
        }
    };

    useEffect(() => {
        if (viewMode !== 'list') {
            fetchMsStock(currentProduct.volumes[activeVolumeTab]?.sku);
        } else {
            setMsWarehouseStock([]);
        }
    }, [activeVolumeTab, viewMode]);

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
            if (res.ok) {
                const data = await res.json();
                data.sort((a, b) => a.name.localeCompare(b.name, ['ru', 'en'], { sensitivity: 'base' }));
                setBrands(data);
            }
        } catch (err) { }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (isSavingProduct) return;
        setIsSavingProduct(true);

        // Format prices back to JSON
        let pricesJson = {};
        if (currentProduct.category === 'Аксессуары') {
            pricesJson = { '1': currentProduct.volumes['1'] };
        } else {
            pricesJson = {
                '3': currentProduct.volumes['3'],
                '5': currentProduct.volumes['5'],
                '10': currentProduct.volumes['10']
            };
        }

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
            fsa_link: currentProduct.fsa_link,
            compositionPyramid: currentProduct.compositionPyramid,
            characteristics: currentProduct.characteristics
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
                const savedProduct = await res.json();
                fetchProducts();
                
                const prepared = {
                    ...savedProduct,
                    fullDescription: savedProduct.fullDescription || '',
                    category: savedProduct.category || 'Парфюмерия',
                    volumes: {
                        1: { price: savedProduct.prices?.['1']?.price || '', sku: savedProduct.prices?.['1']?.sku || '', stock: savedProduct.prices?.['1']?.stock ?? '' },
                        3: { price: savedProduct.prices?.['3']?.price || '', sku: savedProduct.prices?.['3']?.sku || '', stock: savedProduct.prices?.['3']?.stock ?? '' },
                        5: { price: savedProduct.prices?.['5']?.price || '', sku: savedProduct.prices?.['5']?.sku || '', stock: savedProduct.prices?.['5']?.stock ?? '' },
                        10: { price: savedProduct.prices?.['10']?.price || '', sku: savedProduct.prices?.['10']?.sku || '', stock: savedProduct.prices?.['10']?.stock ?? '' }
                    },
                    is_active: savedProduct.is_active !== undefined ? savedProduct.is_active : true,
                    slug: savedProduct.slug || '',
                    seoTitle: savedProduct.seoTitle || '',
                    seoDescription: savedProduct.seoDescription || '',
                    fsa_link: savedProduct.fsa_link || '',
                    compositionPyramid: savedProduct.compositionPyramid || '',
                    characteristics: savedProduct.characteristics || ''
                };
                
                setCurrentProduct(prepared);
                setOriginalProduct(prepared);
                setViewMode('edit');
                setSaveMessage('Успешно сохранено');
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                setSaveMessage('Ошибка при сохранении');
                setTimeout(() => setSaveMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setIsSavingProduct(false);
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

    const isProductEqual = (p1, p2) => {
        if (!p1 || !p2) return p1 === p2;
        
        const basicFields = [
            'name', 'description', 'fullDescription', 'brand', 'category', 
            'colorTheme', 'imgUrl', 'is_active', 'slug', 'seoTitle', 
            'seoDescription', 'fsa_link', 'compositionPyramid', 'characteristics'
        ];
        for (const field of basicFields) {
            const val1 = p1[field] ?? '';
            const val2 = p2[field] ?? '';
            if (val1 !== val2) return false;
        }

        const vols = ['1', '3', '5', '10'];
        for (const vol of vols) {
            const v1 = p1.volumes?.[vol] || {};
            const v2 = p2.volumes?.[vol] || {};
            
            const price1 = String(v1.price || '').trim();
            const price2 = String(v2.price || '').trim();
            const sku1 = String(v1.sku || '').trim();
            const sku2 = String(v2.sku || '').trim();
            
            const stock1 = v1.stock !== undefined && v1.stock !== null ? String(v1.stock).trim() : '';
            const stock2 = v2.stock !== undefined && v2.stock !== null ? String(v2.stock).trim() : '';

            if (price1 !== price2 || sku1 !== sku2 || stock1 !== stock2) {
                return false;
            }
        }

        return true;
    };

    const hasUnsavedChanges = () => {
        return !isProductEqual(currentProduct, originalProduct);
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (viewMode !== 'list' && hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [viewMode, currentProduct, originalProduct]);

    const openEditMode = (product) => {
        setFoundUrls([]);
        setCurrentUrlIndex(0);
        setIsHoveringImage(false);
        const prepared = {
            ...product,
            fullDescription: product.fullDescription || '',
            category: product.category || 'Парфюмерия',
            volumes: {
                1: { price: product.prices?.['1']?.price || '', sku: product.prices?.['1']?.sku || '', stock: product.prices?.['1']?.stock ?? '' },
                3: { price: product.prices?.['3']?.price || '', sku: product.prices?.['3']?.sku || '', stock: product.prices?.['3']?.stock ?? '' },
                5: { price: product.prices?.['5']?.price || '', sku: product.prices?.['5']?.sku || '', stock: product.prices?.['5']?.stock ?? '' },
                10: { price: product.prices?.['10']?.price || '', sku: product.prices?.['10']?.sku || '', stock: product.prices?.['10']?.stock ?? '' }
            },
            is_active: product.is_active !== undefined ? product.is_active : true,
            slug: product.slug || '',
            seoTitle: product.seoTitle || '',
            seoDescription: product.seoDescription || '',
            fsa_link: product.fsa_link || '',
            compositionPyramid: product.compositionPyramid || '',
            characteristics: product.characteristics || ''
        };
        setCurrentProduct(prepared);
        setOriginalProduct(prepared);
        setActiveVolumeTab(product.category === 'Аксессуары' ? '1' : '3');
        setViewMode('edit');
    };

    const handlePrevProduct = () => {
        const currentIndex = filteredProducts.findIndex(p => p.id === currentProduct.id);
        if (currentIndex > 0) {
            if (hasUnsavedChanges()) {
                const confirm = window.confirm('У вас есть несохраненные изменения. Перейти к другому товару без сохранения?');
                if (!confirm) return;
            }
            openEditMode(filteredProducts[currentIndex - 1]);
        }
    };

    const handleNextProduct = () => {
        const currentIndex = filteredProducts.findIndex(p => p.id === currentProduct.id);
        if (currentIndex !== -1 && currentIndex < filteredProducts.length - 1) {
            if (hasUnsavedChanges()) {
                const confirm = window.confirm('У вас есть несохраненные изменения. Перейти к другому товару без сохранения?');
                if (!confirm) return;
            }
            openEditMode(filteredProducts[currentIndex + 1]);
        }
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

    const openAddMode = () => {
        setFoundUrls([]);
        setCurrentUrlIndex(0);
        setIsHoveringImage(false);
        setCurrentProduct(initialProductState);
        setOriginalProduct(initialProductState);
        setActiveVolumeTab('3');
        setViewMode('create');
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

        const matchesCategory = (p.category || 'Парфюмерия') === activeCategoryFilter;
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

    const handleAutofill = async () => {
        if (!currentProduct.brand || !currentProduct.name) {
            alert('Сначала выберите бренд и введите название товара');
            return;
        }

        setIsAutofilling(true);
        try {
            const res = await fetch('/api/products/autofill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brand: currentProduct.brand,
                    name: currentProduct.name,
                    category: currentProduct.category
                })
            });

            const data = await res.json();
            if (res.ok) {
                const hasExistingImage = !!currentProduct.imgUrl;
                setCurrentProduct(prev => ({
                    ...prev,
                    description: data.description || prev.description,
                    fullDescription: data.fullDescription || prev.fullDescription,
                    imgUrl: hasExistingImage ? prev.imgUrl : (data.imgUrl || prev.imgUrl),
                    slug: data.slug || prev.slug,
                    seoTitle: data.seoTitle || prev.seoTitle,
                    seoDescription: data.seoDescription || prev.seoDescription,
                    compositionPyramid: data.compositionPyramid || prev.compositionPyramid,
                    characteristics: data.characteristics || prev.characteristics
                }));
                setFoundUrls(data.foundUrls || []);
                setCurrentUrlIndex(hasExistingImage ? -1 : (data.currentUrlIndex !== undefined ? data.currentUrlIndex : 0));

                // Save full response to cache for subsequent individual field autofill clicks
                setAutofillCache({
                    brand: currentProduct.brand,
                    name: currentProduct.name,
                    data
                });
            } else {
                alert(data.error || 'Произошла ошибка при автоматическом заполнении');
            }
        } catch (error) {
            console.error('Autofill error:', error);
            alert('Не удалось подключиться к серверу автозаполнения');
        } finally {
            setIsAutofilling(false);
        }
    };

    const getTransliteratedSlug = (brand, name) => {
        const transliterate = (text) => {
            const rus = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
                'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
                'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
                ' ': '-'
            };
            return text.toLowerCase().split('').map(char => {
                return rus[char] !== undefined ? rus[char] : char;
            }).join('')
              .replace(/[^a-z0-9-]/g, '')
              .replace(/-+/g, '-')
              .replace(/^-+|-+$/g, '');
        };

        const brandSlug = transliterate(brand || '');
        const nameSlug = transliterate(name || '');
        return `${brandSlug}-${nameSlug}`;
    };

    const handleAutofillField = async (field) => {
        if (!currentProduct.brand || !currentProduct.name) {
            alert('Сначала выберите бренд и введите название товара');
            return;
        }

        // 1. Local generation for deterministic fields
        if (field === 'slug') {
            const slugVal = getTransliteratedSlug(currentProduct.brand, currentProduct.name);
            setCurrentProduct(prev => ({ ...prev, slug: slugVal }));
            return;
        }

        if (field === 'seoTitle') {
            const isAccessory = currentProduct.category === 'Аксессуары';
            const seoTitleVal = isAccessory
                ? `${currentProduct.brand} - ${currentProduct.name} | Купить аксессуар в магазине Kapsula Parfume`
                : `${currentProduct.brand} - ${currentProduct.name} | Купить парфюм в магазине Kapsula Parfume`;
            setCurrentProduct(prev => ({ ...prev, seoTitle: seoTitleVal }));
            return;
        }

        if (field === 'seoDescription') {
            const hasLocalDesc = !!(currentProduct.fullDescription || currentProduct.description);
            const hasCache = autofillCache.brand === currentProduct.brand &&
                             autofillCache.name === currentProduct.name &&
                             autofillCache.data;

            if (hasLocalDesc) {
                const isAccessory = currentProduct.category === 'Аксессуары';
                const descSource = currentProduct.fullDescription || currentProduct.description || '';
                const cleanDesc = descSource.substring(0, 120);
                const seoDescriptionVal = isAccessory
                    ? `Купить оригинальный аксессуар ${currentProduct.brand} - ${currentProduct.name} в интернет-магазине. ${cleanDesc}...`
                    : `Купить оригинальный парфюм ${currentProduct.brand} - ${currentProduct.name} в интернет-магазине. ${cleanDesc}...`;
                setCurrentProduct(prev => ({ ...prev, seoDescription: seoDescriptionVal }));
                return;
            } else if (hasCache) {
                const isAccessory = currentProduct.category === 'Аксессуары';
                const descSource = autofillCache.data.fullDescription || autofillCache.data.description || '';
                const cleanDesc = descSource.substring(0, 120);
                const seoDescriptionVal = isAccessory
                    ? `Купить оригинальный аксессуар ${currentProduct.brand} - ${currentProduct.name} в интернет-магазине. ${cleanDesc}...`
                    : `Купить оригинальный парфюм ${currentProduct.brand} - ${currentProduct.name} в интернет-магазине. ${cleanDesc}...`;
                setCurrentProduct(prev => ({ ...prev, seoDescription: seoDescriptionVal }));
                return;
            }
            // If description is missing, proceed to call the API to fetch details so we can generate description
        }

        // 2. Try cache for remote fields (description, fullDescription, compositionPyramid, characteristics)
        const isFieldEmpty = !currentProduct[field];
        const alreadyUsedCache = !!cacheUsedFields[field];

        if (
            isFieldEmpty &&
            !alreadyUsedCache &&
            autofillCache.brand === currentProduct.brand &&
            autofillCache.name === currentProduct.name &&
            autofillCache.data
        ) {
            const cachedValue = autofillCache.data[field];
            setCurrentProduct(prev => ({
                ...prev,
                [field]: cachedValue || prev[field]
            }));
            setCacheUsedFields(prev => ({ ...prev, [field]: true }));
            return;
        }

        // 3. Otherwise fetch from API
        setAutofillingFields(prev => ({ ...prev, [field]: true }));
        try {
            const res = await fetch('/api/products/autofill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brand: currentProduct.brand,
                    name: currentProduct.name,
                    category: currentProduct.category
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Update cache
                setAutofillCache({
                    brand: currentProduct.brand,
                    name: currentProduct.name,
                    data
                });

                // Reset cache used flags for all other fields, but mark this field as used
                // so clicking it again will force a fresh generation.
                setCacheUsedFields({ [field]: true });

                // Set field
                if (field === 'seoDescription') {
                    const isAccessory = currentProduct.category === 'Аксессуары';
                    const descSource = data.fullDescription || data.description || '';
                    const cleanDesc = descSource.substring(0, 120);
                    const seoDescriptionVal = isAccessory
                        ? `Купить оригинальный аксессуар ${currentProduct.brand} - ${currentProduct.name} в интернет-магазине. ${cleanDesc}...`
                        : `Купить оригинальный парфюм ${currentProduct.brand} - ${currentProduct.name} в интернет-магазине. ${cleanDesc}...`;
                    setCurrentProduct(prev => ({ ...prev, seoDescription: seoDescriptionVal }));
                } else {
                    setCurrentProduct(prev => ({
                        ...prev,
                        [field]: data[field] || prev[field]
                    }));
                }
            } else {
                alert(data.error || 'Произошла ошибка при автоматическом заполнении');
            }
        } catch (error) {
            console.error(`Autofill error for field ${field}:`, error);
            alert('Не удалось подключиться к серверу автозаполнения');
        } finally {
            setAutofillingFields(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleNextImage = async () => {
        if (!foundUrls || foundUrls.length === 0) return;
        if (foundUrls.length === 1 && currentUrlIndex !== -1) return;

        setIsUpdatingImage(true);
        let success = false;
        let lastError = null;

        // Start checking from the next item in the list
        let nextIndex = (currentUrlIndex + 1) % foundUrls.length;
        const startIndex = currentUrlIndex === -1 ? 0 : currentUrlIndex;
        let attempts = 0;

        while (attempts < foundUrls.length) {
            const targetUrl = foundUrls[nextIndex];
            console.log(`[handleNextImage] Attempting to download next image from: ${targetUrl}`);
            try {
                const res = await fetch('/api/products/autofill/download-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: targetUrl })
                });

                const data = await res.json();
                if (res.ok) {
                    setCurrentProduct(prev => ({
                        ...prev,
                        imgUrl: data.imgUrl
                    }));
                    setCurrentUrlIndex(nextIndex);
                    success = true;
                    break;
                } else {
                    lastError = data.error || 'Ошибка при загрузке изображения';
                    console.warn(`[handleNextImage] Failed download for ${targetUrl}:`, lastError);
                }
            } catch (error) {
                lastError = error.message || 'Не удалось подключиться к серверу';
                console.error(`[handleNextImage] Connection error for ${targetUrl}:`, error);
            }

            nextIndex = (nextIndex + 1) % foundUrls.length;
            attempts++;

            // If we've circled back to the starting index (in case currentUrlIndex !== -1),
            // and we didn't succeed, we stop to prevent infinite looping.
            if (currentUrlIndex !== -1 && nextIndex === startIndex) {
                break;
            }
        }

        if (!success) {
            alert(lastError || 'Не удалось загрузить ни одно из найденных изображений');
        }
        setIsUpdatingImage(false);
    };

    const handleTableImageHover = (e, imgUrl) => {
        if (!imgUrl) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredProduct({
            imgUrl,
            rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            }
        });
    };

    const renderVolumeDetails = (product, volumeKey) => {
        const vol = product.prices?.[volumeKey];
        if (!vol || (!vol.price && !vol.sku && (vol.stock === undefined || vol.stock === ''))) {
            return <span className="volume-cell-empty">—</span>;
        }

        const stockNum = vol.stock !== undefined && vol.stock !== '' ? Number(vol.stock) : 0;

        return (
            <div className="volume-cell-info">
                <div className="volume-cell-price">
                    {vol.price ? `${vol.price} ₽` : '—'}
                </div>
                <div className="volume-cell-sku">
                    Код: {vol.sku || '—'}
                </div>
                <div className="volume-cell-stock">
                    Ост: <span style={{ color: stockNum > 0 ? '#10B981' : '#EF4444', fontWeight: '600' }}>{stockNum}</span>
                </div>
            </div>
        );
    };

    if (viewMode !== 'list') {
        return (
            <AdminProductEditForm
                viewMode={viewMode}
                currentProduct={currentProduct}
                setCurrentProduct={setCurrentProduct}
                setViewMode={setViewMode}
                brands={brands}
                isSavingProduct={isSavingProduct}
                handleSave={handleSave}
                fetchMsStock={fetchMsStock}
                msWarehouseStock={msWarehouseStock}
                loadingMsStock={loadingMsStock}
                handleAutofill={handleAutofill}
                isAutofilling={isAutofilling}
                handleAutofillField={handleAutofillField}
                autofillingFields={autofillingFields}
                handleImageUpload={handleImageUpload}
                foundUrls={foundUrls}
                currentUrlIndex={currentUrlIndex}
                handleNextImage={handleNextImage}
                isUpdatingImage={isUpdatingImage}
                isImageEditorOpen={isImageEditorOpen}
                setIsImageEditorOpen={setIsImageEditorOpen}
                isHoveringImage={isHoveringImage}
                setIsHoveringImage={setIsHoveringImage}
                filteredProducts={filteredProducts}
                handlePrevProduct={handlePrevProduct}
                handleNextProduct={handleNextProduct}
                hasUnsavedChanges={hasUnsavedChanges}
                activeVolumeTab={activeVolumeTab}
                setActiveVolumeTab={setActiveVolumeTab}
                PRESET_COLORS={PRESET_COLORS}
                saveMessage={saveMessage}
            />
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Управление товарами</h2>
                <button onClick={openAddMode} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить товар
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {['Парфюмерия', 'Аксессуары'].map(cat => (
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
                                {activeCategoryFilter === 'Парфюмерия' && (
                                    <>
                                        <th style={{ width: '150px' }}>3 мл</th>
                                        <th style={{ width: '150px' }}>5 мл</th>
                                        <th style={{ width: '150px' }}>10 мл</th>
                                    </>
                                )}
                                {activeCategoryFilter === 'Аксессуары' && (
                                    <th style={{ width: '200px' }}>Характеристики</th>
                                )}
                                <th style={{ width: '150px', textAlign: 'right' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div 
                                            onMouseEnter={(e) => handleTableImageHover(e, product.imgUrl)}
                                            onMouseLeave={() => setHoveredProduct(null)}
                                            style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                background: 'rgba(255,255,255,0.1)', 
                                                borderRadius: '8px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                overflow: 'hidden',
                                                cursor: product.imgUrl ? 'pointer' : 'default'
                                            }}
                                        >
                                            {product.imgUrl ? (
                                                <img src={product.imgUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <ImageIcon size={20} color="var(--color-text-muted)" />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{product.category || 'Парфюмерия'} | {product.brand}</div>
                                        <div 
                                            onClick={() => openEditMode(product)}
                                            style={{ 
                                                fontWeight: 500, 
                                                color: 'white', 
                                                opacity: product.is_active ? 1 : 0.5, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px'
                                            }}
                                            className="admin-product-name-link"
                                        >
                                            {product.name}
                                            {!product.is_active && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Скрыт</span>}
                                        </div>
                                    </td>
                                    {activeCategoryFilter === 'Парфюмерия' && (
                                        <>
                                            <td>{renderVolumeDetails(product, '3')}</td>
                                            <td>{renderVolumeDetails(product, '5')}</td>
                                            <td>{renderVolumeDetails(product, '10')}</td>
                                        </>
                                    )}
                                    {activeCategoryFilter === 'Аксессуары' && (
                                        <td>{renderVolumeDetails(product, '1')}</td>
                                    )}
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end', verticalAlign: 'middle' }}>
                                            <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="admin-action-btn" title="Открыть на сайте" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                <ExternalLink size={18} />
                                            </a>
                                            <button onClick={() => handleToggleActive(product)} className="admin-action-btn" title={product.is_active ? "Скрыть из каталога" : "Показать в каталоге"} style={{ color: product.is_active ? 'var(--color-text)' : 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                                                {product.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button onClick={() => openEditMode(product)} className="admin-action-btn" title="Редактировать" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="admin-action-btn danger" title="Удалить" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={activeCategoryFilter === 'Парфюмерия' ? 6 : 4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Товары не найдены</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {hoveredProduct && (
                <div style={{
                    position: 'fixed',
                    top: Math.max(10, Math.min(window.innerHeight - 610, hoveredProduct.rect.top + hoveredProduct.rect.height / 2 - 300)),
                    left: hoveredProduct.rect.left + hoveredProduct.rect.width + 15 + 400 > window.innerWidth
                        ? Math.max(10, hoveredProduct.rect.left - 415)
                        : hoveredProduct.rect.left + hoveredProduct.rect.width + 15,
                    zIndex: 9999,
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.7), 0 8px 10px -6px rgba(0,0,0,0.7)',
                    maxWidth: '400px',
                    maxHeight: '600px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    animation: 'fadeIn 0.15s ease-out'
                }}>
                    <img 
                        src={hoveredProduct.imgUrl} 
                        alt="Preview" 
                        style={{ 
                            maxWidth: '384px',
                            maxHeight: '584px',
                            objectFit: 'contain',
                            borderRadius: '8px'
                        }} 
                    />
                </div>
            )}
        </div>
    );
}
