import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Eye, Star, Heart, Zap, ShieldCheck, Truck, Headphones, 
  Trash2, CreditCard, ArrowRight, CheckCircle2, X, Search, Filter, 
  ChevronDown, MapPin, Wallet, Package, StarHalf, Plus, Minus
} from 'lucide-react';

const productsData = [
  { id: 1, name: "JCG Q20 Custom Router", price: 45, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9, reviews: 128, desc: "الراوتر الأقوى لأصحاب الشبكات، يدعم تعديلات السوفتوير المتقدمة ويوفر تغطية جبارة.", specs: ["WiFi 6 Ready", "Custom Firmware", "High Gain Antennas"] },
  { id: 2, name: "Smart RGB Desk Lamp", price: 32, image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500", category: "Home Tech", rating: 4.7, reviews: 85, desc: "إضاءة مكتبية ذكية تريح العين وتدعم التحكم الصوتي الكامل.", specs: ["Eye Care Tech", "App Control", "Schedule Timer"] },
  { id: 3, name: "Noise Cancelling Buds Pro", price: 89, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", category: "Audio", rating: 4.8, reviews: 210, desc: "عزل صوتي فائق الدقة مع ميكروفونات عالية الوضوح للمكالمات.", specs: ["ANC 2.0", "Wireless Charging", "Spatial Audio"] },
  { id: 4, name: "Mechanical Gaming Keyboard", price: 110, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9, reviews: 156, desc: "لوحة مفاتيح احترافية للاعبين والمبرمجين، استجابة لحظية ومتانة عالية.", specs: ["Red Switches", "Anti-Ghosting", "RGB Sync"] },
  { id: 5, name: "UltraWide 4K Monitor", price: 350, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", category: "Setup", rating: 5.0, reviews: 42, desc: "شاشة الأحلام لكل صانع محتوى أو لاعب، ألوان دقيقة ومساحة عمل هائلة.", specs: ["10-bit Color", "HDR 400", "Zero Bezel"] },
  { id: 6, name: "Portable SSD 2TB", price: 145, image: "https://images.unsplash.com/photo-1597872200349-016042e54a4f?w=500", category: "Storage", rating: 4.6, reviews: 94, desc: "سرعة نقل بيانات خرافية في حجم أصغر من بطاقة الصراف.", specs: ["2000MB/s Speed", "Encryption", "Drop Proof"] },
  { id: 7, name: "Smart Fitness Watch S3", price: 199, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "Wearables", rating: 4.5, reviews: 320, desc: "مراقب صحي متكامل على معصمك، تتبع النوم، النبض، والتمارين.", specs: ["AMOLED Display", "7 Day Battery", "GPS"] },
  { id: 8, name: "Mesh WiFi System (3-Pack)", price: 280, image: "https://images.unsplash.com/photo-1631541490212-30239088656f?w=500", category: "Networking", rating: 4.9, reviews: 67, desc: "وداعاً لمناطق ضعف الإشارة في منزلك، تغطية شاملة لكل زاوية.", specs: ["Roaming Support", "Parental Controls", "Easy Setup"] },
];

const FutureStore = () => {
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // حفظ موقع التمرير
  const scrollPosition = useRef(0);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // نظام إدارة السلة المتقدم (دمج الكميات)
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showToast(`تم تحديث كمية ${product.name}`);
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    showToast("تم حذف المنتج من السلة");
  };

  const toggleWishlist = (product) => {
    const isFav = wishlist.find(item => item.id === product.id);
    setWishlist(isFav ? wishlist.filter(item => item.id !== product.id) : [...wishlist, product]);
    showToast(isFav ? "تم الحذف من المفضلة" : "تم الإضافة للمفضلة");
  };

  // التنقل مع حفظ موقع السكرول
  const navigateToDetails = (product) => {
    scrollPosition.current = window.scrollY; // حفظ الموقع الحالي
    setSelectedProduct(product);
    setView('details');
    window.scrollTo(0, 0); // الصعود لأعلى صفحة التفاصيل
  };

  const backToHome = () => {
    setView('home');
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition.current, behavior: 'instant' });
    }, 10);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Notifications */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${notification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="bg-slate-900/95 backdrop-blur-xl text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 min-w-[320px] border border-white/10">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 size={18} /></div>
          <span className="text-sm font-bold flex-1">{notification}</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div onClick={backToHome} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black group-hover:rotate-6 transition-all">F</div>
          <h1 className="text-xl font-black tracking-tighter">FUTURE STORE</h1>
        </div>

        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="ابحث عن التميز..." 
            className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-3 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={() => setView('wishlist')} className="p-3 hover:bg-slate-50 rounded-2xl relative">
            <Heart size={22} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
          </button>
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl relative flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
            <ShoppingCart size={20} />
            <span className="font-bold text-sm">${totalPrice}</span>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-white font-black animate-pulse">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* View: Home */}
      {view === 'home' && (
        <div className="animate-in fade-in duration-700">
          <div className="flex overflow-x-auto gap-3 px-6 md:px-12 py-8 no-scrollbar" dir="rtl">
            {["All", "Networking", "Home Tech", "Audio", "Gaming", "Setup", "Storage", "Wearables"].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${categoryFilter === cat ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-100'}`}
              >
                {cat === "All" ? "الكل" : cat}
              </button>
            ))}
          </div>

          <main className="px-6 md:px-12 py-4 max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {filteredProducts.map(product => {
              const inCart = cart.find(i => i.id === product.id);
              return (
                <div key={product.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 relative">
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div onClick={() => navigateToDetails(product)} className="absolute inset-0 cursor-pointer" />
                    <button onClick={() => toggleWishlist(product)} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                      <Heart size={18} className={wishlist.find(i => i.id === product.id) ? "fill-red-500 text-red-500" : ""} />
                    </button>
                  </div>
                  
                  <div className="mt-5 px-1" dir="rtl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">{product.category}</span>
                      <div className="flex items-center text-amber-400 gap-1"><Star size={12} fill="currentColor" /><span className="text-slate-400 text-xs font-bold">{product.rating}</span></div>
                    </div>
                    <h3 className="font-black text-slate-800 mb-4 truncate text-lg">{product.name}</h3>
                    
                    <div className="flex justify-between items-center bg-slate-50 rounded-[1.5rem] p-1 pr-4">
                      <span className="text-xl font-black text-slate-900">${product.price}</span>
                      
                      {inCart ? (
                        <div className="flex items-center gap-3 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                          <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg"><Minus size={14} /></button>
                          <span className="font-black text-sm w-4 text-center">{inCart.qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-blue-600 transition-all hover:rotate-6">
                          <ShoppingCart size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </main>
        </div>
      )}

      {/* View: Details */}
      {view === 'details' && selectedProduct && (
        <div className="max-w-7xl mx-auto p-6 md:p-20 animate-in slide-in-from-bottom-10 duration-700" dir="rtl">
          <button onClick={backToHome} className="flex items-center gap-3 text-slate-400 hover:text-blue-600 mb-12 font-black group transition-all">
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /> العودة للرئيسية
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
             <div className="relative group">
                <div className="absolute -inset-4 bg-blue-100 rounded-[5rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img src={selectedProduct.image} className="relative w-full aspect-square rounded-[4rem] object-cover shadow-2xl border-[12px] border-white" />
             </div>
             <div className="flex flex-col justify-center">
                <span className="text-blue-600 font-black tracking-[0.2em] mb-4">{selectedProduct.category}</span>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
                   <div className="flex text-amber-400"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><StarHalf fill="currentColor" /></div>
                   <span className="text-slate-400 font-bold text-lg">({selectedProduct.reviews} مراجعة صادقة)</span>
                </div>
                <p className="text-slate-500 text-xl leading-relaxed mb-10 font-medium">{selectedProduct.desc}</p>
                <div className="flex items-center gap-10">
                   <div className="flex flex-col">
                      <span className="text-slate-400 line-through font-bold text-lg">${selectedProduct.price + 40}</span>
                      <span className="text-6xl font-black text-slate-900">${selectedProduct.price}</span>
                   </div>
                   <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-slate-900 hover:-translate-y-1 transition-all">
                      أضف للحقيبة الآن
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* View: Cart */}
      {view === 'cart' && (
        <div className="max-w-6xl mx-auto p-6 md:p-16 animate-in zoom-in-95 duration-500" dir="rtl">
           <h2 className="text-5xl font-black mb-16">حقيبة التسوق <span className="text-blue-600">.</span></h2>
           {cart.length === 0 ? (
             <div className="text-center py-40 bg-white rounded-[4rem] shadow-sm border border-slate-50">
                <Package size={80} className="mx-auto text-slate-100 mb-8" />
                <p className="text-2xl font-bold text-slate-400 mb-10">هل حقاً ستغادر دون أي قطعة تقنية؟</p>
                <button onClick={backToHome} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black">ابدأ الاستكشاف</button>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-6">
                   {cart.map(item => (
                     <div key={item.id} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-8 shadow-sm border border-slate-50 group hover:shadow-xl transition-all">
                        <img src={item.image} className="w-32 h-32 rounded-[2rem] object-cover" />
                        <div className="flex-1">
                           <h4 className="font-bold text-xl mb-1">{item.name}</h4>
                           <p className="text-slate-400 text-sm mb-4">{item.category}</p>
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:text-blue-600 transition-colors"><Minus size={16} /></button>
                                <span className="font-black text-lg w-6 text-center">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:text-blue-600 transition-colors"><Plus size={16} /></button>
                              </div>
                              <span className="font-black text-2xl text-blue-600 ml-auto">${item.price * item.qty}</span>
                           </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-4 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                     </div>
                   ))}
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl h-fit sticky top-32">
                   <h3 className="text-2xl font-black mb-10">الحساب النهائي</h3>
                   <div className="space-y-6 mb-12 text-lg">
                      <div className="flex justify-between text-slate-400"><span>المجموع الفرعي</span> <span className="font-bold text-white">${totalPrice}</span></div>
                      <div className="flex justify-between text-slate-400"><span>الشحن</span> <span className="text-green-400 font-bold tracking-widest uppercase text-xs">Free Delivery</span></div>
                      <div className="flex justify-between text-3xl font-black pt-8 border-t border-white/10"><span>الإجمالي</span> <span>${totalPrice}</span></div>
                   </div>
                   <button className="w-full bg-blue-600 py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-900 transition-all active:scale-95">دفع عبر البطاقة / كريمي</button>
                </div>
             </div>
           )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-40 bg-white border-t border-slate-100 py-32 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-right" dir="rtl">
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white font-black text-xl">F</div>
                <h1 className="text-3xl font-black tracking-tighter">FUTURE STORE</h1>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium text-lg">بوابتك لكل ما هو استثنائي في عالم التقنية والشبكات. نختار الجودة أولاً.</p>
           </div>
           <div>
              <h5 className="font-black text-xl mb-10">استكشف الأقسام</h5>
              <ul className="space-y-5 text-slate-500 font-bold">
                 {["Networking", "Home Tech", "Audio", "Gaming"].map(cat => (
                   <li key={cat} onClick={() => { setCategoryFilter(cat); backToHome(); }} className="hover:text-blue-600 cursor-pointer flex items-center gap-2 group">
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2" /> {cat}
                   </li>
                 ))}
              </ul>
           </div>
           <div>
              <h5 className="font-black text-xl mb-10">خدمة العملاء</h5>
              <ul className="space-y-5 text-slate-500 font-bold">
                 <li className="hover:text-blue-600 cursor-pointer">تتبع الشحنة</li>
                 <li className="hover:text-blue-600 cursor-pointer">مركز المساعدة</li>
                 <li className="hover:text-blue-600 cursor-pointer">سياسة الاسترجاع</li>
              </ul>
           </div>
           <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100">
              <h5 className="font-black text-xl mb-6">النشرة الإخبارية</h5>
              <div className="relative group">
                 <input type="text" placeholder="بريدك الإلكتروني" className="w-full bg-white border border-slate-200 rounded-2xl py-5 px-6 text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                 <button className="absolute left-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-black text-xs hover:bg-slate-900 transition-all">اشترك</button>
              </div>
           </div>
        </div>
        <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 font-bold text-sm">
           <p>© 2026 Future Store. All Rights Reserved.</p>
           <div className="flex gap-8">
              <span className="hover:text-blue-600 cursor-pointer">Privacy</span>
              <span className="hover:text-blue-600 cursor-pointer">Terms</span>
              <span className="hover:text-blue-600 cursor-pointer">Cookies</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default FutureStore;
