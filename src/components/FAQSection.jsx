import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "Оригинальная ли у вас парфюмерия?",
        answer: "Да, абсолютно вся парфюмерия в нашем ассортименте является 100% оригинальной. Мы дорожим своей репутацией и закупаем ароматы только у проверенных официальных дистрибьюторов. Готовы предоставить батч-коды по запросу."
    },
    {
        question: "Что такое «распив» и в чем его смысл?",
        answer: "Распив (или отливант) — это переливание парфюма из оригинального большого флакона в маленькие (атомайзеры) объемом 3, 5 или 10 мл. Это позволяет вам познакомиться с дорогим нишевым ароматом без необходимости покупать полноразмерный флакон за десятки тысяч рублей, а также собрать целую коллекцию разных ароматов."
    },
    {
        question: "В какие флаконы вы наливаете парфюм?",
        answer: "Мы используем только качественные стеклянные атомайзеры с надежным металлическим спреем, которые не вступают в реакцию с парфюмом, не парят (не испаряют жидкость) и не протекают во время транспортировки."
    },
    {
        question: "Как быстро вы отправляете заказ?",
        answer: "Большинство заказов мы отправляем в день оформления или на следующий день. Мы бережно упаковываем каждый флакон, чтобы гарантировать его целостность в пути. Доставка осуществляется транспортными компаниями СДЭК или Почтой России."
    },
    {
        question: "На сколько хватает 5 или 10 мл?",
        answer: "В среднем, 5 мл — это около 60-70 полноценных распылений. При ежедневном использовании (2 пшика) этого объема вам хватит примерно на месяц. 10 мл — соответственно, на 2 месяца активного пользования."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0); // Open first by default

    return (
        <section id="faq" className="section" style={{ position: 'relative' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2>Частые <span className="text-gradient">Вопросы</span></h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Всё, что вам нужно знать о распиве и наших ароматах</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {faqs.map((faq, index) => {
                        const isOpen = index === openIndex;
                        return (
                            <div
                                key={index}
                                className="glass-panel"
                                style={{
                                    padding: '0',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    border: isOpen ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)',
                                    boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.3), inset 0 0 20px rgba(139, 92, 246, 0.05)' : 'none'
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                    style={{
                                        width: '100%',
                                        padding: '1.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        color: isOpen ? 'white' : 'var(--color-text-muted)',
                                        textAlign: 'left'
                                    }}
                                >
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, paddingRight: '1rem' }}>
                                        {faq.question}
                                    </h4>
                                    <div style={{
                                        minWidth: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: isOpen ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>

                                <div
                                    style={{
                                        maxHeight: isOpen ? '500px' : '0',
                                        opacity: isOpen ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <div style={{
                                        padding: '0 1.5rem 1.5rem',
                                        color: 'var(--color-text-muted)',
                                        lineHeight: 1.7,
                                        borderTop: isOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        marginTop: isOpen ? '0.5rem' : '0',
                                        paddingTop: isOpen ? '1rem' : '0'
                                    }}>
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
