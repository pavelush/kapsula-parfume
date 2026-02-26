import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "Как отличить оригинальную парфюмерию?",
        answer: "Самый главный вопрос, которым задаются все покупатели. При покупке ароматов обязательно внимательно рассмотрите коробку — на ней должны быть чётко выведены буквы, слюда, в которой упакован парфюм, также должна быть идеально запечатана. Флакон аромата должен быть идеальным, без каких-либо изъянов, ровным, а каждая надпись — чёткой."
    },
    {
        question: "Какой срок у парфюма?",
        answer: "Из-за законодательных ограничений производитель должен указывать срок годности товара. Но при использовании оригинальной парфюмерии, основанной на оригинальных ингредиентах, срок хранения может достигать 30–40 лет. Для идеального хранения лучше хранить в тёмном месте, избегая солнечных лучей. Не стоит хранить парфюмерию в ванной комнате."
    },
    {
        question: "Что такое тестер и чем он отличается от аромата в упаковке?",
        answer: "Тестер — это рекламный вариант аромата. Есть одно отличие: он идёт в неподарочной упаковке и иногда может идти без крышки. По концентрации и стойкости он такой же, как и аромат в подарочной упаковке."
    },
    {
        question: "Что такое нишевая парфюмерия?",
        answer: "Это не коммерческий вид парфюмерии, который поддерживает собственное существование благодаря нестандартному подходу к созданию парфюмерной пирамиды. Нишевая парфюмерия не имеет массированного рекламного продвижения и является искусством создания ароматов, не ориентированным на большую аудиторию. Она характеризуется очень яркими и неоднозначными композициями, которые не могут позволить себе массовые производители, поскольку в этом случае создатель не ограничен бюджетными рамками и может в полной мере раскрыть свой талант.\nК нишевой парфюмерии относятся такие бренды, как Amouage, By Kilian, Escentric Molecules, Juliette has a Gun, Montale, Ex Nihilo, Byredo и т. д."
    },
    {
        question: "Что такое унисекс-ароматы?",
        answer: "Это категория ароматов, которые одинаково подходят мужчинам и женщинам. В этих ароматах создатели берут традиционно мужские компоненты и совмещают их с женственными аккордами и наоборот."
    },
    {
        question: "Почему на всех людях ароматы раскрываются по-разному?",
        answer: "Это зависит от индивидуальных особенностей кожи, возраста, гормонального фона человека, жирового состава кожи и многих других факторов. Ещё очень важную роль играет настроение и внутренние ощущения человека.\nТак как при плохом настроении или когда человек расстроен, аромат раскроется иначе и может даже показаться не очень приятным — в этом и вся нишевая парфюмерия."
    },
    {
        question: "Почему через некоторое время ежедневного использования я перестаю слышать свой любимый аромат?",
        answer: "После частого использования парфюма чаще всего бывает привыкание к нему, и вы его не слышите. В таких случаях лучше на какое-то время отложить и пользоваться другими ароматами."
    },
    {
        question: "Как долго держится парфюм на коже?",
        answer: "У всех по-разному. Обычно держится от 4 до 8 часов на коже."
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
