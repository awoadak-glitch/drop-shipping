import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, 
  Zap, ShoppingBag, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// إعدادات Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcMWM1iswp-vM3QYuP4C2HXDYB8XB95T8",
  authDomain: "akstore-4191f.firebaseapp.com",
  projectId: "akstore-4191f",
  storageBucket: "akstore-4191f.firebasestorage.app",
  messagingSenderId: "609095241437",
  appId: "1:609095241437:web:b0fa3e3392279e6ff45534",
  measurementId: "G-HH5X5G7BES"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const productsData = [
  { id: 1, name: "JCG Q20 Custom Router", price: 45, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9, desc: "راوتر معدل بأداء عالي للشبكات وتغطية واسعة." },
  { id: 2, name: "Premium Wireless Headset", price: 120, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "Electronics", rating: 4.8, desc: "سماعات لاسلكية بجودة صوت نقية وعزل ضوضاء." },
  { id: 3, name: "Smart Watch Series", price: 85, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "Tech", rating: 4.7, desc: "ساعة ذكية لمتابعة النشاط الرياضي والصحة." },
  { id: 4, name: "Mechanical Keyboard", price: 60, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9, desc: "لوحة مفاتيح ميكانيكية استجابة سريعة جداً." }
];

const FutureStore = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home'); // 'home' or 'cart'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setCart(docSnap.data().cart || []);
        });
      } else {
        setCart([]);
      }
    });
    return () => unsubAuth();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if(result.user) showToast(`أهلاً بك ${result.user.displayName}`);
    } catch (error) {
      showToast("تعذر الدخول حالياً");
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      showToast("سجل دخولك أولاً");
      handleLogin();
      return;
    }
    const updated = [...cart, { ...product, cartId: Date.now() }];
    setCart(updated);
    await setDoc(doc(db, "users", user.uid), { cart: updated }, { merge: true });
    showToast("تمت الإضافة ✅");
  };

  const removeFromCart = async (cartId) => {
    const updated = cart.filter(item => item.cartId !== cartId);
    setCart(updated);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { cart: updated }, { merge: true });
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10" dir="rtl">
      
      {/* التنبيهات (Toast) */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <Zap size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الهيدر (ثابت دائماً لحل مشكلة السلة) */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3" onClick={() => setView('home')} style={{cursor: 'pointer'}}>
          <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-200">F</div>
          <span className="font-black text-gray-900 text-lg tracking-tighter">FUTURE STORE</span>
        </div>
        
        <div className="flex gap-2">
          {user ? (
            <button onClick={() => signOut(auth)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"><LogOut size={18}/></button>
          ) : (
            <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
              <LogIn size={16}/> دخول
            </button>
          )}
          <button 
            onClick={() => setView(view === 'cart' ? 'home' : 'cart')} 
            className={`${view === 'cart' ? 'bg-blue-600' : 'bg-gray-900'} text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-xl`}
          >
            {view === 'cart' ? <X size={18}/> : <ShoppingBag size={18} />}
            <span className="font-black text-sm">${totalPrice}</span>
          </button>
        </div>
      </nav>

      {/* المحتوى المتغير */}
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.main 
            key="home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="p-4 space-y-8 max-w-lg mx-auto"
          >
            {/* Hero Section */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
              <div className="relative z-10 text-right">
                <h2 className="text-3xl font-black mb-2">استكشف عالم <br/> التكنولوجيا</h2>
                <p className="text-blue-100 text-sm mb-6 opacity-80">أفضل الراوترات المعدلة خصيصاً لك</p>
                <button onClick={() => setActiveCategory("Networking")} className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2">استكشف الآن <ChevronRight size={16}/></button>
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* الأقسام */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {["الكل", "Networking", "Electronics", "Gaming"].map(cat => (
                <button 
                  key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* شبكة المنتجات */}
            <div className="grid grid-cols-2 gap-4">
              {productsData.filter(p => activeCategory === "الكل" || p.category === activeCategory).map((product, idx) => (
                <motion.div 
                  layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  key={product.id} className="bg-white rounded-[2rem] p-3 border border-gray-50 shadow-sm flex flex-col"
                >
                  <div onClick={() => setSelectedProduct(product)} className="aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden relative mb-3 cursor-pointer">
                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400 text-yellow-400"/>
                      <span className="text-[10px] font-black">{product.rating}</span>
                    </div>
                  </div>
                  <div className="px-1 flex-1 flex flex-col">
                    <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1 mb-2">{product.name}</h3>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-sm font-black text-blue-600">${product.price}</span>
                      <button onClick={() => addToCart(product)} className="bg-gray-900 text-white p-2.5 rounded-xl shadow-md active:scale-90 transition-transform">
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.main>
        ) : (
          <motion.div 
            key="cart" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="p-6 max-w-md mx-auto min-h-[60vh] flex flex-col"
          >
             <h2 className="text-3xl font-black mb-8 text-right">سلتك الذكية</h2>
             {cart.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4">
                 <ShoppingBag size={60} strokeWidth={1} />
                 <p className="font-bold">السلة فارغة تماماً</p>
                 <button onClick={() => setView('home')} className="text-blue-600 font-bold text-sm underline">ابدأ بالتسوق الآن</button>
               </div>
             ) : (
               <div className="space-y-4">
                  {cart.map((item, i) => (
                    <motion.div key={item.cartId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-3xl flex items-center gap-4 border border-gray-50 shadow-sm">
                      <img src={item.image} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                      <div className="flex-1 font-bold text-xs text-right">{item.name}</div>
                      <div className="font-black text-blue-600 ml-2">${item.price}</div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </motion.div>
                  ))}
                  <div className="pt-10">
                    <div className="flex justify-between items-center mb-6 px-2">
                      <span className="text-gray-400 font-bold">الإجمالي النهائي</span>
                      <span className="text-2xl font-black text-gray-900">${totalPrice}</span>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform">
                      <CreditCard /> إتمام عملية الشراء
                    </button>
                  </div>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal تفاصيل المنتج */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full rounded-t-[3.5rem] p-8 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
              <img src={selectedProduct.image} className="w-full h-64 object-cover rounded-[2.5rem] mb-8 shadow-lg" alt="" />
              <div className="flex justify-between items-start mb-4 text-right">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedProduct.name}</h2>
                  <span className="text-blue-600 font-bold text-sm">{selectedProduct.category}</span>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-2xl font-black text-xl">${selectedProduct.price}</div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-10 text-right">{selectedProduct.desc}</p>
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
              >
                <ShoppingCart /> إضافة إلى السلة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FutureStore;
