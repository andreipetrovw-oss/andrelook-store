'use client';

import { useState, useEffect } from 'react';
import { Package, Users, ShoppingBag, Plus, Edit, Trash2, Image, X } from 'lucide-react';

type Brand = {
  id: string;
  name: string;
  nameEn: string;
  nameEt: string;
  image: string;
};

type Product = {
  id: string;
  name: string;
  nameEn: string;
  nameEt: string;
  descriptionRu: string;
  descriptionEn: string;
  descriptionEt: string;
  price: number;
  brandId: string;
  image: string;
  images: string[];
  rating: number;
  inStock: boolean;
  brand: Brand;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'brands' | 'orders'>('products');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'brands') {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(data);
    } else if (activeTab === 'products') {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get('name'),
      nameEn: formData.get('nameEn'),
      nameEt: formData.get('nameEt'),
      descriptionRu: formData.get('descriptionRu'),
      descriptionEn: formData.get('descriptionEn'),
      descriptionEt: formData.get('descriptionEt'),
      price: parseFloat(formData.get('price') as string),
      brandId: formData.get('brandId'),
      image: formData.get('image'),
      rating: parseInt(formData.get('rating') as string),
      inStock: formData.get('inStock') === 'on',
    };

    const url = editingProduct 
      ? `/api/products/${editingProduct.id}` 
      : '/api/products';
    
    const method = editingProduct ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    setShowProductModal(false);
    setEditingProduct(null);
    loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleSaveBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const brandData = {
      name: formData.get('name'),
      nameEn: formData.get('nameEn'),
      nameEt: formData.get('nameEt'),
      image: formData.get('image'),
    };

    const url = editingBrand 
      ? `/api/brands/${editingBrand.id}` 
      : '/api/brands';
    
    const method = editingBrand ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData),
    });

    setShowBrandModal(false);
    setEditingBrand(null);
    loadData();
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Удалить бренд? Все товары этого бренда будут удалены!')) return;
    
    await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-stone-800 mb-8">Админ Панель</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-4 ${activeTab === 'products' ? 'border-b-2 border-stone-800 font-medium' : 'text-stone-500'}`}
          >
            <Package className="inline w-5 h-5 mr-2" />
            Товары
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`pb-4 px-4 ${activeTab === 'brands' ? 'border-b-2 border-stone-800 font-medium' : 'text-stone-500'}`}
          >
            <ShoppingBag className="inline w-5 h-5 mr-2" />
            Бренды
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 ${activeTab === 'orders' ? 'border-b-2 border-stone-800 font-medium' : 'text-stone-500'}`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            Заказы
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">Товары</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="bg-stone-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-700"
              >
                <Plus className="w-5 h-5" />
                Добавить товар
              </button>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white p-6 rounded-xl border border-stone-200 flex gap-4">
                  <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-stone-800">{product.name}</h3>
                    <p className="text-stone-600 text-sm">{product.brand.name}</p>
                    <p className="text-stone-800 font-medium mt-2">€{product.price}</p>
                    <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductModal(true);
                      }}
                      className="p-2 hover:bg-stone-100 rounded-lg"
                    >
                      <Edit className="w-5 h-5 text-stone-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">Бренды</h2>
              <button
                onClick={() => {
                  setEditingBrand(null);
                  setShowBrandModal(true);
                }}
                className="bg-stone-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-700"
              >
                <Plus className="w-5 h-5" />
                Добавить бренд
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <div key={brand.id} className="bg-white p-6 rounded-xl border border-stone-200">
                  <img src={brand.image} alt={brand.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h3 className="text-xl font-light text-stone-800 mb-2">{brand.name}</h3>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingBrand(brand);
                        setShowBrandModal(true);
                      }}
                      className="flex-1 p-2 bg-stone-100 hover:bg-stone-200 rounded-lg"
                    >
                      <Edit className="w-5 h-5 text-stone-600 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="flex-1 p-2 bg-red-50 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-light">
                  {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                </h3>
                <button onClick={() => setShowProductModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Название (RU)</label>
                  <input
                    name="name"
                    defaultValue={editingProduct?.name}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Название (EN)</label>
                    <input
                      name="nameEn"
                      defaultValue={editingProduct?.nameEn}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Название (ET)</label>
                    <input
                      name="nameEt"
                      defaultValue={editingProduct?.nameEt}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Описание (RU)</label>
                  <textarea
                    name="descriptionRu"
                    defaultValue={editingProduct?.descriptionRu}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Описание (EN)</label>
                  <textarea
                    name="descriptionEn"
                    defaultValue={editingProduct?.descriptionEn}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Описание (ET)</label>
                  <textarea
                    name="descriptionEt"
                    defaultValue={editingProduct?.descriptionEt}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Цена (€)</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Рейтинг (1-5)</label>
                    <input
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue={editingProduct?.rating || 5}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Бренд</label>
                  <select
                    name="brandId"
                    defaultValue={editingProduct?.brandId}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Выберите бренд</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">URL изображения</label>
                  <input
                    name="image"
                    type="url"
                    defaultValue={editingProduct?.image}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    name="inStock"
                    type="checkbox"
                    defaultChecked={editingProduct?.inStock ?? true}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-stone-700">В наличии</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-700"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 border border-stone-300 py-3 rounded-lg hover:bg-stone-50"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Brand Modal */}
        {showBrandModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-light">
                  {editingBrand ? 'Редактировать бренд' : 'Добавить бренд'}
                </h3>
                <button onClick={() => setShowBrandModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveBrand} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Название (RU)</label>
                  <input
                    name="name"
                    defaultValue={editingBrand?.name}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Название (EN)</label>
                  <input
                    name="nameEn"
                    defaultValue={editingBrand?.nameEn}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Название (ET)</label>
                  <input
                    name="nameEt"
                    defaultValue={editingBrand?.nameEt}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">URL изображения</label>
                  <input
                    name="image"
                    type="url"
                    defaultValue={editingBrand?.image}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-700"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBrandModal(false)}
                    className="flex-1 border border-stone-300 py-3 rounded-lg hover:bg-stone-50"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}