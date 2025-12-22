'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Trash2, Package, ShoppingBag, 
  Users, TrendingUp, Image, Save, X 
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  nameEn: string;
  nameEt: string;
  image: string;
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  nameEn: string;
  nameEt: string;
  descriptionRu: string;
  descriptionEn: string;
  descriptionEt: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  brand: { name: string };
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'brands' | 'products'>('dashboard');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } else if (activeTab === 'brands') {
        const res = await fetch('/api/admin/brands');
        const data = await res.json();
        setBrands(data);
      } else if (activeTab === 'products') {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrand = async (brand: Partial<Brand>) => {
    try {
      const url = brand.id ? `/api/admin/brands/${brand.id}` : '/api/admin/brands';
      const method = brand.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand)
      });

      if (res.ok) {
        setEditingBrand(null);
        setIsCreating(false);
        loadData();
      }
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Удалить бренд?')) return;
    
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      const url = product.id ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      if (res.ok) {
        setEditingProduct(null);
        setIsCreating(false);
        loadData();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light text-stone-800">Админ Панель</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-stone-600 hover:text-stone-900"
            >
              На сайт
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'dashboard'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Статистика
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'brands'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Бренды
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'products'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Товары
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && stats && (
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-stone-200">
                  <Package className="w-8 h-8 text-stone-600 mb-3" />
                  <div className="text-3xl font-light text-stone-800 mb-1">
                    {stats.totalProducts}
                  </div>
                  <div className="text-sm text-stone-600">Товаров</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-stone-200">
                  <ShoppingBag className="w-8 h-8 text-stone-600 mb-3" />
                  <div className="text-3xl font-light text-stone-800 mb-1">
                    {stats.totalOrders}
                  </div>
                  <div className="text-sm text-stone-600">Заказов</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-stone-200">
                  <Users className="w-8 h-8 text-stone-600 mb-3" />
                  <div className="text-3xl font-light text-stone-800 mb-1">
                    {stats.totalCustomers}
                  </div>
                  <div className="text-sm text-stone-600">Клиентов</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-stone-200">
                  <TrendingUp className="w-8 h-8 text-stone-600 mb-3" />
                  <div className="text-3xl font-light text-stone-800 mb-1">
                    €{stats.totalRevenue.toFixed(0)}
                  </div>
                  <div className="text-sm text-stone-600">Выручка</div>
                </div>
              </div>
            )}

            {activeTab === 'brands' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-light text-stone-800">Бренды</h2>
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setEditingBrand({
                        id: '',
                        name: '',
                        nameEn: '',
                        nameEt: '',
                        image: ''
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить бренд
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {brands.map((brand) => (
                    <div key={brand.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                      <img src={brand.image} alt={brand.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-light text-stone-800 mb-2">{brand.name}</h3>
                        <p className="text-sm text-stone-600 mb-4">
                          Товаров: {brand._count?.products || 0}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingBrand(brand)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-stone-300 rounded-lg hover:bg-stone-50"
                          >
                            <Edit className="w-4 h-4" />
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(editingBrand || isCreating) && (
                  <BrandEditModal
                    brand={editingBrand!}
                    onSave={handleSaveBrand}
                    onClose={() => {
                      setEditingBrand(null);
                      setIsCreating(false);
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-light text-stone-800">Товары</h2>
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setEditingProduct({
                        id: '',
                        name: '',
                        nameEn: '',
                        nameEt: '',
                        descriptionRu: '',
                        descriptionEn: '',
                        descriptionEt: '',
                        price: 0,
                        image: '',
                        rating: 5,
                        inStock: true,
                        brand: { name: '' }
                      } as any);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить товар
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                      <div className="flex gap-4 p-4">
                        <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="text-lg font-light text-stone-800 mb-1">{product.name}</h3>
                          <p className="text-sm text-stone-600 mb-2">{product.brand.name}</p>
                          <p className="text-lg font-light text-stone-800 mb-2">€{product.price}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="flex items-center gap-2 px-3 py-1 border border-stone-300 rounded-lg hover:bg-stone-50 text-sm"
                            >
                              <Edit className="w-3 h-3" />
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex items-center gap-2 px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(editingProduct || isCreating) && (
                  <ProductEditModal
                    product={editingProduct!}
                    brands={brands}
                    onSave={handleSaveProduct}
                    onClose={() => {
                      setEditingProduct(null);
                      setIsCreating(false);
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BrandEditModal({ 
  brand, 
  onSave, 
  onClose 
}: { 
  brand: Brand; 
  onSave: (brand: Partial<Brand>) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(brand);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-xl font-light text-stone-800">
            {brand.id ? 'Редактировать бренд' : 'Новый бренд'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Название (RU)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Название (EN)</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Название (ET)</label>
            <input
              type="text"
              value={formData.nameEt}
              onChange={(e) => setFormData({ ...formData, nameEt: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">URL изображения</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>

          {formData.image && (
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2">Превью</label>
              <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-stone-200 flex gap-3">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
          >
            <Save className="w-4 h-4" />
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border border-stone-300 rounded-lg hover:bg-stone-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductEditModal({ 
  product, 
  brands,
  onSave, 
  onClose 
}: { 
  product: Product; 
  brands: Brand[];
  onSave: (product: any) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    ...product,
    brandId: product.brand ? brands.find(b => b.name === product.brand.name)?.id : brands[0]?.id
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-xl font-light text-stone-800">
            {product.id ? 'Редактировать товар' : 'Новый товар'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2">Название (RU)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2">Название (EN)</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Название (ET)</label>
            <input
              type="text"
              value={formData.nameEt}
              onChange={(e) => setFormData({ ...formData, nameEt: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Бренд</label>
            <select
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2">Цена (€)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full border border-stone-300 rounded-lg px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2">Рейтинг</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full border border-stone-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Описание (RU)</label>
            <textarea
              value={formData.descriptionRu}
              onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
              rows={3}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Описание (EN)</label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              rows={3}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">Описание (ET)</label>
            <textarea
              value={formData.descriptionEt}
              onChange={(e) => setFormData({ ...formData, descriptionEt: e.target.value })}
              rows={3}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-2">URL изображения</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-4 py-2"
            />
          </div>

          {formData.image && (
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2">Превью</label>
              <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="inStock" className="text-sm font-light text-stone-700">В наличии</label>
          </div>
        </div>

        <div className="p-6 border-t border-stone-200 flex gap-3">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
          >
            <Save className="w-4 h-4" />
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border border-stone-300 rounded-lg hover:bg-stone-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}