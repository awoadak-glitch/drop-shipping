import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Star, Heart, Zap, ShieldCheck, Truck, Headphones, Trash2, CreditCard, ArrowRight, CheckCircle2, X } from 'lucide-react';

const productsData = [
  { id: 1, name: "JCG Q20 Custom Router", price: 45, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9, desc: "راوتر معدل لشبكة المستقبل، يدعم OpenWrt مع استقرار فائق.", specs: ["WiFi 6 Ready", "Gigabit Ports"] },
  { id: 2, name: "Smart RGB Desk Lamp", price: 32, image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500", category: "Home Tech", rating: 4.7, desc: "إضاءة ذكية متوافقة مع اليكسا وجوجل هوم.", specs: ["Voice Control", "16M Colors"] },
  { id: 3, name: "Noise Cancelling Buds", price: 89, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", category: "Audio", rating: 4.8, desc: "سماعات عازلة للضوضاء بتقنية ANC المتطورة.", specs: ["ANC Support", "40h Battery"] },
  { id: 4, name: "Mechanical Gaming Keyboard", price: 110, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9, desc: "لوحة مفاتيح ميكانيكية بسويتشات حمراء سريعة.", specs: ["Red Switches", "Full RGB"] },
  { id: 5, name: "UltraWide 4K Monitor", price: 350, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", category: "Setup", rating: 5.0, desc: "شاشة فائقة العرض بدقة 4K لتجربة بصرية مذهلة.", specs: ["144Hz Refresh", "IPS Panel"] },
  { id: 6, name: "Portable SSD 2TB", price: 145, image: "https://images.unsplash.com/photo-1597872200349-016042e54a4f?w=500", category: "Storage", rating: 4.6, desc: "وحدة تخزين سريعة جداً ومحمولة للأعمال الشاقة.", specs: ["USB-C 3.2", "Shock Resistant"] }
];

const FutureStore = () => {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);

  // نظام الإشعارات المخصص
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    showToast(`تمت إضافة ${product.name} إلى سلتك بنجاح!`);
  };

  const removeFromCart = (index) => {
    const itemName = cart[index].name;
    setCart(cart.filter((_, i) => i !== index));
    showToast(`تم حذف ${itemName} من السلة`);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // مكون الإشعار المنبثق (Toast)
  const Toast = () => (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${notification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 min-w-[300px]">
        <CheckCircle2 className="text-green-400" size={20} />
        <span className="text-sm font-bold ml-auto">{notification}</span>
        <X size={16} className="text-slate-500 cursor-pointer" onClick={() => setNotification(null)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100">
      <Toast />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform">F</div>
          <h1 className="text-xl font-black tracking-tighter">FUTURE STORE</h1>
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={() => setView('cart')} className="relative p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 border-2 border-white text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Views */}
      {view === 'home' && (
        <div className="animate-in fade-in duration-700">
          <header className="px-6 py-16 text-center">
             <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">تسوّق بذكاء، <br/> <span className="text-blue-600">بأسلوب المستقبل</span></h2>
             <p className="text-slate-400 font-medium">اخترنا لك أفضل المنتجات التقنية المعتمدة</p>
          </header>

          <main className="px-4 md:px-12 py-10 max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {productsData.map((product) => (
              <div key={product.id} className="group bg-white rounded-[2rem] p-3 border border-slate-100 hover:border-blue-200 transition-all duration-500 shadow-sm hover:shadow-2xl">
                <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => { setSelectedProduct(product); setView('details'); }} className="bg-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-xl hover:bg-blue-600 hover:text-white transition-colors">
                      <Eye size={18} /> عرض التفاصيل
                    </button>
                  </div>
                </div>
                <div className="px-2">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base mb-3 truncate text-right" dir="rtl">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-slate-900">${product.price}</span>
                    <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-blue-600 transition-all">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      )}

      {view === 'details' && selectedProduct && (
        <div className="max-w-6xl mx-auto p-6 md:p-12 text-right" dir="rtl">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold">
            <ArrowRight size={20} /> العودة للرئيسية
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
              <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">{selectedProduct.name}</h2>
              <p className="text-slate-500 text-lg leading-relaxed">{selectedProduct.desc}</p>
              <div className="grid grid-cols-2 gap-4">
                {selectedProduct.specs.map(spec => (
                  <div key={spec} className="bg-blue-50 p-3 rounded-2xl text-xs font-bold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={16} /> {spec}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 pt-10">
                <span className="text-4xl font-black text-slate-900">${selectedProduct.price}</span>
                <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-blue-200">إضافة للسلة</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'cart' && (
        <div className="max-w-4xl mx-auto p-6 md:p-12 text-right animate-in zoom-in-95" dir="rtl">
          <h2 className="text-3xl font-black mb-10 flex items-center gap-4">سلة المشتريات ({cart.length})</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 mb-6">سلتك لا تزال تنتظر أول منتج..</p>
               <button onClick={() => setView('home')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold">تسوّق الآن</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-3xl flex items-center gap-4 border border-slate-100 shadow-sm">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-1 text-right">
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-blue-600 font-black">${item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl h-fit">
                <h3 className="font-black text-xl mb-6">الدفع الإجمالي</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-400"><span>المجموع:</span> <span>${totalPrice}</span></div>
                  <div className="flex justify-between text-green-400"><span>الشحن:</span> <span>مجاني</span></div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-slate-800"><span>الإجمالي:</span> <span>${totalPrice}</span></div>
                </div>
                <div className="space-y-2 mb-8">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">طرق الدفع في اليمن</p>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-white/10 p-2 rounded-lg text-[9px] text-center font-bold">PayPal</div>
                     <div className="bg-white/10 p-2 rounded-lg text-[9px] text-center font-bold">كريمي</div>
                     <div className="bg-white/10 p-2 rounded-lg text-[9px] text-center font-bold">قطيبي</div>
                  </div>
                </div>
                <button className="w-full bg-blue-600 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl transition-all">إتمام الشراء الآن</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FutureStore;
