"use client";

import React, { useState } from 'react';
import { ShoppingCart, User, Search, Heart, Menu, X, ChevronRight, Star, Truck, Shield, ArrowLeft, Package, MapPin, Calendar, Edit, Trash2, Plus, Users, ShoppingBag, Settings, LogOut, TrendingUp } from 'lucide-react';

const AndreLookStore = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const translations = {
    ru: {
      home: 'Главная',
      brands: 'Бренды',
      about: 'О нас',
      contact: 'Контакты',
      cart: 'Корзина',
      account: 'Аккаунт',
      admin: 'Админ',
      heroTitle: 'Премиум одежда европейских брендов',
      heroSubtitle: 'Оригинальные коллекции Moncler, Parajumpers и CP Company с доставкой по Европе',
      selectBrand: 'Выберите бренд',
      catalog: 'Смотреть каталог',
      addToCart: 'Добавить в корзину',
      checkout: 'Оформить заказ',
      backToBrands: 'Назад к брендам',
      backToCatalog: 'Назад к каталогу',
      emptyCart: 'Корзина пуста',
      total: 'Итого',
      shipping: 'Доставка',
      free: 'Бесплатно',
      orderSuccess: 'Заказ оформлен!',
      thankYou: 'Спасибо за покупку в AndreLook',
      orderDetails: 'Детали заказа отправлены на ваш email',
      guarantee: 'Гарантия подлинности',
      guaranteeText: '100% оригинальные товары от официальных поставщиков',
      fastShipping: 'Быстрая доставка',
      shippingText: 'Доставка по Европе 3-7 дней, по Эстонии 1-3 дня',
      premium: 'Премиум качество',
      premiumText: 'Тщательный контроль качества каждого изделия',
      aboutTitle: 'О нас',
      aboutText: 'AndreLook - это эксклюзивный бутик премиальной одежды в сердце Европы. Мы специализируемся на продаже оригинальных коллекций ведущих европейских брендов.',
      name: 'Имя и фамилия',
      email: 'Email',
      phone: 'Телефон',
      address: 'Адрес доставки',
      paymentMethod: 'Способ оплаты',
      confirmOrder: 'Подтвердить заказ',
      myOrders: 'Мои заказы',
      trackOrder: 'Отследить заказ',
      orderStatus: 'Статус заказа',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      login: 'Войти',
      logout: 'Выйти',
      adminPanel: 'Панель администратора',
      customers: 'Клиенты',
      totalCustomers: 'Всего клиентов',
      totalOrders: 'Всего заказов',
      revenue: 'Выручка',
      contactCustomer: 'Связаться',
      addProduct: 'Добавить товар'
    },
    en: {
      home: 'Home',
      brands: 'Brands',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
      account: 'Account',
      admin: 'Admin',
      heroTitle: 'Premium European Fashion Brands',
      heroSubtitle: 'Original Moncler, Parajumpers and CP Company collections with delivery across Europe',
      selectBrand: 'Select Brand',
      catalog: 'View Catalog',
      addToCart: 'Add to Cart',
      checkout: 'Checkout',
      backToBrands: 'Back to Brands',
      backToCatalog: 'Back to Catalog',
      emptyCart: 'Cart is empty',
      total: 'Total',
      shipping: 'Shipping',
      free: 'Free',
      orderSuccess: 'Order Placed!',
      thankYou: 'Thank you for shopping at AndreLook',
      orderDetails: 'Order details sent to your email',
      guarantee: 'Authenticity Guarantee',
      guaranteeText: '100% authentic products from official suppliers',
      fastShipping: 'Fast Delivery',
      shippingText: 'Europe delivery 3-7 days, Estonia 1-3 days',
      premium: 'Premium Quality',
      premiumText: 'Careful quality control of every item',
      aboutTitle: 'About Us',
      aboutText: 'AndreLook is an exclusive premium clothing boutique in the heart of Europe. We specialize in selling original collections of leading European brands.',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Delivery Address',
      paymentMethod: 'Payment Method',
      confirmOrder: 'Confirm Order',
      myOrders: 'My Orders',
      trackOrder: 'Track Order',
      orderStatus: 'Order Status',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      login: 'Login',
      logout: 'Logout',
      adminPanel: 'Admin Panel',
      customers: 'Customers',
      totalCustomers: 'Total Customers',
      totalOrders: 'Total Orders',
      revenue: 'Revenue',
      contactCustomer: 'Contact',
      addProduct: 'Add Product'
    },
    et: {
      home: 'Avaleht',
      brands: 'Brändid',
      about: 'Meist',
      contact: 'Kontakt',
      cart: 'Ostukorv',
      account: 'Konto',
      admin: 'Admin',
      heroTitle: 'Premium Euroopa moebrändid',
      heroSubtitle: 'Originaalsed Moncler, Parajumpers ja CP Company kollektsioonid',
      selectBrand: 'Vali bränd',
      catalog: 'Vaata kataloogi',
      addToCart: 'Lisa ostukorvi',
      checkout: 'Vormista tellimus',
      backToBrands: 'Tagasi brändide juurde',
      backToCatalog: 'Tagasi kataloogi',
      emptyCart: 'Ostukorv on tühi',
      total: 'Kokku',
      shipping: 'Kohaletoimetamine',
      free: 'Tasuta',
      orderSuccess: 'Tellimus vormistatud!',
      thankYou: 'Täname teid AndreLook ostlemise eest',
      orderDetails: 'Tellimuse üksikasjad saadeti teie e-posti',
      guarantee: 'Ehtsuse garantii',
      guaranteeText: '100% originaaltooted ametlikelt tarnijatelt',
      fastShipping: 'Kiire kohaletoimetamine',
      shippingText: 'Euroopa 3-7 päeva, Eesti 1-3 päeva',
      premium: 'Premium kvaliteet',
      premiumText: 'Hoolikas kvaliteedikontroll',
      aboutTitle: 'Meist',
      aboutText: 'AndreLook on eksklusiivsete premium-rõivaste butik Euroopa südames. Spetsialiseerume juhtivate Euroopa brändide müügile.',
      name: 'Nimi',
      email: 'E-post',
      phone: 'Telefon',
      address: 'Tarneaadress',
      paymentMethod: 'Makseviis',
      confirmOrder: 'Kinnita tellimus',
      myOrders: 'Minu tellimused',
      trackOrder: 'Jälgi tellimust',
      orderStatus: 'Tellimuse olek',
      processing: 'Töötlemisel',
      shipped: 'Saadetud',
      delivered: 'Kohale toimetatud',
      login: 'Logi sisse',
      logout: 'Logi välja',
      adminPanel: 'Admin paneel',
      customers: 'Kliendid',
      totalCustomers: 'Kokku kliente',
      totalOrders: 'Kokku tellimusi',
      revenue: 'Tulu',
      contactCustomer: 'Kontakt',
      addProduct: 'Lisa toode'
    }
  };

   const base = translations.ru;
  const t = {
    ...base,
    ...translations[language],
  };

  const brands = [
    { id: 'moncler', name: 'Moncler', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400' },
    { id: 'parajumpers', name: 'Parajumpers', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { id: 'cpcompany', name: 'CP Company', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' }
  ];

  const products = {
    moncler: [
      { 
        id: 1, 
        name: 'Maya Down Jacket', 
        price: 1450, 
        brand: 'Moncler', 
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', 
        rating: 5, 
        description: {
          ru: 'Легендарная пуховая куртка Moncler Maya - воплощение роскоши и функциональности.',
          en: 'The legendary Moncler Maya down jacket - embodiment of luxury and functionality.',
          et: 'Legendaarne Moncler Maya sulejope - luksuse ja funktsionaalsuse kehastus.'
        }
      },
      { 
        id: 2, 
        name: 'Grenoble Ski Jacket', 
        price: 1890, 
        brand: 'Moncler', 
        image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600', 
        rating: 5,
        description: {
          ru: 'Профессиональная горнолыжная куртка из коллекции Grenoble.',
          en: 'Professional ski jacket from the Grenoble collection.',
          et: 'Professionaalne suusajope Grenoble kollektsioonist.'
        }
      },
      { 
        id: 3, 
        name: 'Cardigan Tricot', 
        price: 890, 
        brand: 'Moncler', 
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 
        rating: 4,
        description: {
          ru: 'Элегантный кардиган из премиальной шерсти мериноса.',
          en: 'Elegant cardigan made from premium merino wool.',
          et: 'Elegantne kardigan premium meriinovillast.'
        }
      }
    ],
    parajumpers: [
      { 
        id: 4, 
        name: 'Right Hand Parka', 
        price: 1120, 
        brand: 'Parajumpers', 
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 
        rating: 5,
        description: {
          ru: 'Культовая парка Right Hand с мехом енота.',
          en: 'Iconic Right Hand parka with raccoon fur.',
          et: 'Kultuslik Right Hand parka koos pesukarakarusega.'
        }
      },
      { 
        id: 5, 
        name: 'Masterpiece Jacket', 
        price: 1350, 
        brand: 'Parajumpers', 
        image: 'https://images.unsplash.com/photo-1548126032-bb70f9b01578?w=600', 
        rating: 5,
        description: {
          ru: 'Флагманская модель бренда с уникальным дизайном.',
          en: 'The brands flagship model with unique design.',
          et: 'Brändi lipulaevmudel ainulaadse disainiga.'
        }
      },
      { 
        id: 6, 
        name: 'Juliet Bomber', 
        price: 950, 
        brand: 'Parajumpers', 
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 
        rating: 4,
        description: {
          ru: 'Женская куртка-бомбер с утонченным силуэтом.',
          en: 'Womens bomber jacket with refined silhouette.',
          et: 'Naiste pommitaja jope rafineeritud siluetiga.'
        }
      }
    ],
    cpcompany: [
      { 
        id: 7, 
        name: 'Soft Shell Goggle Jacket', 
        price: 780, 
        brand: 'CP Company', 
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 
        rating: 5,
        description: {
          ru: 'Иконичная куртка с легендарными очками-гогглами.',
          en: 'Iconic jacket with legendary goggle hood.',
          et: 'Kultuslik jope legendaarse goggle kapuutsiga.'
        }
      },
      { 
        id: 8, 
        name: 'Overshirt Chrome', 
        price: 520, 
        brand: 'CP Company', 
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 
        rating: 4,
        description: {
          ru: 'Рубашка-oversize из коллекции Chrome-R.',
          en: 'Oversize shirt from Chrome-R collection.',
          et: 'Oversize särk Chrome-R kollektsioonist.'
        }
      },
      { 
        id: 9, 
        name: 'Fleece Lens Sweatshirt', 
        price: 420, 
        brand: 'CP Company', 
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 
        rating: 5,
        description: {
          ru: 'Классический свитшот из плотного флиса.',
          en: 'Classic sweatshirt made from dense fleece.',
          et: 'Klassikaline dressipluus tihedast fliisist.'
        }
      }
    ]
  };

  const mockOrders = [
    { id: 'ORD-001', date: '2024-12-01', status: 'delivered', total: 1450, items: 1, tracking: 'EE1234567890' },
    { id: 'ORD-002', date: '2024-12-03', status: 'shipped', total: 2340, items: 2, tracking: 'EE0987654321' }
  ];

  const mockCustomers = [
    { id: 1, name: 'Ivan Petrov', email: 'ivan@example.com', orders: 3, totalSpent: 4200 },
    { id: 2, name: 'Maria Saar', email: 'maria@example.com', orders: 2, totalSpent: 2800 },
    { id: 3, name: 'John Smith', email: 'john@example.com', orders: 5, totalSpent: 7500 }
  ];

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? {...item, quantity: item.quantity + 1} : item
      ));
    } else {
      setCart([...cart, {...product, quantity: 1}]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? {...item, quantity: newQuantity} : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const completeOrder = () => {
    setOrderComplete(true);
    setCart([]);
    setTimeout(() => {
      setOrderComplete(false);
      setShowCart(false);
      setCheckoutStep(1);
      setCurrentView('home');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => {setCurrentView('home'); setSelectedBrand(null); setSelectedProduct(null);}}
              >
                <div className="text-4xl font-serif text-stone-800 tracking-tight">AL</div>
                <div className="text-xl font-light text-stone-700 tracking-widest">ANDRELOOK</div>
              </div>
              <nav className="hidden md:flex gap-6">
                <button onClick={() => setCurrentView('home')} className="text-stone-600 hover:text-stone-900 transition text-sm tracking-wide">{t.home}</button>
                <button className="text-stone-600 hover:text-stone-900 transition text-sm tracking-wide">{t.brands}</button>
                <button onClick={() => setCurrentView('about')} className="text-stone-600 hover:text-stone-900 transition text-sm tracking-wide">{t.about}</button>
                <button className="text-stone-600 hover:text-stone-900 transition text-sm tracking-wide">{t.contact}</button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 border border-stone-300 rounded-lg p-1">
                <button 
                  onClick={() => setLanguage('ru')}
                  className={`px-2 py-1 text-xs rounded transition ${language === 'ru' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  RU
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs rounded transition ${language === 'en' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('et')}
                  className={`px-2 py-1 text-xs rounded transition ${language === 'et' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  ET
                </button>
              </div>
              
              <button className="p-2 hover:bg-stone-100 rounded-full transition">
                <Search className="w-5 h-5 text-stone-600" />
              </button>
              <button className="p-2 hover:bg-stone-100 rounded-full transition">
                <Heart className="w-5 h-5 text-stone-600" />
              </button>
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => setCurrentView('account')}
                    className="p-2 hover:bg-stone-100 rounded-full transition"
                  >
                    <User className="w-5 h-5 text-stone-600" />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => setCurrentView('admin')}
                      className="px-3 py-2 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700 transition"
                    >
                      {t.admin}
                    </button>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => {setIsLoggedIn(true); setUserEmail('user@example.com');}}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm"
                >
                  {t.login}
                </button>
              )}
              <button 
                className="relative p-2 hover:bg-stone-100 rounded-full transition"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-5 h-5 text-stone-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Home View */}
      {currentView === 'home' && !selectedBrand && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-stone-800 via-stone-700 to-stone-600 rounded-2xl p-16 mb-16 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-5xl font-light mb-6 tracking-tight">{t.heroTitle}</h2>
              <p className="text-xl mb-12 text-stone-200 max-w-2xl font-light">{t.heroSubtitle}</p>
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <span className="font-light">{t.guarantee}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6" />
                  <span className="font-light">{t.fastShipping}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-light text-stone-800 mb-12 tracking-tight">{t.selectBrand}</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {brands.map(brand => (
              <div 
                key={brand.id}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-400 transition-all duration-300 hover:shadow-xl"
                onClick={() => {
                  setSelectedBrand(brand.id);
                  setCurrentView('catalog');
                }}
              >
                <div className="h-80 overflow-hidden bg-stone-100">
                  <img 
                    src={brand.image} 
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-light text-stone-800 mb-3 tracking-tight">{brand.name}</h4>
                  <button className="flex items-center gap-2 text-stone-600 font-light group-hover:text-stone-900 group-hover:gap-4 transition-all text-sm tracking-wide">
                    {t.catalog}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center border border-stone-200">
              <Shield className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <h4 className="font-light text-lg mb-3 text-stone-800">{t.guarantee}</h4>
              <p className="text-stone-600 text-sm font-light">{t.guaranteeText}</p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border border-stone-200">
              <Truck className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <h4 className="font-light text-lg mb-3 text-stone-800">{t.fastShipping}</h4>
              <p className="text-stone-600 text-sm font-light">{t.shippingText}</p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border border-stone-200">
              <Star className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <h4 className="font-light text-lg mb-3 text-stone-800">{t.premium}</h4>
              <p className="text-stone-600 text-sm font-light">{t.premiumText}</p>
            </div>
          </div>
        </main>
      )}

      {/* About View */}
      {currentView === 'about' && (
        <main className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-light text-stone-800 mb-8 tracking-tight">{t.aboutTitle}</h2>
          <div className="bg-white rounded-xl p-12 border border-stone-200">
            <p className="text-stone-700 leading-relaxed text-lg font-light mb-8">{t.aboutText}</p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-stone-600 mt-1" />
                <div>
                  <h4 className="font-light text-stone-800 mb-2">Tallinn, Estonia</h4>
                  <p className="text-stone-600 text-sm font-light">Heart of Europe</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-stone-600 mt-1" />
                <div>
                  <h4 className="font-light text-stone-800 mb-2">Premium Brands</h4>
                  <p className="text-stone-600 text-sm font-light">100% Original</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Catalog View */}
      {currentView === 'catalog' && selectedBrand && !selectedProduct && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          <button 
            onClick={() => {setSelectedBrand(null); setCurrentView('home');}}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition font-light"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToBrands}
          </button>
          
          <h2 className="text-4xl font-light text-stone-800 mb-12 tracking-tight">
            {brands.find(b => b.id === selectedBrand)?.name}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {products[selectedBrand]?.map(product => (
              <div 
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-400 transition-all duration-300 cursor-pointer group hover:shadow-xl"
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentView('product');
                }}
              >
                <div className="h-96 overflow-hidden bg-stone-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(product.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-stone-700 text-stone-700" />
                    ))}
                  </div>
                  <h3 className="text-xl font-light text-stone-800 mb-3">{product.name}</h3>
                  <p className="text-2xl font-light text-stone-800">€{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Product View */}
      {currentView === 'product' && selectedProduct && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          <button 
            onClick={() => {setSelectedProduct(null); setCurrentView('catalog');}}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition font-light"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToCatalog}
          </button>
          
          <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl overflow-hidden border border-stone-200 p-8">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-stone-100">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-full h-[600px] object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-stone-600 font-light mb-3 tracking-wide">{selectedProduct.brand}</div>
              <h2 className="text-4xl font-light text-stone-800 mb-6 tracking-tight">{selectedProduct.name}</h2>
              
              <div className="flex items-center gap-2 mb-8">
                {[...Array(selectedProduct.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-stone-700 text-stone-700" />
                ))}
              </div>

              <div className="text-4xl font-light text-stone-800 mb-10">€{selectedProduct.price}</div>

              <p className="text-stone-700 leading-relaxed mb-10 text-base font-light">
                {selectedProduct.description[language]}
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-stone-700 font-light">
                  <Shield className="w-5 h-5 text-stone-600" />
                  <span className="text-sm">{t.guaranteeText}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-700 font-light">
                  <Truck className="w-5 h-5 text-stone-600" />
                  <span className="text-sm">{t.shippingText}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  addToCart(selectedProduct);
                  setShowCart(true);
                }}
                className="w-full bg-stone-800 text-white py-4 rounded-xl font-light text-base hover:bg-stone-700 transition tracking-wide"
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* User Account View */}
      {currentView === 'account' && isLoggedIn && (
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-light text-stone-800 tracking-tight">{t.account}</h2>
            <button 
              onClick={() => {setIsLoggedIn(false); setCurrentView('home');}}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition"
            >
              <LogOut className="w-5 h-5" />
              {t.logout}
            </button>
          </div>

          <div className="bg-white rounded-xl p-8 border border-stone-200 mb-8">
            <h3 className="text-xl font-light text-stone-800 mb-6">{t.myOrders}</h3>
            <div className="space-y-4">
              {mockOrders.map(order => (
                <div key={order.id} className="border border-stone-200 rounded-lg p-6 hover:border-stone-400 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-light text-stone-800">{order.id}</div>
                      <div className="text-sm text-stone-600 font-light">{order.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-light text-stone-800">€{order.total}</div>
                      <div className={`text-sm font-light ${order.status === 'delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                        {t[order.status]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600 font-light">
                    <Package className="w-4 h-4" />
                    <span>{t.trackOrder}: {order.tracking}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Admin Panel */}
      {currentView === 'admin' && isAdmin && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-light text-stone-800 mb-8 tracking-tight">{t.adminPanel}</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-stone-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-light text-stone-800 mb-1">127</div>
              <div className="text-sm text-stone-600 font-light">{t.totalCustomers}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-8 h-8 text-stone-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-light text-stone-800 mb-1">89</div>
              <div className="text-sm text-stone-600 font-light">{t.totalOrders}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-stone-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-light text-stone-800 mb-1">€124,500</div>
              <div className="text-sm text-stone-600 font-light">{t.revenue}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-stone-200">
              <h3 className="text-xl font-light text-stone-800">{t.customers}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-light text-stone-600 tracking-wide">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-light text-stone-600 tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-light text-stone-600 tracking-wide">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-light text-stone-600 tracking-wide">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-light text-stone-600 tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCustomers.map(customer => (
                    <tr key={customer.id} className="border-t border-stone-200 hover:bg-stone-50 transition">
                      <td className="px-6 py-4 text-sm font-light text-stone-800">{customer.name}</td>
                      <td className="px-6 py-4 text-sm font-light text-stone-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm font-light text-stone-800">{customer.orders}</td>
                      <td className="px-6 py-4 text-sm font-light text-stone-800">€{customer.totalSpent}</td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-stone-600 hover:text-stone-900 font-light">
                          {t.contactCustomer}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition font-light text-sm">
              <Plus className="w-4 h-4 inline mr-2" />
              {t.addProduct}
            </button>
            <button 
              onClick={() => setIsAdmin(false)}
              className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition font-light text-sm"
            >
              Exit Admin Mode
            </button>
          </div>
        </main>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => {setShowCart(false); setCheckoutStep(1);}}
          />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            {!orderComplete ? (
              <>
                <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between z-10">
                  <h3 className="text-2xl font-light text-stone-800 tracking-tight">
                    {checkoutStep === 1 ? t.cart : t.checkout}
                  </h3>
                  <button 
                    onClick={() => {setShowCart(false); setCheckoutStep(1);}}
                    className="p-2 hover:bg-stone-100 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-stone-600" />
                  </button>
                </div>

                {checkoutStep === 1 ? (
                  <div className="p-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                        <p className="text-stone-500 font-light">{t.emptyCart}</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-light text-stone-800">{item.name}</h4>
                                <p className="text-sm text-stone-600 font-light">{item.brand}</p>
                                <p className="text-stone-800 font-light">€{item.price}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-6 h-6 rounded-full border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-light">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-6 h-6 rounded-full border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-sm"
                                  >
                                    +
                                  </button>
                                  <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="ml-auto text-stone-500 text-sm hover:text-stone-700 font-light"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-stone-200 pt-4 space-y-2 mb-6">
                          <div className="flex justify-between text-stone-600 font-light">
                            <span>{t.shipping}</span>
                            <span className="text-green-600">{t.free}</span>
                          </div>
                          <div className="flex justify-between text-xl font-light text-stone-800 pt-2">
                            <span>{t.total}</span>
                            <span>€{getTotalPrice()}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => setCheckoutStep(2)}
                          className="w-full bg-stone-800 text-white py-4 rounded-xl font-light hover:bg-stone-700 transition tracking-wide"
                        >
                          {t.checkout}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <button 
                      onClick={() => setCheckoutStep(1)}
                      className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 font-light"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      {t.cart}
                    </button>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">{t.name}</label>
                        <input 
                          type="text" 
                          className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent font-light"
                          placeholder="Ivan Petrov"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">{t.email}</label>
                        <input 
                          type="email" 
                          className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent font-light"
                          placeholder="ivan@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">{t.phone}</label>
                        <input 
                          type="tel" 
                          className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent font-light"
                          placeholder="+372 5XXX XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">{t.address}</label>
                        <textarea 
                          className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent font-light"
                          rows="3"
                          placeholder="Tallinn, Estonia"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">{t.paymentMethod}</label>
                        <select 
                          className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent font-light"
                        >
                          <option>Card Online</option>
                          <option>Bank Transfer</option>
                          <option>PayPal</option>
                        </select>
                      </div>

                      <div className="bg-stone-50 rounded-xl p-4 space-y-2 border border-stone-200">
                        <div className="flex justify-between text-stone-600 font-light">
                          <span>{t.total}</span>
                          <span>€{getTotalPrice()}</span>
                        </div>
                      </div>

                      <button 
                        onClick={completeOrder}
                        className="w-full bg-stone-800 text-white py-4 rounded-xl font-light hover:bg-stone-700 transition tracking-wide"
                      >
                        {t.confirmOrder}
                      </button>
                      <p className="text-xs text-stone-500 text-center font-light mt-2">
                        Order → andrei.petrovw@gmail.com
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-light text-stone-800 mb-4 tracking-tight">{t.orderSuccess}</h3>
                  <p className="text-stone-600 mb-2 font-light">{t.thankYou}</p>
                  <p className="text-stone-500 text-sm font-light">{t.orderDetails}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoggedIn && (
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className="fixed bottom-8 right-8 bg-stone-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-stone-700 transition text-sm font-light"
        >
          {isAdmin ? 'Exit Admin' : 'Admin Mode'}
        </button>
      )}
    </div>
  );
};

export default AndreLookStore;
