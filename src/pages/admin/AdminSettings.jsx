import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                // Convert array to object key-value map for easier form binding
                const settingsMap = {};
                data.forEach(item => {
                    settingsMap[item.setting_key] = item.setting_value;
                });
                setSettings(settingsMap);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Convert back to array of updates
            const updates = [];
            for (const [key, value] of Object.entries(settings)) {
                if (key === 'admin_password' && (!value || value.trim() === '')) continue;
                updates.push({ key, value });
            }

            const res = await fetch('/api/settings/batch', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });

            if (res.ok) {
                alert('Настройки успешно сохранены!');
            } else {
                alert('Ошибка при сохранении настроек');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Ошибка сети при сохранении настроек');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="text-white">Загрузка настроек...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Общие настройки (Футер)</h2>
            </div>

            <div className="admin-card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSave}>

                    <h3 style={{ color: 'var(--color-accent-gold)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Контактная информация</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Номер телефона</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.contact_phone || ''}
                                onChange={(e) => handleChange('contact_phone', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Часы работы</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.contact_hours || ''}
                                onChange={(e) => handleChange('contact_hours', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Адрес магазина</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.contact_address || ''}
                            onChange={(e) => handleChange('contact_address', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ссылка на карту (Yandex/Google)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.contact_map_url || ''}
                            onChange={(e) => handleChange('contact_map_url', e.target.value)}
                            placeholder="https://yandex.ru/map-widget/v1/?..."
                        />
                    </div>

                    <h3 style={{ color: 'var(--color-accent-gold)', marginBottom: '1.5rem', marginTop: '3rem', fontSize: '1.1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>Социальные сети</h3>

                    <div className="form-group">
                        <label>Ссылка на Telegram</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.social_telegram || ''}
                            onChange={(e) => handleChange('social_telegram', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ссылка на Instagram</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.social_instagram || ''}
                            onChange={(e) => handleChange('social_instagram', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ссылка на VKontakte</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.social_vk || ''}
                            onChange={(e) => handleChange('social_vk', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ссылка на TikTok</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.social_tiktok || ''}
                            onChange={(e) => handleChange('social_tiktok', e.target.value)}
                        />
                    </div>



                    <h3 style={{ color: 'var(--color-accent-gold)', marginBottom: '1.5rem', marginTop: '3rem', fontSize: '1.1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>SEO и Аналитика</h3>

                    <div className="form-group">
                        <label>Заголовок сайта (Title)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={settings.seo_title || ''}
                            onChange={(e) => handleChange('seo_title', e.target.value)}
                            placeholder="Например: Kapsula Parfume - Селективная парфюмерия"
                        />
                    </div>
                    <div className="form-group">
                        <label>Описание сайта (Description)</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            value={settings.seo_description || ''}
                            onChange={(e) => handleChange('seo_description', e.target.value)}
                            placeholder="Короткое описание сайта для поисковиков..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Код Яндекс Метрики (или других счетчиков)</label>
                        <textarea
                            className="form-control"
                            rows="6"
                            value={settings.yandex_metrika_code || ''}
                            onChange={(e) => handleChange('yandex_metrika_code', e.target.value)}
                            placeholder="<!-- Yandex.Metrika counter --> ..."
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                        />
                    </div>

                    <h3 style={{ color: 'var(--color-accent-gold)', marginBottom: '1.5rem', marginTop: '3rem', fontSize: '1.1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>Смена пароля (Админ)</h3>

                    <div className="form-group">
                        <label>Новый пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            value={settings.admin_password || ''}
                            onChange={(e) => handleChange('admin_password', e.target.value)}
                            placeholder="Оставьте пустым, если не хотите менять"
                            autoComplete="new-password"
                        />
                    </div>


                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '3rem' }}>
                        <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> {saving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
