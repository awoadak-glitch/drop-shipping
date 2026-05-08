import React, { useState } from 'react';
import { ShoppingCart, Eye, Star } from 'lucide-react';

// محاكاة لبيانات الـ JSON التي تجلبها عبر سكريبتاتك
const productsData = [
  { id: 1, name: "Premium Wireless Headset", price: "120", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "Electronics" },
  { id: 2, name: "Smart Fitness Watch", price: "85", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "Wearables" },
  { id: 3, name: "Minimalist Coffee Mug", price: "25", image: "https://images.unsplash.com/photo-1514228742587-6b1558fbed39?w=500", category: "Lifestyle" },
];

const DropshippingLanding = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          FUTURE STORE
        </h1>
        <div className="flex gap-6 items-center">
          <button className="relative p-2 hover:bg-slate-100 rounded-full transition-all">
            <ShoppingCart size={24} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-8 py-20 text-center bg-white">
        <h2 className="text-5xl font-extrabold mb-6 tracking-tight">
          تسوق أحدث المنتجات <span className="text-blue-600">بذكاء</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10">
          اكتشف تشكيلة مختارة من أفضل المنتجات العالمية التي تصلك أينما كنت.
        </p>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:-translate-y-1 transition-all">
          تصفح المجموعة
        </button>
      </header>

      {/* Product Grid */}
      <main className="px-8 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsData.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500">
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                    <Eye size={20} />
                  </button>
                  <button className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.category}</span>
                  <div className="flex items-center text-yellow-400"><Star size={14} fill="currentColor" /> <span className="text-slate-400 text-xs ml-1">(4.8)</span></div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-slate-900">${product.price}</span>
                  <button className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-blue-600">
                    اشتري الآن
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-center text-sm">
        <p>© 2026 Future Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DropshippingLanding;
