import React, { useState } from 'react';
import { ShoppingCart, Eye, Star, Heart, Zap, ShieldCheck, Truck, Headphones, ChevronRight, Trash2, CreditCard, ArrowRight } from 'lucide-react';

const productsData = [
  { id: 1, name: "JCG Q20 Custom Router", price: 45, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9, desc: "راوتر معدل خصيصاً لشبكات المستقبل، يدعم أنظمة OpenWrt وفتح الترددات المخفية مع استقرار فائق في الأداء.", specs: ["WiFi 6 Ready", "Dual Core CPU", "Gigabit Ports"] },
  { id: 2, name: "Smart RGB Desk Lamp", price: 32, image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500", category: "Home Tech", rating: 4.7, desc: "إضاءة ذكية متوافقة مع اليكسا وجوجل هوم، تدعم 16 مليون لون مع وضع الموسيقى التفاعلي.", specs: ["Voice Control", "16M Colors", "App Control"] },
  { id: 3, name: "Noise Cancelling Buds", price: 89, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", category: "Audio", rating: 4.8, desc: "سماعات عازلة للضوضاء بتقنية ANC المتطورة، بطارية تدوم لـ 40 ساعة من الاستماع المتواصل.", specs: ["Active Noise Cancelling", "40h Battery", "IPX5 Water Resistant"] },
  { id: 4, name: "Mechanical Gaming Keyboard", price: 110, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9, desc: "لوحة مفاتيح ميكانيكية بسويتشات حمراء سريعة، إضاءة RGB كاملة قابلة للتخصيص وهيكل ألمنيوم.", specs: ["Red Switches", "Full RGB", "Aluminum Frame"] },
];

const FutureStore = () => {
  const [view, setView] = useState('home'); // home, details, cart
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  // وظائف السلة
  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} تمت إضافته للسلة!`);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // واجهة صفحة تفاصيل المنتج
  const ProductDetails = ({ product }) => (
    <div className="max-w-6xl mx-auto p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold">
        <ArrowRight size={20} /> العودة للمتجر
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-[3rem] overflow-hidden bg-white shadow-2xl">
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        </div>
        <div className="flex flex-col justify-center space-y-6 text-right" dir="rtl">
          <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full w-fit font-bold text-sm uppercase tracking-widest">{product.category}</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">{product.name}</h2>
          <div className="flex items-center gap-2 text-amber-400">
            <Star fill="currentColor" size={20} /> <span className="text-slate-900 font-bold text-lg">{product.rating}</span>
          </div>
          <p className="text-slate-500 text-lg leading-relaxed">{product.desc}</p>
          <div className="grid grid-cols-2 gap-4">
            {product.specs.map(spec => (
              <div key={spec} className="bg-slate-100 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" /> {spec}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 pt-6">
            <span className="text-4xl font-black text-slate-900">${product.price}</span>
            <button onClick={() => addToCart(product)} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
              <ShoppingCart size={20} /> إضافة للسلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // واجهة صفحة السلة
  const CartView = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-12 text-right animate-in zoom-in-95 duration-300" dir="rtl">
      <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
        <ShoppingCart size={32} className="text-blue-600" /> سلة المشتريات ({cart.length})
      </h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 mb-6">سلتك فارغة حالياً..</p>
          <button onClick={() => setView('home')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">ابدأ التسوق</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-3xl flex items-center gap-4 border border-slate-100">
                <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-blue-600 font-black">${item.price}</p>
                </div>
                <button onClick={() => removeFromCart(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 h-fit">
            <h3 className="font-black text-xl mb-6">ملخص الطلب</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-500"><span>المجموع الفرعي:</span> <span>${totalPrice}</span></div>
              <div className="flex justify-between text-slate-500"><span>الشحن:</span> <span className="text-green-500 font-bold italic text-xs underline decoration-2">مجاني</span></div>
              <hr/>
              <div className="flex justify-between text-2xl font-black text-slate-900"><span>الإجمالي:</span> <span>${totalPrice}</span></div>
            </div>
            
            <h4 className="font-bold mb-4 text-xs text-slate-400 uppercase tracking-widest">طرق الدفع المدعومة</h4>
            <div className="grid grid-cols-3 gap-2 mb-8">
              <div className="bg-slate-50 p-2 rounded-lg flex flex-col items-center gap-1 grayscale hover:grayscale-0 transition-all cursor-pointer border border-transparent hover:border-blue-500">
                <div className="text-[8px] font-bold text-blue-800">PayPal</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg flex flex-col items-center gap-1 grayscale hover:grayscale-0 transition-all cursor-pointer border border-transparent hover:border-blue-500">
                <div className="text-[8px] font-bold text-green-700">Kuraimi</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg flex flex-col items-center gap-1 grayscale hover:grayscale-0 transition-all cursor-pointer border border-transparent hover:border-blue-500">
                <div className="text-[8px] font-bold text-orange-600">Qutaibi</div>
              </div>
            </div>
            
            <button onClick={() => alert('سيتم توجيهك لبوابة الدفع قريباً')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg">
              <CreditCard size={20} /> إتمام الشراء
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-12 py-5 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform">F</div>
          <h1 className="text-xl font-black tracking-tighter">FUTURE STORE</h1>
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={() => setView('cart')} className="relative p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 border-2 border-white text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Dynamic View Engine */}
      {view === 'home' && (
        <>
          <header className="relative px-6 py-16 text-center overflow-hidden">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
                <ShieldCheck size={14} /> معتمد من قبل Al-Mustaqbal Net
             </div>
             <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">تسوّق بذكاء، <br/> <span className="text-blue-600 underline decoration-blue-100">بأسلوب المستقبل</span></h2>
          </header>

          <main className="px-4 md:px-12 py-10 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {productsData.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-[2rem] p-3 border border-slate-100 hover:border-blue-200 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl">
                  <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button onClick={() => { setSelectedProduct(product); setView('details'); }} className="bg-white p-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-xl">
                        <Eye size={18} /> تفاصيل
                      </button>
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{product.category}</span>
                      <div className="flex items-center text-amber-400 gap-1"><Star size={12} fill="currentColor" /> <span className="text-slate-400 text-[10px] font-bold">{product.rating}</span></div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base mb-3 truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black text-slate-900">${product.price}</span>
                      <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-blue-600 transition-all">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {view === 'details' && <ProductDetails product={selectedProduct} />}
      {view === 'cart' && <CartView />}

      <footer className="mt-20 border-t border-slate-100 py-10 text-center text-slate-400 text-xs">
        <p>© 2026 Future Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FutureStore;
