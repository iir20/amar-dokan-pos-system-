import React, { useState, useEffect } from 'react';
import { Product, CartItem, Sale, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Search, Plus, Trash2, ShoppingCart, User, Phone, Edit3 } from 'lucide-react';
import { StorageService } from '../services/storage';

interface POSProps {
  lang: Language;
  onCheckout: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ lang, onCheckout }) => {
  const t = TRANSLATIONS[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  
  // New States for Customer & Payment
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  useEffect(() => {
    setProducts(StorageService.getProducts());
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
        alert("Out of stock!");
        return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
            return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0.1, item.quantity + delta);
        if (newQty > item.stock) return item; 
        return { ...item, quantity: parseFloat(newQty.toFixed(2)) };
      }
      return item;
    }));
  };

  const handleManualQuantityChange = (id: string, val: string) => {
      const numVal = parseFloat(val);
      if (isNaN(numVal) || numVal < 0) return;

      setCart(prev => prev.map(item => {
        if(item.id === id) {
             if(numVal > item.stock) {
                 return {...item, quantity: item.stock};
             }
             return {...item, quantity: numVal};
        }
        return item;
      }));
  };

  const handlePriceChange = (id: string, val: string) => {
    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal < 0) return;

    setCart(prev => prev.map(item => {
        if (item.id === id) {
            return { ...item, price: numVal };
        }
        return item;
    }));
  };

  // Calculations
  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculateProfit = () => cart.reduce((acc, item) => acc + ((item.price - item.cost) * item.quantity), 0);

  const totalAmount = calculateTotal();
  
  // Logic for Paid/Due
  const paidAmount = paidAmountInput === '' ? totalAmount : parseFloat(paidAmountInput) || 0;
  const dueAmount = Math.max(0, totalAmount - paidAmount);
  const changeAmount = Math.max(0, paidAmount - totalAmount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (dueAmount > 0 && !customerName.trim()) {
        alert(lang === 'bn' ? 'বাকি থাকলে ক্রেতার নাম অবশ্যই দিতে হবে।' : 'Customer name is required for due payment.');
        return;
    }

    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: cart,
      totalAmount: totalAmount,
      totalProfit: calculateProfit(),
      paymentMethod: 'cash',
      customerName: customerName,
      customerPhone: customerPhone,
      paidAmount: paidAmount,
      dueAmount: dueAmount
    };

    onCheckout(sale);
    
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaidAmountInput('');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.nameBn.includes(search)
  );

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50">
      
      {/* Product Grid - Left Side */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-4 bg-white border-b shadow-sm z-10">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-emerald-200 transition group flex flex-col justify-between min-h-[110px] ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug">
                            {lang === 'bn' ? product.nameBn : product.name}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            {product.stock} {product.unit || 'pcs'}
                        </span>
                    </div>
                </div>
                
                <div className="flex justify-between items-end mt-3 pt-2 border-t border-dashed border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{product.category}</span>
                        <span className="text-emerald-600 font-bold text-lg">৳{product.price}</span>
                    </div>
                    <button className="bg-emerald-50 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Plus size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart - Right Side */}
      <div className="w-full md:w-96 bg-white border-l shadow-xl flex flex-col h-[60vh] md:h-full z-20">
        
        {/* Customer Info Section */}
        <div className="p-4 bg-emerald-50 border-b space-y-3">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                <User size={18} className="text-gray-400" />
                <input 
                    type="text"
                    placeholder={t.customerName}
                    className="flex-1 outline-none text-sm bg-transparent"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                <Phone size={18} className="text-gray-400" />
                <input 
                    type="tel"
                    placeholder={t.customerPhone}
                    className="flex-1 outline-none text-sm bg-transparent"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                />
            </div>
        </div>

        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <ShoppingCart className="text-emerald-600" size={20} />
            <h2 className="font-bold text-gray-800">Current Order</h2>
            <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">
                {cart.length} items
            </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-2 opacity-20" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">{lang === 'bn' ? item.nameBn : item.name}</h4>
                  {/* Editable Price */}
                  <div className="flex items-center text-emerald-600 font-bold text-sm mt-1">
                    <span>৳</span>
                    <input 
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      className="w-16 bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-600 outline-none px-1 text-emerald-600 font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-500 border border-gray-100">-</button>
                  <div className="flex items-center px-1">
                    <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleManualQuantityChange(item.id, e.target.value)}
                        className="w-10 text-center text-sm font-medium outline-none py-1 appearance-none bg-transparent"
                    />
                    <span className="text-[10px] text-gray-400 pr-1">{item.unit || 'pcs'}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-emerald-600 border border-gray-100">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 space-y-3">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal</span>
            <span>৳{totalAmount.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
             <div className="col-span-2 flex items-center justify-between font-bold text-xl text-gray-800">
                <span>{t.total}</span>
                <span>৳{totalAmount.toFixed(2)}</span>
             </div>
             
             {/* Payment Inputs */}
             <div className="col-span-2 pt-2 border-t">
                 <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-gray-500">{t.paidAmount}</label>
                 </div>
                 <div className="flex items-center bg-white border border-emerald-300 rounded-lg overflow-hidden ring-2 ring-transparent focus-within:ring-emerald-500 transition-all">
                    <span className="pl-3 text-gray-500 font-bold">৳</span>
                    <input 
                        type="number"
                        className="w-full p-2 outline-none font-bold text-gray-800"
                        placeholder={totalAmount.toString()}
                        value={paidAmountInput}
                        onChange={(e) => setPaidAmountInput(e.target.value)}
                    />
                 </div>
             </div>

             {/* Change / Due Display */}
             {dueAmount > 0 ? (
                 <div className="col-span-2 flex justify-between items-center text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                     <span className="text-sm font-semibold">{t.dueAmount}</span>
                     <span className="font-bold">৳{dueAmount.toFixed(2)}</span>
                 </div>
             ) : (
                <div className="col-span-2 flex justify-between items-center text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                     <span className="text-sm font-semibold">{t.changeAmount}</span>
                     <span className="font-bold">৳{changeAmount.toFixed(2)}</span>
                </div>
             )}
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-2"
          >
            {t.checkout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;