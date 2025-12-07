type TranslationKeys = keyof typeof translations;

"use client";

import React, { useState } from "react";
import {
  ShoppingCart, User, Search, Heart, ChevronRight, Star, Truck,
  Shield, ArrowLeft, Package, MapPin, Trash2, Plus, Users,
  ShoppingBag, LogOut, TrendingUp
} from "lucide-react";

const AndreLookStore = () => {
  const [currentView, setCurrentView] = useState("home");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [language, setLanguage] = useState("ru");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const translations = {
    ru: {
      home: "Главная",
      brands: "Бренды",
      about: "О нас",
      contact: "Контакты",
      cart: "Корзина",
      account: "Аккаунт",
      admin: "Админ",
      heroTitle: "Премиум одежда европейских брендов",
      heroSubtitle:
        "Оригинальные коллекции Moncler, Parajumpers и CP Company с доставкой по Европе",
      selectBrand: "Выберите бренд",
      catalog: "Смотреть каталог",
      addToCart: "Добавить в корзину",
      checkout: "Оформить заказ",
      backToBrands: "Назад к брендам",
      backToCatalog: "Назад к каталогу",
      emptyCart: "Корзина пуста",
      total: "Итого",
      shipping: "Доставка",
      free: "Бесплатно",
      orderSuccess: "Заказ оформлен!",
      thankYou: "Спасибо за покупку в AndreLook",
      orderDetails: "Детали заказа отправлены на ваш email",
      guarantee: "Гарантия подлинности",
      guaranteeText: "100% оригинальные товары от официальных поставщиков",
      fastShipping: "Быстрая доставка",
      shippingText: "Европа 3-7 дней, Эстония 1-3 дня",
      premium: "Премиум качество",
      premiumText: "Тщательный контроль качества каждого изделия",
      aboutTitle: "О нас",
      aboutText:
        "AndreLook - эксклюзивный бутик премиальной одежды. Оригинальные коллекции ведущих брендов Европы.",
      name: "Имя и фамилия",
      email: "Email",
      phone: "Телефон",
      address: "Адрес доставки",
      paymentMethod: "Способ оплаты",
      confirmOrder: "Подтвердить заказ",
    },
    en: {},
    et: {},
  };

  const t = translations[language as keyof typeof translations];
;
;

  const brands = [
    {
      id: "moncler",
      name: "Moncler",
      image:
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
    },
    {
      id: "parajumpers",
      name: "Parajumpers",
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    },
    {
      id: "cpcompany",
      name: "CP Company",
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
    },
  ];

  const products = {
    moncler: [
      {
        id: 1,
        name: "Maya Down Jacket",
        price: 1450,
        brand: "Moncler",
        image:
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600",
        rating: 5,
        description: {
          ru: "Легендарная пуховая куртка Moncler Maya.",
          en: "",
          et: "",
        },
      },
    ],
    parajumpers: [],
    cpcompany: [],
  };

  const addToCart = (product) => {
    const existing = cart.find((i) => i.id === product.id);

    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) =>
    setCart(cart.filter((item) => item.id !== id));

  const updateQuantity = (id, delta) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const completeOrder = () => {
    setOrderComplete(true);
    setCart([]);

    setTimeout(() => {
      setOrderComplete(false);
      setShowCart(false);
      setCheckoutStep(1);
      setCurrentView("home");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* HEADER */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => {
              setCurrentView("home");
              setSelectedBrand(null);
              setSelectedProduct(null);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-4xl font-serif text-stone-800">AL</span>
            <span className="text-xl text-stone-700 tracking-widest">
              ANDRELOOK
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage("ru")}
              className={`px-2 py-1 rounded text-xs ${
                language === "ru" ? "bg-stone-800 text-white" : "text-stone-600"
              }`}
            >
              RU
            </button>

            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 hover:bg-stone-100 rounded-full"
            >
              <ShoppingCart className="w-5 h-5 text-stone-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HOME PAGE */}
      {currentView === "home" && !selectedBrand && (
        <main className="max-w-7xl mx-auto p-8">
          <h2 className="text-5xl text-stone-800 mb-6">{t.heroTitle}</h2>
          <p className="text-xl text-stone-600 mb-12">{t.heroSubtitle}</p>

          <h3 className="text-3xl text-stone-800 mb-8">{t.selectBrand}</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition"
                onClick={() => {
                  setSelectedBrand(brand.id);
                  setCurrentView("catalog");
                }}
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="h-80 w-full object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl text-stone-800">{brand.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PRODUCT CATALOG */}
      {currentView === "catalog" && selectedBrand && (
        <main className="max-w-7xl mx-auto p-8">
          <button
            onClick={() => {
              setSelectedBrand(null);
              setCurrentView("home");
            }}
            className="flex items-center gap-2 text-stone-600 mb-6"
          >
            <ArrowLeft />
            {t.backToBrands}
          </button>

          <h2 className="text-4xl text-stone-800 mb-8">
            {brands.find((b) => b.id === selectedBrand)?.name}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {products[selectedBrand]?.map((product) => (
              <div
                key={product.id}
                className="border rounded-xl overflow-hidden hover:shadow-xl cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentView("product");
                }}
              >
                <img
                  src={product.image}
                  className="h-96 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl text-stone-800">{product.name}</h3>
                  <p className="text-2xl mt-2">€{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PRODUCT PAGE */}
      {currentView === "product" && selectedProduct && (
        <main className="max-w-7xl mx-auto p-8">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setCurrentView("catalog");
            }}
            className="flex items-center gap-2 text-stone-600 mb-6"
          >
            <ArrowLeft />
            {t.backToCatalog}
          </button>

          <div className="grid md:grid-cols-2 gap-12">
            <img
              src={selectedProduct.image}
              className="w-full rounded-xl"
            />

            <div>
              <h2 className="text-4xl text-stone-800">
                {selectedProduct.name}
              </h2>

              <p className="mt-6 text-xl">€{selectedProduct.price}</p>

              <button
                onClick={() => addToCart(selectedProduct)}
                className="mt-8 w-full bg-stone-800 text-white py-4 rounded-xl hover:bg-stone-700"
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 flex justify-end z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowCart(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
            <h3 className="text-2xl mb-4">{t.cart}</h3>

            {cart.length === 0 ? (
              <p>{t.emptyCart}</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border rounded-xl p-4 mb-4"
                >
                  <img
                    src={item.image}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h4>{item.name}</h4>
                    <p>€{item.price}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="border px-2 rounded"
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="border px-2 rounded"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-500"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {cart.length > 0 && (
              <>
                <div className="border-t pt-4 mt-4 text-lg">
                  <div className="flex justify-between">
                    <span>{t.total}:</span>
                    <strong>€{getTotalPrice()}</strong>
                  </div>
                </div>

                <button
                  onClick={completeOrder}
                  className="mt-6 w-full bg-stone-800 text-white py-4 rounded-xl"
                >
                  {t.checkout}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AndreLookStore;
