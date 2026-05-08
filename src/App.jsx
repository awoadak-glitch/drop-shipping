import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Eye, Star, Heart, Zap, ShieldCheck, Truck, Headphones, 
  Trash2, CreditCard, ArrowRight, CheckCircle2, X, Search, Filter, 
  ChevronDown, MapPin, Wallet, Package, StarHalf
} from 'lucide-react';

// قاعدة بيانات المنتجات الموسعة
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
  // States
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Notifications Logic
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Cart & Wishlist Actions
  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Math.random() }]);
    showToast(`تم إضافة ${product.name} للسلة`);
  };

  const toggleWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      showToast("تم الحذف من المفضلة");
    } else {
      setWishlist([...wishlist, product]);
      showToast("تم الإضافة للمفضلة");
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsData.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // --- Components ---

  const Navbar = () => (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
      <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">F</div>
        <h1 className="text-xl font-black tracking-tighter hidden md:block">FUTURE STORE</h1>
      </div>

      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="ابحث عن منتجك القادم..." 
          className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-3 items-center">
        <button onClick={() => setView('wishlist')} className="p-3 hover:bg-slate-100 rounded-2xl relative transition-all">
          <Heart size={22} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
          {wishlist.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
        <button onClick={() => setView('cart')} className="p-3 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl relative transition-all flex items-center gap-2">
          <ShoppingCart size={22} />
          <span className="font-bold text-sm hidden md:block">${totalPrice}</span>
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
        </button>
      </div>
    </nav>
  );

  const ProductCard = ({ product }) => (
    <div className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:border-blue-100 hover:shadow-2xl transition-all duration-500">
      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-2xl text-slate-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart size={18} className={wishlist.find(i => i.id === product.id) ? "fill-red-500 text-red-500" : ""} />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <button 
            onClick={() => { setSelectedProduct(product); setView('details'); }}
            className="w-full bg-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl"
          >
            <Eye size={18} /> عرض التفاصيل
          </button>
        </div>
      </div>
      <div className="mt-4 px-2" dir="rtl">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{product.category}</span>
          <div className="flex items-center text-amber-400 gap-1"><Star size={12} fill="currentColor" /> <span className="text-slate-400 text-[10px] font-bold">({product.rating})</span></div>
        </div>
        <h3 className="font-bold text-slate-900 mb-4 truncate text-lg">{product.name}</h3>
        <div className="flex justify-between items-center border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900">${product.price}</span>
            <span className="text-[10px] text-green-500 font-bold italic">متوفر في المخزن</span>
          </div>
          <button onClick={() => addToCart(product)} className="bg-slate-100 text-slate-900 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Notifications */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${notification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[320px]">
          <CheckCircle2 className="text-green-400" size={24} />
          <span className="text-sm font-bold flex-1">{notification}</span>
        </div>
      </div>

      <Navbar />

      {/* View Switcher */}
      {view === 'home' && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          {/* Categories Bar */}
          <div className="flex overflow-x-auto gap-4 px-6 md:px-12 py-8 no-scrollbar" dir="rtl">
            {["All", "Networking", "Home Tech", "Audio", "Gaming", "Setup", "Storage", "Wearables"].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border-2 ${categoryFilter === cat ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
              >
                {cat === "All" ? "الكل" : cat}
              </button>
            ))}
          </div>

          <main className="px-6 md:px-12 py-4 max-w-[1600px] mx-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-40">
                <Search size={64} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-bold text-slate-400">لم نجد ما تبحث عنه..</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </main>
        </div>
      )}

      {view === 'details' && selectedProduct && (
        <div className="max-w-7xl mx-auto p-6 md:p-20 animate-in zoom-in-95 duration-500" dir="rtl">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-12 font-black transition-all">
            <ArrowRight size={24} /> العودة للمنتجات
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-6">
               <div className="aspect-square rounded-[4rem] overflow-hidden bg-white shadow-2xl border-8 border-white">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" />
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-2xl bg-slate-200 opacity-50 border-2 border-transparent hover:border-blue-600 cursor-pointer overflow-hidden"><img src={selectedProduct.image} className="w-full h-full object-cover" /></div>)}
               </div>
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <span className="text-blue-600 font-black tracking-widest uppercase text-sm">{selectedProduct.category}</span>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 text-amber-400 border-b border-slate-100 pb-6">
                  <div className="flex"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><StarHalf fill="currentColor"/></div>
                  <span className="text-slate-400 font-bold">({selectedProduct.reviews} مراجعة من المشترين)</span>
                </div>
              </div>
              <p className="text-slate-500 text-xl leading-relaxed font-medium">{selectedProduct.desc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProduct.specs.map(spec => (
                  <div key={spec} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck size={20}/></div>
                    <span className="font-bold text-slate-700">{spec}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-8 pt-10">
                <div className="flex flex-col">
                   <span className="text-slate-400 line-through text-lg font-bold">${selectedProduct.price + 50}</span>
                   <span className="text-5xl font-black text-slate-900">${selectedProduct.price}</span>
                </div>
                <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-slate-900 transition-all transform hover:-translate-y-1">
                   إضافة إلى حقيبة التسوق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'cart' && (
        <div className="max-w-6xl mx-auto p-6 md:p-16 animate-in fade-in duration-500" dir="rtl">
           <h2 className="text-4xl font-black mb-12 flex items-center gap-6">سلة المشتريات <span className="text-slate-200">/</span> {cart.length}</h2>
           {cart.length === 0 ? (
             <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm">
                <Package size={80} className="mx-auto text-slate-100 mb-8" />
                <p className="text-2xl font-bold text-slate-400 mb-8">سلتك خالية من الإبداع حالياً..</p>
                <button onClick={() => setView('home')} className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg">اكتشف منتجاتنا</button>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               <div className="lg:col-span-2 space-y-6">
                 {cart.map((item, index) => (
                   <div key={item.cartId} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-8 shadow-sm border border-slate-50 group hover:shadow-xl transition-all">
                      <img src={item.image} className="w-28 h-28 rounded-3xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-xl mb-2">{item.name}</h4>
                        <p className="text-slate-400 text-sm mb-4">{item.category}</p>
                        <span className="font-black text-2xl text-blue-600">${item.price}</span>
                      </div>
                      <button onClick={() => { setCart(cart.filter((_, i) => i !== index)); showToast("تم الحذف"); }} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={24} />
                      </button>
                   </div>
                 ))}
               </div>
               <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl h-fit sticky top-32">
                  <h3 className="text-2xl font-black mb-10 border-b border-white/10 pb-6">ملخص الفاتورة</h3>
                  <div className="space-y-6 mb-10 text-lg">
                    <div className="flex justify-between text-slate-400"><span>المجموع:</span> <span className="font-bold text-white">${totalPrice}</span></div>
                    <div className="flex justify-between text-slate-400"><span>ضريبة التوصيل:</span> <span className="text-green-400 font-bold tracking-widest uppercase text-sm">FREE</span></div>
                    <div className="flex justify-between text-3xl font-black pt-6 border-t border-white/10"><span>الإجمالي:</span> <span>${totalPrice}</span></div>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">اختر وسيلة الدفع</p>
                    <div className="grid grid-cols-2 gap-3">
                       <button className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center hover:bg-blue-600 hover:border-blue-600 transition-all group">
                         <div className="font-black text-sm italic group-hover:text-white">PayPal</div>
                       </button>
                       <button className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center hover:bg-green-600 hover:border-green-600 transition-all group">
                         <div className="font-black text-sm group-hover:text-white">كريمي</div>
                       </button>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-900 transition-all flex items-center justify-center gap-4">
                    <CreditCard size={24} /> تأكيد الطلب
                  </button>
               </div>
             </div>
           )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-40 bg-white border-t border-slate-100 py-20 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-right" dir="rtl">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">F</div>
                <h1 className="text-2xl font-black">FUTURE STORE</h1>
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">نحن هنا لنغير مفهوم التجارة الإلكترونية في المنطقة عبر توفير أفضل التقنيات العالمية بضمان محلي حقيقي.</p>
           </div>
           <div>
              <h5 className="font-black text-xl mb-8">استكشف</h5>
              <ul className="space-y-4 text-slate-500 font-bold">
                 <li className="hover:text-blue-600 cursor-pointer">أجهزة الشبكات</li>
                 <li className="hover:text-blue-600 cursor-pointer">المنزل الذكي</li>
                 <li className="hover:text-blue-600 cursor-pointer">إكسسوارات الألعاب</li>
              </ul>
           </div>
           <div>
              <h5 className="font-black text-xl mb-8">الدعم</h5>
              <ul className="space-y-4 text-slate-500 font-bold">
                 <li className="hover:text-blue-600 cursor-pointer">تتبع طلبك</li>
                 <li className="hover:text-blue-600 cursor-pointer">سياسة الضمان</li>
                 <li className="hover:text-blue-600 cursor-pointer">الأسئلة الشائعة</li>
              </ul>
           </div>
           <div className="bg-blue-50 p-8 rounded-[3rem] space-y-6">
              <h5 className="font-black text-xl text-blue-900">اشترك للخصومات</h5>
              <div className="relative">
                 <input type="text" placeholder="بريدك الإلكتروني" className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm outline-none shadow-sm" />
                 <button className="absolute left-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-bold">انضم</button>
              </div>
           </div>
        </div>
        <div className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 font-bold text-sm">
           <p>© 2026 Future Store. Developed for the Future Net Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
};

export default FutureStore;
