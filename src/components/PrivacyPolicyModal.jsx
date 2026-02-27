import React from 'react';
import { X } from 'lucide-react';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s forwards', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 18, 20, 0.95)' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>
                        Политика конфиденциальности
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--color-bg)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>1. Общие положения</h3>
                    <p style={{ marginBottom: '1rem' }}>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. № 152-ФЗ «О персональных данных» (далее — Закон о персональных данных) и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые <strong>ООО "КАПСУЛА"</strong> (далее — Оператор).</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>1.1. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.</li>
                        <li>1.2. Настоящая политика Оператора в отношении обработки персональных данных (далее — Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта <code>http://kapsula-parfume.ru</code>.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>2. Основные понятия, используемые в Политике</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>2.1. <strong>Автоматизированная обработка персональных данных</strong> — обработка персональных данных с помощью средств вычислительной техники.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.2. <strong>Блокирование персональных данных</strong> — временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных).</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.3. <strong>Веб-сайт</strong> — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу <code>http://kapsula-parfume.ru</code>.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.4. <strong>Информационная система персональных данных</strong> — совокупность содержащихся в базах данных персональных данных и обеспечивающих их обработку информационных технологий и технических средств.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.5. <strong>Обезличивание персональных данных</strong> — действия, в результате которых невозможно определить без использования дополнительной информации принадлежность персональных данных конкретному Пользователю или иному субъекту персональных данных.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.6. <strong>Обработка персональных данных</strong> — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.7. <strong>Оператор</strong> — государственный орган, муниципальный орган, юридическое или физическое лицо, самостоятельно или совместно с другими лицами организующие и/или осуществляющие обработку персональных данных.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.8. <strong>Персональные данные</strong> — любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта <code>http://kapsula-parfume.ru</code>.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.9. <strong>Персональные данные, разрешенные субъектом для распространения</strong> — данные, доступ к которым предоставлен субъектом путем дачи согласия на распространение.</li>
                        <li style={{ marginBottom: '0.5rem' }}>2.10. <strong>Пользователь</strong> — любой посетитель веб-сайта <code>http://kapsula-parfume.ru</code>.</li>
                        <li>2.11. <strong>Предоставление персональных данных</strong> — действия, направленные на раскрытие персональных данных определенному лицу или кругу лиц.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>3. Основные права и обязанности Оператора</h3>
                    <p style={{ marginBottom: '1rem' }}>Оператор имеет право получать достоверную информацию от субъекта и обязан организовывать обработку в соответствии с законодательством РФ, отвечать на запросы и обеспечивать безопасность данных.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>4. Основные права и обязанности субъектов персональных данных</h3>
                    <p style={{ marginBottom: '1rem' }}>Субъекты имеют право на получение информации об обработке, уточнение, блокирование или уничтожение неполных или неточных данных, а также на отзыв согласия.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>5. Принципы обработки персональных данных</h3>
                    <p style={{ marginBottom: '1rem' }}>Обработка осуществляется на законной основе, ограничивается достижением конкретных целей. Не допускается избыточность данных.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>6. Цели обработки персональных данных</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Цель:</strong> Информирование Пользователя посредством отправки электронных писем.</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Персональные данные:</strong> Фамилия, имя, отчество; Электронный адрес; Номера телефонов; Год, месяц, дата и место рождения; Адрес фактического места проживания и регистрации.</li>
                        <li><strong>Правовые основания:</strong> Уставные документы Оператора.</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>7. Условия обработки персональных данных</h3>
                    <p style={{ marginBottom: '1rem' }}>Обработка осуществляется с согласия субъекта, либо в случаях, предусмотренных законом для исполнения договора, стороной которого является субъект.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>8. Порядок сбора, хранения, передачи и других видов обработки</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>8.1. Оператор обеспечивает сохранность и исключает доступ неуполномоченных лиц.</li>
                        <li style={{ marginBottom: '0.5rem' }}>8.2. Данные никогда не передаются третьим лицам, за исключением случаев исполнения законодательства.</li>
                        <li style={{ marginBottom: '0.5rem' }}>8.3. Пользователь может актуализировать данные через почту <code>kapsula-parfume@yandex.ru</code>.</li>
                        <li>8.4. Согласие может быть отозвано письмом на тот же адрес с пометкой «Отзыв согласия».</li>
                    </ul>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>9. Перечень действий с полученными персональными данными</h3>
                    <p style={{ marginBottom: '1rem' }}>Оператор осуществляет сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу, обезличивание, блокирование, удаление и уничтожение данных.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>10. Трансграничная передача персональных данных</h3>
                    <p style={{ marginBottom: '1rem' }}>Оператор обязан уведомить уполномоченный орган до начала трансграничной передачи данных.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>11. Конфиденциальность персональных данных</h3>
                    <p style={{ marginBottom: '1rem' }}>Оператор и иные лица, получившие доступ к данным, обязаны не раскрывать их третьим лицам без согласия субъекта.</p>

                    <h3 style={{ color: 'white', marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>12. Заключительные положения</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>12.1. Пользователь может получить разъяснения через <code>kapsula-parfume@yandex.ru</code>.</li>
                        <li style={{ marginBottom: '0.5rem' }}>12.2. Политика действует бессрочно до замены новой версией.</li>
                        <li>12.3. Актуальная версия доступна по адресу: <code>http://kapsula-parfume.ru/privacy</code>.</li>
                    </ul>
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
