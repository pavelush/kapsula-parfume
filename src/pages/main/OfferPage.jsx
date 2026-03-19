import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function OfferPage() {
    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)', scrollBehavior: 'smooth' }}>
            <header style={{ padding: '2rem 5%', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img src="/images/logo/logo.png" alt="Kapsula Parfume Logo" style={{ height: '40px' }} />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Главная</Link>
                        <ChevronRight size={14} />
                        <span style={{ color: 'white' }}>Публичная оферта</span>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '4rem 5%', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    Публичная <span className="text-gradient-gold">оферта</span>
                </h1>

                <div className="glass-card" style={{ padding: '3rem', fontSize: '1.05rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>1. Общие положения</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>1.1. Настоящий документ является публичной офертой (предложением) Общества с ограниченной ответственностью «КАПСУЛА» (сокращённо ООО «КАПСУЛА»), ИНН 0800028615, ОГРН 1250800003035, дата регистрации 28.03.2025 г. (далее — «Продавец»), адресованной неопределённому кругу физических лиц (далее — «Покупатель»), заключить договор розничной купли-продажи товаров на условиях, изложенных ниже.</li>
                        <li style={{ marginBottom: '0.8rem' }}>1.2. Акцепт оферты (принятие её условий) происходит в момент оформления Заказа на Сайте https://kapsula-parfume.ru/ (далее — «Сайт») и нажатия кнопки «Оформить заказ» / «Подтвердить» / аналогичной, либо при оплате Заказа.</li>
                        <li style={{ marginBottom: '0.8rem' }}>1.3. Момент заключения Договора — момент получения Продавцом оформленного Заказа от Покупателя.</li>
                        <li>1.4. Текст оферты размещен по постоянному адресу: <a href="https://kapsula-parfume.ru/oferta" style={{ color: 'var(--color-accent-gold)' }}>https://kapsula-parfume.ru/oferta</a></li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>2. Термины и определения</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}><strong>Товар</strong> — парфюмерно-косметическая продукция (духи, парфюмерная вода, туалетная вода, одеколон, нишевые ароматы и иные аналогичные товары), представленная к продаже на Сайте.</li>
                        <li style={{ marginBottom: '0.8rem' }}><strong>Заказ</strong> — запрос Покупателя на приобретение и доставку выбранных Товаров, оформленный на Сайте.</li>
                        <li><strong>Сайт</strong> — интернет-магазин Продавца по адресу <a href="https://kapsula-parfume.ru/" style={{ color: 'var(--color-accent-gold)' }}>https://kapsula-parfume.ru/</a></li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>3. Предмет договора</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>3.1. Продавец обязуется передать Покупателю Товар в собственность, а Покупатель обязуется принять и оплатить Товар на условиях настоящей оферты.</li>
                        <li>3.2. Наименование, артикул, объём, страна-производитель, цена, состав (при наличии), срок годности и иные характеристики Товара указаны в карточке Товара на Сайте и фиксируются в Заказе.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>4. Цена и порядок оплаты</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>4.1. Цены на Товар указаны в рублях Российской Федерации, включая НДС (при наличии), и действительны на момент оформления Заказа.</li>
                        <li style={{ marginBottom: '0.8rem' }}>4.2. Оплата производится одним из способов, предложенных на Сайте (банковские карты, СБП, иные доступные методы).</li>
                        <li style={{ marginBottom: '0.8rem' }}>4.3. Оплата считается произведённой с момента поступления денежных средств на расчётный счёт Продавца или подтверждения платёжной системой.</li>
                        <li>4.4. Обработка платежей осуществляется процессинговым центром. Данные банковских карт Покупателя надежно защищены протоколом SSL и не передаются Продавцу (ООО «КАПСУЛА»).</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>5. Доставка товара</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>5.1. Доставка осуществляется по адресу, указанному Покупателем при оформлении Заказа.</li>
                        <li style={{ marginBottom: '0.8rem' }}>5.2. Стоимость и сроки доставки рассчитываются автоматически на Сайте или сообщаются менеджером.</li>
                        <li style={{ marginBottom: '0.8rem' }}>5.3. Риск случайной гибели или повреждения Товара переходит к Покупателю с момента передачи Товара курьером / в пункте выдачи / Почтой России.</li>
                        <li>5.4. При получении Товара Покупатель обязан проверить комплектность, целостность упаковки и отсутствие видимых повреждений.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>6. Возврат и обмен товара</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>6.1. Покупатель вправе отказаться от Товара в любое время до передачи, а после передачи — в течение 7 (семи) календарных дней при условии сохранения товарного вида, потребительских свойств, пломб, фабричных ярлыков и чека.</li>
                        <li style={{ marginBottom: '0.8rem' }}>6.2. Парфюмерно-косметическая продукция надлежащего качества возврату или обмену не подлежит (п. 3 Перечня непродовольственных товаров надлежащего качества, не подлежащих возврату, утв. Постановлением Правительства РФ № 55 от 31.12.2020).</li>
                        <li style={{ marginBottom: '0.8rem' }}>6.3. Возврат денежных средств за Товар ненадлежащего качества или при отказе до передачи осуществляется в течение 10 (десяти) дней с момента получения Продавцом заявления и возвращённого Товара (при необходимости).</li>
                        <li>6.4. При отмене Заказа или возврате Товара возврат денежных средств производится строго на ту банковскую карту (или банковский счет), с которой была произведена оплата. Срок зачисления средств зависит от банка-эмитента Покупателя (от 5 до 30 рабочих дней).</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>7. Ответственность сторон</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>7.1. Продавец не несёт ответственности за вред, причинённый Покупателю вследствие неправильного использования Товара.</li>
                        <li>7.2. В случае просрочки доставки по вине Продавца уплачивается неустойка 0,5 % от стоимости Товара за каждый день просрочки, но не более 5 % от стоимости Заказа.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>8. Персональные данные</h3>
                    <p style={{ marginBottom: '2rem' }}>8.1. Акцептуя оферту, Покупатель даёт согласие на обработку персональных данных в соответствии с Политикой конфиденциальности, размещённой на Сайте.</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>9. Прочие условия</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '2rem' }}>
                        <li style={{ marginBottom: '0.8rem' }}>9.1. К отношениям Сторон применяются нормы законодательства Российской Федерации.</li>
                        <li style={{ marginBottom: '0.8rem' }}>9.2. Все споры разрешаются путём переговоров. При недостижении согласия — в суде по месту нахождения Продавца.</li>
                        <li>9.3. Продавец вправе вносить изменения в оферту. Новая редакция вступает в силу с момента размещения на Сайте.</li>
                    </ul>

                    <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Реквизиты Продавца</h4>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                            <p style={{ marginBottom: '0.4rem' }}>Общество с ограниченной ответственностью «КАПСУЛА»</p>
                            <p style={{ marginBottom: '0.4rem' }}>ИНН: 0800028615</p>
                            <p style={{ marginBottom: '0.4rem' }}>ОГРН: 1250800003035 (дата регистрации: 28.03.2025)</p>
                            <p style={{ marginBottom: '0.4rem' }}>Юридический адрес: 358000, Россия, Республика Калмыкия, г. Элиста, ул. им. Губаревича, д. 5, офис 402</p>
                            <p style={{ marginBottom: '0.4rem' }}>Генеральный директор: Зинковская Мария Алексеевна</p>
                            <p style={{ marginBottom: '0.4rem' }}>Банк: ВТБ (ПАО)</p>
                            <p style={{ marginBottom: '0.4rem' }}>БИК: 044525411</p>
                            <p style={{ marginBottom: '0.4rem' }}>Корреспондентский счёт: 30101810145250000411</p>
                            <p style={{ marginBottom: '0.4rem' }}>Расчётный счёт: 40702810300810034409</p>
                            <p style={{ marginBottom: '0.4rem' }}>Телефон: +7 (916) 203-54-94</p>
                            <p style={{ marginBottom: '0.4rem' }}>Электронная почта: <a href="mailto:capsulap@yandex.ru" style={{ color: 'var(--color-accent-gold)' }}>capsulap@yandex.ru</a></p>
                            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Дата размещения текущей редакции оферты: 12 марта 2026 г.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
