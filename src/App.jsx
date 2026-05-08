import React, { useState } from 'react';
import { ShoppingCart, Eye, Star, Heart, Zap, ShieldCheck, Truck, Headphones } from 'lucide-react';

// بيانات منتجات مكثفة واحترافية
const productsData = [
  { id: 1, name: "JCG Q20 Custom Router", price: "45", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9 },
  { id: 2, name: "Smart RGB Desk Lamp", price: "32", image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500", category: "Home Tech", rating: 4.7 },
  { id: 3, name: "Noise Cancelling Buds", price: "89", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", category: "Audio", rating: 4.8 },
  { id: 4, name: "Mechanical Gaming Keyboard", price: "110", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9 },
  { id: 5, name: "UltraWide 4K Monitor", price: "350", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", category: "Setup", rating: 5.0 },
  { id: 6, name: "Portable SSD 2TB", price: "145", image: "https://images.unsplash.com/photo-1597872200349-016042e54a4f?w=500", category: "Storage", rating: 4.6 },
  { id: 7, name: "Smart Fitness Ring", price: "199", image: "https://images.unsplash.com/photo-1610940882244-18ac06bd41b1?w=500", category: "Wearables", rating: 4.5 },
  { id: 8, name: "Vertical Ergonomic Mouse", price: "55", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", category: "Setup", rating: 4.8 },
];

const FutureStore = () => {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 overflow-x-hidden">
      
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white py-2 text-center text-xs font-medium tracking-widest uppercase">
        شحن مجاني للطلبات أكثر من $100 • خصم 15% لمشتركي Future Net
      </div>

      {/* Modern Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-12 py-5 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">F</div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900">FUTURE STORE</h1>
        </div>
        
        <div className="flex gap-4 items-center">
          <button className="hidden md:block text-sm font-medium hover:text-blue-600 transition-colors">المتجر</button>
          <button className="hidden md:block text-sm font-medium hover:text-blue-600 transition-colors">العروض</button>
          <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
          <button onClick={() => alert('تم تفعيل وضع الأتمتة')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <Zap size={20} className="text-amber-500" />
          </button>
          <button className="relative p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300">
            <ShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 bg-blue-600 border-2 border-white text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <header className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6">
          <ShieldCheck size={14} /> ضمان الجودة العالية
        </div>
        <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
          مستقبل التسوق <br/> <span className="text-blue-600">بين يديك الآن</span>
        </h2>
        <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          نختار لك أفضل المنتجات التقنية والمنزلية بعناية فائقة، مع ضمان سرعة التوصيل وأمان الدفع.
        </p>
        <div className="flex gap-4">
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all duration-300">
            تصفح المجموعة
          </button>
          <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            عن المتجر
          </button>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-12 mb-20">
        {[
          {icon: <Truck/>, title: "شحن سريع", desc: "لباب منزلك"},
          {icon: <ShieldCheck/>, title: "دفع آمن", desc: "تشفير كامل"},
          {icon: <Headphones/>, title: "دعم 24/7", desc: "دائماً معك"},
          {icon: <Zap/>, title: "ضمان حقيقي", desc: "استرجاع سهل"}
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center p-6 bg-white border border-slate-50 rounded-3xl text-center">
            <div className="text-blue-600 mb-3">{item.icon}</div>
            <h4 className="font-bold text-sm">{item.title}</h4>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Optimized Product Grid */}
      <main className="px-4 md:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black">أحدث المنتجات</h3>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {productsData.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-[2rem] p-3 border border-transparent hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(8,112,184,0.07)] transition-all duration-500">
              
              {/* Product Image Area */}
              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                   <button className="bg-white p-2.5 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-colors">
                    <Eye size={18} />
                  </button>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="px-2 pb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-md">
                    {product.category}
                  </span>
                  <div className="flex items-center text-amber-400 gap-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-slate-400 text-[10px] font-bold">{product.rating}</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base mb-3 truncate">{product.name}</h3>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 line-through">${parseInt(product.price) + 20}</span>
                    <span className="text-xl font-black text-slate-900">${product.price}</span>
                  </div>
                  <button 
                    onClick={addToCart}
                    className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-blue-600 shadow-lg shadow-slate-100 active:scale-90 transition-all"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CTA Section */}
      <section className="px-4 md:px-12 py-20">
        <div className="bg-blue-600 rounded-[3rem] p-10 md:p-20 relative overflow-hidden text-center text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h3 className="text-3xl md:text-5xl font-black mb-6">جاهز لتطوير أجهزتك؟</h3>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">اشترك في قائمتنا البريدية للحصول على أكواد خصم حصرية وإشعارات بأحدث المنتجات التقنية.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input type="text" placeholder="بريدك الإلكتروني" className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none focus:bg-white/20 transition-all" />
                <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all">اشترك</button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-right" dir="rtl">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">F</div>
              <h1 className="text-lg font-black tracking-tighter">FUTURE STORE</h1>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">أفضل متجر للمنتجات التقنية والذكية في المنطقة. نجمع لك الجودة والسعر في مكان واحد.</p>
          </div>
          <div>
            <h5 className="font-bold mb-6">روابط سريعة</h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">كل المنتجات</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">عروض التخفيضات</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">تتبع الطلبية</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6">الدعم الفني</h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">مركز المساعدة</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">سياسة الاستبدال</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">تواصل معنا</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6">تابعنا</h5>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">FB</div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">TW</div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">IG</div>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
          <p>© 2026 Future Store. All rights reserved. Powered by Al-Mustaqbal Net.</p>
        </div>
      </footer>
    </div>
  );
};

export default FutureStore;
