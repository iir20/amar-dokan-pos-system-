import React, { useState } from 'react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { StorageService } from '../services/storage';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface InventoryProps {
  lang: Language;
}

const Inventory: React.FC<InventoryProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  // Reactive products list
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        nameBn: '',
        category: '',
        price: 0,
        cost: 0,
        stock: 0,
        unit: 'pcs',
        image: 'https://picsum.photos/200/200?random=' + Date.now()
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      await StorageService.deleteProduct(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name || 'New Product',
      nameBn: formData.nameBn || formData.name || '',
      category: formData.category || 'General',
      price: Number(formData.price) || 0,
      cost: Number(formData.cost) || 0,
      stock: Number(formData.stock) || 0,
      unit: formData.unit || 'pcs',
      image: formData.image
    };

    await StorageService.saveProduct(productToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.inventory}</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
        >
          <Plus size={18} /> {t.addProduct}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 font-medium text-sm sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4">{t.item}</th>
              <th className="p-4 hidden sm:table-cell">Category</th>
              <th className="p-4 text-right">{t.cost}</th>
              <th className="p-4 text-right">{t.price}</th>
              <th className="p-4 text-center">{t.stockLevel}</th>
              <th className="p-4 text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">
                  <div className="flex items-center gap-3">
                     <img src={p.image} alt="" className="w-8 h-8 rounded bg-gray-200 object-cover hidden sm:block"/>
                     <div>
                        <div>{lang === 'bn' ? p.nameBn : p.name}</div>
                     </div>
                  </div>
                </td>
                <td className="p-4 text-gray-600 text-sm hidden sm:table-cell">{p.category}</td>
                <td className="p-4 text-right text-gray-600 text-sm">৳{p.cost}</td>
                <td className="p-4 text-right font-medium text-emerald-600">৳{p.price}</td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {p.stock} {p.unit}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(p)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="p-8 text-center text-gray-400">
             No products found. Add one to get started.
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingProduct ? t.actions : t.addProduct}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (English)</label>
                    <input 
                      type="text" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Bangla)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none font-[Hind_Siliguri]"
                      value={formData.nameBn || ''}
                      onChange={e => setFormData({...formData, nameBn: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input 
                      type="text" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.category || ''}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                    <input 
                      type="number" min="0" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.cost || ''}
                      onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                    <input 
                      type="number" min="0" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.price || ''}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" min="0" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.stock || ''}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.unit}</label>
                    <input 
                      type="text" required
                      placeholder="kg, pcs, L"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.unit || ''}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    {t.cancel}
                </button>
                <button 
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex justify-center items-center gap-2"
                >
                    <Save size={18} /> {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;