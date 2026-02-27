import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

export default function AdminFAQ() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialFaqState = { question: '', answer: '', sort_order: 0 };
    const [currentFaq, setCurrentFaq] = useState(initialFaqState);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/faqs');
            if (res.ok) {
                const data = await res.json();
                setFaqs(data);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const method = currentFaq.id ? 'PUT' : 'POST';
            const url = currentFaq.id ? `/api/faqs/${currentFaq.id}` : '/api/faqs';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentFaq.question,
                    answer: currentFaq.answer,
                    sort_order: parseInt(currentFaq.sort_order, 10) || 0
                })
            });

            if (res.ok) {
                fetchFaqs();
                setIsModalOpen(false);
            } else {
                alert('Ошибка при сохранении вопроса');
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить этот вопрос?')) return;
        try {
            const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
            if (res.ok) fetchFaqs();
        } catch (error) { }
    };

    const openEditModal = (faq) => {
        setCurrentFaq(faq);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        // Find max sort_order
        const maxSort = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) : 0;
        setCurrentFaq({ ...initialFaqState, sort_order: maxSort + 1 });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-2xl text-white">Вопросы и ответы (FAQ)</h2>
                <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Добавить вопрос
                </button>
            </div>

            {loading ? (
                <div className="text-white">Загрузка вопросов...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {faqs.length > 0 ? faqs.map(faq => (
                        <div key={faq.id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--color-text-muted)', cursor: 'grab', paddingTop: '4px' }}>
                                <GripVertical size={20} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>#{faq.sort_order}</span>
                                    <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>{faq.question}</h3>
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{faq.answer}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => openEditModal(faq)} className="admin-action-btn" title="Редактировать">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(faq.id)} className="admin-action-btn danger" title="Удалить">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="admin-card text-center" style={{ color: 'var(--color-text-muted)', padding: '3rem' }}>
                            FAQ не найдены
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 className="text-xl text-white m-0">{currentFaq.id ? 'Редактировать вопрос' : 'Новый вопрос'}</h3>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Вопрос</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentFaq.question}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Ответ</label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    value={currentFaq.answer}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ width: '150px' }}>
                                <label>Порядок (сортировка)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={currentFaq.sort_order}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, sort_order: e.target.value })}
                                    required
                                />
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
