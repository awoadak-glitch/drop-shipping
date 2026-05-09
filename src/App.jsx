import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, 
  Zap, ShoppingBag, ChevronRight, Plus, Minus
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
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [toast, setToast] = useState(null);
  const [tempQty, setTempQty] = useState(1); // للتحكم بالكمية قبل الإضافة

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const unsubCart = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCart(docSnap.data().cart || []);
          }
        });
        return () => unsubCart();
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

  const syncCartToFirebase = async (newCart) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { cart: newCart }, { merge: true });
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if(result.user) showToast(`أهلاً بك ${result.user.displayName}`);
    } catch (error) {
      showToast("تأكد من إعدادات Firebase");
    }
  };

  const addToCart = async (product, qty = 1) => {
    if (!user) {
      showToast("سجل دخولك أولاً");
      handleLogin();
      return;
    }

    let updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      updatedCart[existingIndex].qty += qty;
    } else {
      updatedCart.push({ ...product, qty: qty, cartId: Date.now() });
    }

    setCart(updatedCart);
    await syncCartToFirebase(updatedCart);
    showToast("تم تحديث السلة ✅");
  };

  const updateCartQty = async (id, delta) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(updatedCart);
    await syncCartToFirebase(updatedCart);
  };

  const removeFromCart = async (cartId) => {
    const updatedCart = cart.filter(item => item.cartId !== cartId);
    setCart(updatedCart);
    await syncCartToFirebase(updatedCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10" dir="rtl">
      
      {/* Toast */}
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

      {/* Header */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-200">F</div>
          <span className="font-black text-gray-900 text-lg tracking-tighter">FUTURE STORE</span>
        </div>
        
        <div className="flex gap-2">
          {user ? (
            <button onClick={() => signOut(auth)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"><LogOut size={18}/></button>
          ) : (
            <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <LogIn size={16}/> دخول
            </button>
          )}
          <button 
            onClick={() => setView(view === 'cart' ? 'home' : 'cart')} 
            className={`${view === 'cart' ? 'bg-blue-600' : 'bg-gray-900'} text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl relative`}
          >
            {view === 'cart' ? <X size={18}/> : <ShoppingBag size={18} />}
            <span className="font-black text-sm">${totalPrice}</span>
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{totalItems}</span>}
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-8 max-w-lg mx-auto">
            {/* Hero Section */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
              <div className="relative z-10 text-right">
                <h2 className="text-3xl font-black mb-2">استكشف عالم <br/> التكنولوجيا</h2>
                <p className="text-blue-100 text-sm mb-6 opacity-80">أفضل الراوترات المعدلة بأعلى أداء</p>
                <button onClick={() => setActiveCategory("Networking")} className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2">ابدأ الآن <ChevronRight size={16}/></button>
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Categories */}
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

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-4">
              {productsData.filter(p => activeCategory === "الكل" || p.category === activeCategory).map((product) => (
                <motion.div layout key={product.id} className="bg-white rounded-[2rem] p-3 border border-gray-50 shadow-sm flex flex-col">
                  <div onClick={() => { setSelectedProduct(product); setTempQty(1); }} className="aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden relative mb-3 cursor-pointer">
                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400 text-yellow-400"/>
                      <span className="text-[10px] font-black">{product.rating}</span>
                    </div>
                  </div>
                  <div className="px-1 flex-1 flex flex-col">
                    <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1 mb-2 text-right">{product.name}</h3>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-sm font-black text-blue-600">${product.price}</span>
                      <button onClick={() => addToCart(product, 1)} className="bg-gray-900 text-white p-2.5 rounded-xl shadow-md">
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.main>
        ) : (
          <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-md mx-auto min-h-[60vh] flex flex-col">
             <h2 className="text-3xl font-black mb-8 text-right">سلتك الذكية</h2>
             {cart.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4">
                 <ShoppingBag size={60} strokeWidth={1} />
                 <p className="font-bold">السلة فارغة</p>
                 <button onClick={() => setView('home')} className="text-blue-600 font-bold text-sm underline">ابدأ بالتسوق</button>
               </div>
             ) : (
               <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div key={item.cartId} className="bg-white p-4 rounded-3xl flex items-center gap-4 border border-gray-50 shadow-sm">
                      <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                      <div className="flex-1 text-right">
                        <div className="font-bold text-xs mb-2">{item.name}</div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => updateCartQty(item.id, -1)} className="p-1 bg-gray-100 rounded-md"><Minus size={12}/></button>
                           <span className="text-xs font-black">{item.qty}</span>
                           <button onClick={() => updateCartQty(item.id, 1)} className="p-1 bg-gray-100 rounded-md"><Plus size={12}/></button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-blue-600">${item.price * item.qty}</div>
                        <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 mt-2"><Trash2 size={16}/></button>
                      </div>
                    </motion.div>
                  ))}
                  <div className="pt-10">
                    <div className="flex justify-between items-center mb-6 px-2">
                      <span className="text-gray-400 font-bold">الإجمالي النهائي</span>
                      <span className="text-2xl font-black text-gray-900">${totalPrice}</span>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl">
                      <CreditCard /> إتمام الدفع
                    </button>
                  </div>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal تفاصيل المنتج مع زيادة ونقصان */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full rounded-t-[3.5rem] p-8 shadow-2xl">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
              <img src={selectedProduct.image} className="w-full h-64 object-cover rounded-[2.5rem] mb-8 shadow-lg" alt="" />
              
              <div className="flex justify-between items-start mb-6 text-right">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedProduct.name}</h2>
                  <span className="text-blue-600 font-bold text-sm">{selectedProduct.category}</span>
                </div>
                <div className="text-left">
                  <div className="bg-gray-50 px-4 py-2 rounded-2xl font-black text-xl mb-2">${selectedProduct.price}</div>
                  {/* أزرار الزيادة والنقصان */}
                  <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl">
                    <button onClick={() => setTempQty(prev => Math.max(1, prev - 1))} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm"><Minus size={14}/></button>
                    <span className="font-black text-sm">{tempQty}</span>
                    <button onClick={() => setTempQty(prev => prev + 1)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm"><Plus size={14}/></button>
                  </div>
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-10 text-right">{selectedProduct.desc}</p>
              
              <button 
                onClick={() => { addToCart(selectedProduct, tempQty); setSelectedProduct(null); }}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
              >
                <ShoppingCart /> إضافة {tempQty} منتجات للسلة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FutureStore;
