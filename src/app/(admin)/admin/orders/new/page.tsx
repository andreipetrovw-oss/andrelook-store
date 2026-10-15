import {
  AcquisitionChannel,
  ContactMethod,
  DeliveryMode,
  Locale,
  OrderStatus,
  PaymentKind,
} from "@prisma/client";

import { createManualOrder } from "@/app/(admin)/admin/actions";
import { getManualOrderProducts } from "@/lib/tracking/admin";

export default async function NewManualOrderPage() {
  const products = await getManualOrderProducts();
  return (
    <>
      <span className="eyebrow">Instagram · Telegram · прямые продажи</span>
      <h1>Создать заказ</h1>
      <p className="admin-overview-note">
        Вводите только реальные подтверждённые данные. Заказ получит обычный
        номер AL, защищённую страницу отслеживания и ту же логистическую
        инфраструктуру, что заказ с сайта.
      </p>
      <form action={createManualOrder} className="admin-stack-form admin-panel">
        <h2>Клиент</h2>
        <div className="admin-form-grid">
          <label>
            <span>Имя клиента</span>
            <input name="customerName" required />
          </label>
          <label>
            <span>Email</span>
            <input name="customerEmail" type="email" />
          </label>
          <label>
            <span>Телефон</span>
            <input name="customerPhone" />
          </label>
          <label>
            <span>Предпочтительный контакт</span>
            <select defaultValue="TELEGRAM" name="contactMethod">
              {Object.values(ContactMethod).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Контакт</span>
            <input name="contactValue" required />
          </label>
          <label>
            <span>Язык</span>
            <select defaultValue="RU" name="locale">
              {Object.values(Locale).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Источник</span>
            <select defaultValue="DIRECT" name="acquisitionChannel">
              {Object.values(AcquisitionChannel).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2>Товары</h2>
        {[0, 1, 2].map((row) => (
          <fieldset className="admin-item-row" key={row}>
            <legend>
              {row === 0 ? "Основной товар" : `Дополнительный товар ${row}`}
            </legend>
            <label>
              <span>Товар</span>
              <select name="productId" required={row === 0}>
                <option value="">
                  {row === 0 ? "Выберите товар" : "Не добавлять"}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.internalCode} ·{" "}
                    {product.translations[0]?.name ?? "Без названия"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Цвет</span>
              <input name="colour" />
            </label>
            <label>
              <span>Размер</span>
              <input name="size" />
            </label>
            <label>
              <span>Количество</span>
              <input defaultValue="1" min="1" name="quantity" type="number" />
            </label>
            <label>
              <span>Цена за единицу, EUR</span>
              <input
                min="0"
                name="unitPrice"
                required={row === 0}
                step="0.01"
                type="number"
              />
            </label>
          </fieldset>
        ))}

        <h2>Получение и оплата</h2>
        <div className="admin-form-grid">
          <label>
            <span>Маршрут</span>
            <select defaultValue="PERSONAL_HANDOVER" name="deliveryMode">
              {Object.values(DeliveryMode).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Страна</span>
            <input
              defaultValue="EE"
              maxLength={2}
              name="countryCode"
              required
            />
          </label>
          <label>
            <span>Город</span>
            <input defaultValue="Tallinn" name="city" />
          </label>
          <label>
            <span>Адрес</span>
            <input name="addressLine1" />
          </label>
          <label>
            <span>Адрес 2</span>
            <input name="addressLine2" />
          </label>
          <label>
            <span>Индекс</span>
            <input name="postalCode" />
          </label>
          <label>
            <span>Валюта</span>
            <input defaultValue="EUR" maxLength={3} name="currency" required />
          </label>
          <label>
            <span>Статус заказа</span>
            <select defaultValue="NEW" name="status">
              {Object.values(OrderStatus).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Тип оплаты (если есть)</span>
            <select defaultValue="" name="paymentKind">
              <option value="">Нет оплаты</option>
              {Object.values(PaymentKind).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Оплачено, EUR</span>
            <input min="0" name="paymentAmount" step="0.01" />
          </label>
        </div>
        <label>
          <span>Внутренняя заметка</span>
          <textarea name="notes" rows={4} />
        </label>
        <button type="submit">Создать реальный заказ</button>
      </form>
    </>
  );
}
