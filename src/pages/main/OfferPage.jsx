import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                    <p style={{ marginBottom: '1rem' }}>1.1. Настоящий документ является публичной офертой (предложением) Общества с ограниченной ответственностью «КАПСУЛА» (сокращённо ООО «КАПСУЛА»), ИНН 0800028615, ОГРН 1250800003035, дата регистрации 28.03.2025 г. (далее — «Продавец»), адресованной неопределённому кругу физических лиц (далее — «Покупатель»), заключить договор розничной купли-продажи товаров на условиях, изложенных ниже.</p>
                    <p style={{ marginBottom: '1rem' }}>1.2. Акцепт оферты (принятие её условий) происходит в момент оформления Заказа на Сайте https://kapsula-parfume.ru/ (далее — «Сайт») и нажатия кнопки «Оформить заказ» / «Подтвердить» / аналогичной, либо при оплате Заказа.</p>
                    <p style={{ marginBottom: '1rem' }}>1.3. Момент заключения Договора — момент получения Продавцом оформленного Заказа от Покупателя.</p>
                    <p style={{ marginBottom: '1rem' }}>1.4. Текст оферты размещён по постоянному адресу: <a href="https://kapsula-parfume.ru/oferta" style={{ color: 'var(--color-accent-gold)' }}>https://kapsula-parfume.ru/oferta</a></p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>2. Термины и определения</h3>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Товар</strong> — парфюмерно-косметическая продукция (духи, парфюмерная вода, туалетная вода, одеколон, нишевые ароматы и иные аналогичные товары), представленная к продаже на Сайте.</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Заказ</strong> — запрос Покупателя на приобретение и доставку выбранных Товаров, оформленный на Сайте.</p>
                    <p style={{ marginBottom: '1rem' }}><strong>Сайт</strong> — интернет-магазин Продавца по адресу <a href="https://kapsula-parfume.ru/" style={{ color: 'var(--color-accent-gold)' }}>https://kapsula-parfume.ru/</a></p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>3. Предмет договора</h3>
                    <p style={{ marginBottom: '1rem' }}>3.1. Продавец обязуется передать Покупателю Товар в собственность, а Покупатель обязуется принять и оплатить Товар на условиях настоящей оферты.</p>
                    <p style={{ marginBottom: '1rem' }}>3.2. Наименование, артикул, объём, страна-производитель, цена, состав (при наличии), срок годности и иные характеристики Товара указаны в карточке Товара на Сайте и фиксируются в Заказе.</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>4. Цена и порядок оплаты</h3>
                    <p style={{ marginBottom: '1rem' }}>4.1. Цены на Товар указаны в рублях Российской Федерации, включая НДС (при наличии), и действительны на момент оформления Заказа.</p>
                    <p style={{ marginBottom: '1rem' }}>4.2. Оплата производится одним из способов, предложенных на Сайте (банковские карты, СБП, иные доступные методы).</p>
                    <p style={{ marginBottom: '1rem' }}>4.3. Оплата считается произведённой с момента поступления денежных средств на расчётный счёт Продавца или подтверждения платёжной системой.</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>5. Доставка товара</h3>
                    <p style={{ marginBottom: '1rem' }}>5.1. Доставка осуществляется по адресу, указанному Покупателем при оформлении Заказа.</p>
                    <p style={{ marginBottom: '1rem' }}>5.2. Стоимость и сроки доставки рассчитываются автоматически на Сайте или сообщаются менеджером.</p>
                    <p style={{ marginBottom: '1rem' }}>5.3. Риск случайной гибели или повреждения Товара переходит к Покупателю с момента передачи Товара курьером / в пункте выдачи / Почтой России.</p>
                    <p style={{ marginBottom: '1rem' }}>5.4. При получении Товара Покупатель обязан проверить комплектность, целостность упаковки и отсутствие видимых повреждений.</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>6. Возврат и обмен товара</h3>
                    <p style={{ marginBottom: '1rem' }}>6.1. Покупатель вправе отказаться от Товара в любое время до передачи, а после передачи — в течение 7 (семи) календарных дней при условии сохранения товарного вида, потребительских свойств, пломб, фабричных ярлыков и чека.</p>
                    <p style={{ marginBottom: '1rem' }}>6.2. Парфюмерно-косметическая продукция надлежащего качества возврату или обмену не подлежит (п. 3 Перечня непродовольственных товаров надлежащего качества, не подлежащих возврату, утв. Постановлением Правительства РФ № 55 от 31.12.2020).</p>
                    <p style={{ marginBottom: '1rem' }}>6.3. Возврат денежных средств за Товар ненадлежащего качества или при отказе до передачи осуществляется в течение 10 (десяти) дней с момента получения Продавцом заявления и возвращённого Товара (при необходимости).</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>7. Ответственность сторон</h3>
                    <p style={{ marginBottom: '1rem' }}>7.1. Продавец не несёт ответственности за вред, причинённый Покупателю вследствие неправильного использования Товара.</p>
                    <p style={{ marginBottom: '1rem' }}>7.2. В случае просрочки доставки по вине Продавца уплачивается неустойка 0,5 % от стоимости Товара за каждый день просрочки, но не более 5 % от стоимости Заказа.</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>8. Персональные данные</h3>
                    <p style={{ marginBottom: '1rem' }}>8.1. Акцептуя оферту, Покупатель даёт согласие на обработку персональных данных в соответствии с Политикой конфиденциальности, размещённой на Сайте.</p>

                    <h3 style={{ color: 'white', marginBottom: '1.2rem', marginTop: '2.5rem', fontSize: '1.4rem' }}>9. Прочие условия</h3>
                    <p style={{ marginBottom: '1rem' }}>9.1. К отношениям Сторон применяются нормы законодательства Российской Федерации.</p>
                    <p style={{ marginBottom: '1rem' }}>9.2. Все споры разрешаются путём переговоров. При недостижении согласия — в суде по месту нахождения Продавца.</p>
                    <p style={{ marginBottom: '1rem' }}>9.3. Продавец вправе вносить изменения в оферту. Новая редакция вступает в силу с момента размещения на Сайте.</p>

                    <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h4 style={{ color: 'white', marginBottom: '1rem' }}>Реквизиты Продавца</h4>
                        <p style={{ marginBottom: '0.5rem' }}>Общество с ограниченной ответственностью «КАПСУЛА»</p>
                        <p style={{ marginBottom: '0.5rem' }}>ИНН: 0800028615</p>
                        <p style={{ marginBottom: '0.5rem' }}>ОГРН: 1250800003035 (дата регистрации: 28.03.2025)</p>
                        <p style={{ marginBottom: '0.5rem' }}>Юридический адрес: 358000, Россия, Республика Калмыкия, г. Элиста, ул. им. Губаревича, д. 5, офис 402</p>
                        <p style={{ marginBottom: '0.5rem' }}>Генеральный директор: Зинковская Мария Алексеевна</p>
                        <p style={{ marginBottom: '0.5rem' }}>Банк: ВТБ (ПАО)</p>
                        <p style={{ marginBottom: '0.5rem' }}>БИК: 044525411</p>
                        <p style={{ marginBottom: '0.5rem' }}>Корреспондентский счёт: 30101810145250000411</p>
                        <p style={{ marginBottom: '0.5rem' }}>Расчётный счёт: 40702810300810034409</p>
                        <p style={{ marginBottom: '0.5rem' }}>Телефон: +7 (916) 203-54-94</p>
                        <p style={{ marginBottom: '0.5rem' }}>Электронная почта: capsulap@yandex.ru</p>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Дата размещения текущей редакции оферты: 12 марта 2026 г.</p>
                    </div>
                </div>
            </main>

            <footer style={{ background: 'var(--color-bg-secondary)', padding: '2rem 5%', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>© {new Date().getFullYear()} Kapsula Parfume. Все права защищены.</p>
            </footer>
        </div>
    );
}
