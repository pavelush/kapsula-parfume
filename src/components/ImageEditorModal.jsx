import React, { useState, useEffect, useRef } from 'react';
import { X, Crop, Check, RotateCcw, Scissors, Trash2, Sliders, AlertCircle, Sparkles } from 'lucide-react';

const ImageEditorModal = ({ imageUrl, onSave, onClose }) => {
    const [history, setHistory] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('crop'); // 'crop' or 'bg-remove'
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiStatusText, setAiStatusText] = useState('');

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const originalImageRef = useRef(null);

    // Initialize canvas with the image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            originalImageRef.current = img;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        setHistory(prev => [...prev, dataUrl]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');



        const prevDataUrl = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = prevDataUrl;

        if (history.length === 1) {
            setHasChanges(false);
        }
    };

    const handleReset = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        setHistory([]);
        setHasChanges(false);

        if (originalImageRef.current) {
            const img = originalImageRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }
    };

    const applyCrop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        saveToHistory();

        // Calculate pixel coordinates from percentages
        const cropX = (crop.x / 100) * canvas.width;
        const cropY = (crop.y / 100) * canvas.height;
        const cropW = (crop.width / 100) * canvas.width;
        const cropH = (crop.height / 100) * canvas.height;

        if (cropW <= 0 || cropH <= 0) return;

        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cropW;
        tempCanvas.height = cropH;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        // Update main canvas size and content
        canvas.width = cropW;
        canvas.height = cropH;
        ctx.clearRect(0, 0, cropW, cropH);
        ctx.drawImage(tempCanvas, 0, 0);

        setCrop({ x: 10, y: 10, width: 80, height: 80 });
        setHasChanges(true);
    };



    const handleAiBackgroundRemoval = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        setIsAiLoading(true);
        setAiStatusText('Отправка изображения на сервер...');

        try {
            saveToHistory();

            // Convert canvas to blob
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            
            const formData = new FormData();
            formData.append('image', blob, 'image.png');

            // Get admin token from localStorage
            const token = localStorage.getItem('adminToken');

            setAiStatusText('Удаление фона нейросетью RMBG-2.0...');

            const response = await fetch('/api/remove-background', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
            }

            const data = await response.json();

            setAiStatusText('Применение результата...');

            // Load the processed image and draw on canvas
            const resultImg = new Image();
            resultImg.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                resultImg.onload = resolve;
                resultImg.onerror = () => reject(new Error('Не удалось загрузить обработанное изображение'));
                resultImg.src = data.url;
            });

            canvas.width = resultImg.width;
            canvas.height = resultImg.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(resultImg, 0, 0);

            setHasChanges(true);
            setAiStatusText('');

            alert('Фон успешно удален с помощью ИИ (RMBG-2.0)!');
        } catch (error) {
            console.error('AI background removal error:', error);
            alert(`Ошибка работы ИИ: ${error.message || 'Не удалось обработать изображение'}`);
        } finally {
            setIsAiLoading(false);
        }
    };



    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsSaving(true);

        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob, 'edited-image.png');

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    onSave(data.url);
                } else {
                    alert('Ошибка при сохранении изображения на сервере');
                }
            } catch (error) {
                console.error('Error uploading edited image:', error);
                alert('Не удалось подключиться к серверу для сохранения изображения');
            } finally {
                setIsSaving(false);
            }
        }, 'image/png');
    };

    // Crop box handle drag logic
    const handleCropMouseDown = (e, handle) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startCrop = { ...crop };

        const containerRect = containerRef.current.getBoundingClientRect();
        const cWidth = containerRect.width;
        const cHeight = containerRect.height;

        const handleMouseMove = (moveEvent) => {
            const dx = ((moveEvent.clientX - startX) / cWidth) * 100;
            const dy = ((moveEvent.clientY - startY) / cHeight) * 100;

            let newCrop = { ...startCrop };

            if (handle === 'move') {
                newCrop.x = Math.max(0, Math.min(100 - newCrop.width, startCrop.x + dx));
                newCrop.y = Math.max(0, Math.min(100 - newCrop.height, startCrop.y + dy));
            } else {
                if (handle.includes('t')) {
                    const newY = Math.max(0, Math.min(startCrop.y + startCrop.height - 5, startCrop.y + dy));
                    newCrop.height = startCrop.y + startCrop.height - newY;
                    newCrop.y = newY;
                }
                if (handle.includes('b')) {
                    newCrop.height = Math.max(5, Math.min(100 - startCrop.y, startCrop.height + dy));
                }
                if (handle.includes('l')) {
                    const newX = Math.max(0, Math.min(startCrop.x + startCrop.width - 5, startCrop.x + dx));
                    newCrop.width = startCrop.x + startCrop.width - newX;
                    newCrop.x = newX;
                }
                if (handle.includes('r')) {
                    newCrop.width = Math.max(5, Math.min(100 - startCrop.x, startCrop.width + dx));
                }
            }

            setCrop(newCrop);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const checkerboardStyle = {
        backgroundColor: '#1e293b',
        backgroundImage: `
            linear-gradient(45deg, #0f172a 25%, transparent 25%), 
            linear-gradient(-45deg, #0f172a 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #0f172a 75%), 
            linear-gradient(-45deg, transparent 75%, #0f172a 75%)
        `,
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        position: 'relative',
        display: 'inline-flex',
        maxHeight: '60vh',
        maxWidth: '100%',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '2rem',
            animation: 'fadeIn 0.25s ease-out'
        }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .editor-tab {
                    padding: 8px 16px;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.6);
                    cursor: pointer;
                    font-weight: 500;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .editor-tab.active {
                    color: var(--color-accent-gold, #fbbf24);
                    border-bottom: 2px solid var(--color-accent-gold, #fbbf24);
                }
                .editor-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.05);
                    color: white;
                    cursor: pointer;
                    display: inline-flex;
                    alignItems: center;
                    gap: 6px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .editor-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.3);
                }
                .editor-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .editor-btn-primary {
                    background: var(--color-accent-gold, #fbbf24);
                    color: black;
                    border: 1px solid var(--color-accent-gold, #fbbf24);
                }
                .editor-btn-primary:hover:not(:disabled) {
                    background: #f59e0b;
                    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
                }
                .editor-handle {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: var(--color-accent-gold, #fbbf24);
                    border: 1px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    z-index: 15;
                }
            `}</style>

            <div className="admin-card" style={{
                width: '100%',
                maxWidth: '850px',
                padding: '2rem',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 className="text-xl text-white m-0">Редактор изображения</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                    <button
                        className={`editor-tab ${activeTab === 'crop' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('crop');
                        }}
                    >
                        <Crop size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Обрезка
                    </button>
                    <button
                        className={`editor-tab ${activeTab === 'bg-remove' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('bg-remove');
                        }}
                    >
                        <Scissors size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Удаление фона
                    </button>
                </div>

                {/* Main View Area */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: '#0f172a', borderRadius: '12px', minHeight: '350px', marginBottom: '1.5rem' }}>
                    <div style={checkerboardStyle} ref={containerRef}>
                        <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', maxHeight: '55vh', height: 'auto', objectFit: 'contain' }} />

                        {/* AI Loading Overlay */}
                        {isAiLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(15, 23, 42, 0.85)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                zIndex: 20
                            }}>
                                <style>{`
                                    @keyframes ai-spin {
                                        from { transform: rotate(0deg); }
                                        to { transform: rotate(360deg); }
                                    }
                                    .ai-spinner {
                                        animation: ai-spin 1.5s linear infinite;
                                        color: #a78bfa;
                                    }
                                `}</style>
                                <Sparkles size={40} className="ai-spinner" />
                                <div style={{ color: 'white', fontWeight: '500', fontSize: '14px', textAlign: 'center', padding: '0 20px' }}>{aiStatusText}</div>
                            </div>
                        )}

                        {/* Interactive Crop Overlay */}
                        {activeTab === 'crop' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
                                {/* Darkened Backdrop regions */}
                                <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: `${crop.y}%`, background: 'rgba(0,0,0,0.6)' }} />
                                <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, top: `${crop.y + crop.height}%`, background: 'rgba(0,0,0,0.6)' }} />
                                <div style={{ position: 'absolute', left: 0, top: `${crop.y}%`, bottom: `${100 - crop.y - crop.height}%`, width: `${crop.x}%`, background: 'rgba(0,0,0,0.6)' }} />
                                <div style={{ position: 'absolute', right: 0, top: `${crop.y}%`, bottom: `${100 - crop.y - crop.height}%`, left: `${crop.x + crop.width}%`, background: 'rgba(0,0,0,0.6)' }} />

                                {/* Interactive Crop Selection Box */}
                                <div 
                                    style={{
                                        position: 'absolute',
                                        left: `${crop.x}%`,
                                        top: `${crop.y}%`,
                                        width: `${crop.width}%`,
                                        height: `${crop.height}%`,
                                        border: '2px dashed var(--color-accent-gold, #fbbf24)',
                                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0)',
                                        cursor: 'move'
                                    }}
                                    onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                                >
                                    {/* Corner handles */}
                                    <div className="editor-handle" style={{ top: -6, left: -6, cursor: 'nwse-resize' }} onMouseDown={(e) => handleCropMouseDown(e, 'tl')} />
                                    <div className="editor-handle" style={{ top: -6, right: -6, cursor: 'nesw-resize' }} onMouseDown={(e) => handleCropMouseDown(e, 'tr')} />
                                    <div className="editor-handle" style={{ bottom: -6, left: -6, cursor: 'nesw-resize' }} onMouseDown={(e) => handleCropMouseDown(e, 'bl')} />
                                    <div className="editor-handle" style={{ bottom: -6, right: -6, cursor: 'nwse-resize' }} onMouseDown={(e) => handleCropMouseDown(e, 'br')} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Tools & Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="editor-btn" onClick={handleUndo} disabled={history.length === 0} title="Отменить последнее действие">
                            <RotateCcw size={16} /> Назад
                        </button>
                        <button className="editor-btn" onClick={handleReset} disabled={!hasChanges} title="Сбросить к оригиналу">
                            <Trash2 size={16} /> Сбросить
                        </button>
                    </div>

                    {/* Crop Tab Controls */}
                    {activeTab === 'crop' && (
                        <button className="editor-btn editor-btn-primary" onClick={applyCrop}>
                            <Crop size={16} /> Применить обрезку
                        </button>
                    )}

                    {/* Background Removal Tab Controls */}
                    {activeTab === 'bg-remove' && (
                        <button
                            className="editor-btn editor-btn-primary"
                            style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={handleAiBackgroundRemoval}
                            disabled={isAiLoading || isSaving}
                            title="Автоматическое удаление фона с помощью ИИ (RMBG-2.0)"
                        >
                            <Sparkles size={16} />
                            {isAiLoading ? 'Обработка ИИ...' : 'ИИ Удаление фона'}
                        </button>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="editor-btn" onClick={onClose} disabled={isSaving}>Отмена</button>
                        <button className="editor-btn editor-btn-primary" onClick={handleSave} disabled={isSaving || !hasChanges}>
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
