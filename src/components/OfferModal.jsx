import React from 'react';
import { X } from 'lucide-react';

export default function OfferModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s forwards', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 18, 20, 0.95)' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>
                        Публичная оферта
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem', background: 'var(--color-bg)', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>1. Общие положения</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', listStyleType: 'none' }}>
                        <li style={{ marginBottom: '0.8rem' }}>1.1. Настоящий документ является публичной офертой (предложением) Общества с ограниченной ответственностью «КАПСУЛА» (сокращённо ООО «КАПСУЛА»), ИНН 0800028615, ОГРН 1250800003035, дата регистрации 28.03.2025 г. (далее — «Продавец»), адресованной неопределённому кругу физических лиц (далее — «Покупатель»), заключить договор розничной купли-продажи товаров на условиях, изложенных ниже.</li>
                        <li style={{ marginBottom: '0.8rem' }}>1.2. Акцепт оферты (принятие её условий) происходит в момент оформления Заказа на Сайте https://kapsula-parfume.ru/ (далее — «Сайт») и нажатия кнопки «Оформить заказ» / «Подтвердить» / аналогичной, либо при оплате Заказа.</li>
                        <li style={{ marginBottom: '0.8rem' }}>1.3. Момент заключения Договора — момент получения Продавцом оформленного Заказа от Покупателя.</li>
                        <li>1.4. Текст оферты размещен по постоянному адресу: https://kapsula-parfume.ru/oferta</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>2. Термины и определения</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', listStyleType: 'none' }}>
                        <li style={{ marginBottom: '0.8rem' }}>2.1. <strong>Публичная оферта</strong> (далее – «Оферта») — публичное предложение Продавца, адресованное неопределенному кругу лиц, заключить с Продавцом договор купли-продажи товара дистанционным способом (далее — «Договор») на условиях, содержащихся в настоящей Оферте.</li>
                        <li style={{ marginBottom: '0.8rem' }}>2.2. Товаром по настоящей оферте являются:
                            <ul style={{ listStyleType: 'disc', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', paddingLeft: '20px' }}>
                                <li><strong>Отливанты</strong> — парфюмерно-косметическая продукция, перефасованная Продавцом из оригинальных флаконов производителей в атомайзеры меньшего объема (3 мл, 5 мл, 10 мл, 100 мл) для целей ознакомления и удобного использования.</li>
                                <li><strong>Атомайзеры/Капсулы</strong> — пустая парфюмерная тара (металлические или стеклянные флаконы с распылителем), не содержащая парфюмерной композиции.</li>
                            </ul>
                        </li>
                        <li style={{ marginBottom: '0.8rem' }}>2.3. <strong>Заказ</strong> — запрос Покупателя на приобретение и доставку выбранных Товаров, оформленный на Сайте или сделанный по телефону +7 (916) 203-54-94.</li>
                        <li style={{ marginBottom: '0.8rem' }}>2.4. <strong>Сайт</strong> — интернет-магазин Продавца по адресу https://kapsula-parfume.ru/</li>
                        <li>2.5. <strong>Каталог</strong> — перечень Товаров, предлагаемых Продавцом к продаже через Сайт, содержащий наименование, основные характеристики, описание и цены Товаров, размещенный в соответствующем разделе Сайта.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>3. Общие положения акцепта</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', listStyleType: 'none' }}>
                        <li style={{ marginBottom: '0.8rem' }}>3.1. Заказ Покупателем Товара, размещенного на Сайте, означает, что Покупатель согласен со всеми условиями настоящей Оферты.</li>
                        <li style={{ marginBottom: '0.8rem' }}>3.2. Администрация Сайта имеет право вносить изменения в Оферту без уведомления Покупателя, в связи с чем Покупатель обязуется регулярно отслеживать изменения в Оферте. Новая редакция вступает в силу с момента размещения на Сайте.</li>
                        <li style={{ marginBottom: '0.8rem' }}>3.3. Продавец производит ознакомление Покупателя с настоящей Офертой путем ее размещения на Сайте в разделе «Публичная оферта» на странице https://kapsula-parfume.ru/oferta.</li>
                        <li>3.4. Покупатель обязуется до момента оформления Заказа ознакомиться с содержанием и условиями, установленными в настоящей Оферте.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>4. Предмет договора</h3>
                    <p style={{ marginBottom: '1.5rem' }}>4.1. Продавец обязуется передать Покупателю Товар в собственность, а Покупатель обязуется принять и оплатить Товар на условиях настоящей оферты.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>5. Цена и порядок оплаты</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', listStyleType: 'none' }}>
                        <li style={{ marginBottom: '0.8rem' }}>5.1. Цены на Товар указаны в рублях Российской Федерации и действительны на момент оформления Заказа.</li>
                        <li style={{ marginBottom: '0.8rem' }}>5.2. Оплата производится способами, предложенными на Сайте.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>6. Оформление заказа</h3>
                    <p style={{ marginBottom: '1.5rem' }}>6.1. Заказ Товара осуществляется Покупателем через Сайт или по телефону +7 (916) 203-54-94.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>7. Доставка и передача товара покупателю</h3>
                    <p style={{ marginBottom: '1.5rem' }}>7.1. Продавец оказывает Покупателю услуги по доставке Товара одним из способов, указанных на сайте.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>8. Возврат и обмен товара</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', listStyleType: 'none' }}>
                        <li style={{ marginBottom: '0.8rem' }}>8.1. Отливанты (парфюмерная продукция надлежащего качества) возврату и обмену не подлежат.</li>
                        <li>8.2. Пустые атомайзеры надлежащего качества могут быть возвращены Покупателем в течение 7 дней.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>9. Ответственность сторон</h3>
                    <p style={{ marginBottom: '1.5rem' }}>9.1. Продавец не несёт ответственности за вред, причинённый Покупателю вследствие неправильного использования Товара.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>10. Конфиденциальность и данные</h3>
                    <p style={{ marginBottom: '1.5rem' }}>10.1. Отношения регулируются Политикой в отношении обработки персональных данных, размещенной на Сайте.</p>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', fontSize: '0.9rem' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.8rem' }}>Реквизиты Продавца</h4>
                        <p style={{ marginBottom: '0.3rem' }}>ООО «КАПСУЛА»</p>
                        <p style={{ marginBottom: '0.3rem' }}>ИНН/КПП: 0800028615</p>
                        <p style={{ marginBottom: '0.3rem' }}>ОГРН: 1250800003035</p>
                        <p style={{ marginBottom: '0.3rem' }}>Юр. адрес: 358000, г. Элиста, ул. Губаревича, д. 5, офис 402</p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
