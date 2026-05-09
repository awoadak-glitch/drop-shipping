import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, 
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, MapPin, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// إعدادات Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, orderBy } from "firebase/firestore";
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

const FutureStore = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ phone: '', address: '' });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home'); // 'home', 'cart', 'profile', 'admin'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [toast, setToast] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  
  // State لإضافة منتج جديد
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: 'Networking', desc: '' });

  useEffect(() => {
    // جلب المنتجات من Firebase
    const q = query(collection(db, "products"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    });

    // مراقبة حالة المستخدم والسلة والبروفايل
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCart(data.cart || []);
            setUserData({ phone: data.phone || '', address: data.address || '' });
          }
        });
      } else {
        setCart([]);
      }
    });

    return () => { unsubProducts(); unsubAuth(); };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) { showToast("فشل تسجيل الدخول"); }
  };

  const syncUserData = async (updates) => {
    if (user) {
      await setDoc(doc(db, "users", user.uid), updates, { merge: true });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return showToast("سجل دخولك أولاً");
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        rating: 5.0,
        createdAt: Date.now()
      });
      showToast("تمت إضافة المنتج بنجاح 🚀");
      setNewProduct({ name: '', price: '', image: '', category: 'Networking', desc: '' });
      setView('home');
    } catch (e) { showToast("خطأ في الإضافة"); }
  };

  const addToCart = async (product, qty = 1) => {
    if (!user) return handleLogin();
    let updatedCart = [...cart];
    const idx = updatedCart.findIndex(item => item.id === product.id);
    if (idx > -1) updatedCart[idx].qty += qty;
    else updatedCart.push({ ...product, qty, cartId: Date.now() });
    setCart(updatedCart);
    await syncUserData({ cart: updatedCart });
    showToast("تم تحديث السلة");
  };

  const updateCartQty = async (id, delta) => {
    const updated = cart.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item);
    setCart(updated);
    await syncUserData({ cart: updated });
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans pb-10" dir="rtl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-8 py-4 rounded-3xl shadow-2xl font-bold flex items-center gap-3">
            <Zap size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white/70 backdrop-blur-2xl z-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">FS</div>
          <h1 className="text-xl font-black tracking-tighter">FUTURE<span className="text-blue-600">.</span></h1>
        </div>

        <div className="flex gap-3">
          {user && (
            <button onClick={() => setView('admin')} className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-blue-50 transition-colors">
              <Settings size={20} />
            </button>
          )}
          <button onClick={() => setView(user ? 'profile' : 'home')} className="p-3 bg-slate-100 rounded-2xl text-slate-600">
            <User size={20} />
          </button>
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl relative">
            <ShoppingBag size={18} />
            <span className="font-bold text-sm">${totalPrice}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Home View */}
        {view === 'home' && (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 space-y-10">
            {/* Promo Card */}
            <section className="relative h-64 rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 text-white p-10 flex flex-col justify-center">
               <div className="relative z-10 space-y-4">
                  <h2 className="text-4xl font-black">أهلاً بك في <br/> مستقبل التسوق</h2>
                  <p className="text-slate-400 text-sm max-w-[200px]">احصل على أقوى العروض الحصرية على أجهزة الشبكات المعدلة.</p>
               </div>
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-blue-600/20" />
            </section>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {["الكل", "Networking", "Electronics", "Gaming"].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-4 rounded-[2rem] text-sm font-black whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.filter(p => activeCategory === "الكل" || p.category === activeCategory).map(product => (
                <motion.div layout key={product.id} className="group bg-white p-4 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all">
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-50 mb-4 cursor-pointer" onClick={() => { setSelectedProduct(product); setTempQty(1); }}>
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-black">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end px-2">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800">{product.name}</h3>
                      <p className="text-blue-600 font-black text-xl">${product.price}</p>
                    </div>
                    <button onClick={() => addToCart(product)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200">
                      <Plus size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.main>
        )}

        {/* Admin/Add Product View */}
        {view === 'admin' && (
          <motion.div key="admin" initial={{ x: 100 }} animate={{ x: 0 }} className="max-w-md mx-auto p-8 space-y-8">
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setView('home')} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"><X size={20}/></button>
              <h2 className="text-2xl font-black italic">إضافة منتج للسوق</h2>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" placeholder="اسم المنتج" required className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] focus:ring-2 ring-blue-100 outline-none transition-all" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="number" placeholder="السعر بالدولار" required className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <input type="url" placeholder="رابط صورة المنتج" required className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <select className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option>Networking</option>
                <option>Electronics</option>
                <option>Gaming</option>
              </select>
              <textarea placeholder="وصف المنتج..." required className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] h-32 outline-none" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100">نشر المنتج الآن</button>
            </form>
          </motion.div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <motion.div key="profile" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md mx-auto p-8 text-center space-y-8">
            <div className="relative inline-block mb-6">
              <img src={user?.photoURL} className="w-32 h-32 rounded-[3rem] mx-auto border-4 border-white shadow-2xl" alt="" />
              <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
            <div>
              <h2 className="text-2xl font-black">{user?.displayName}</h2>
              <p className="text-slate-400 text-sm font-medium">{user?.email}</p>
            </div>
            
            <div className="space-y-4 text-right">
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <Phone size={18} className="text-blue-600" />
                <input type="text" placeholder="رقم الهاتف" className="flex-1 outline-none font-bold text-sm" value={userData.phone} onChange={e => {setUserData({...userData, phone: e.target.value}); syncUserData({phone: e.target.value});}} />
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <MapPin size={18} className="text-blue-600" />
                <input type="text" placeholder="عنوان الشحن بالتفصيل" className="flex-1 outline-none font-bold text-sm" value={userData.address} onChange={e => {setUserData({...userData, address: e.target.value}); syncUserData({address: e.target.value});}} />
              </div>
            </div>

            <button onClick={() => signOut(auth)} className="w-full py-5 text-red-500 font-black border-2 border-red-50 flex items-center justify-center gap-3 rounded-[2rem] hover:bg-red-50 transition-colors">
              <LogOut size={20}/> تسجيل الخروج
            </button>
          </motion.div>
        )}

        {/* Cart View */}
        {view === 'cart' && (
          <motion.div key="cart" className="max-w-md mx-auto p-8 space-y-6">
            <h2 className="text-3xl font-black mb-10">حقيبة التسوق</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><Package size={40}/></div>
                <p className="text-slate-400 font-bold">لا توجد منتجات حتى الآن</p>
                <button onClick={() => setView('home')} className="text-blue-600 font-black text-sm">تصفح المنتجات</button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.cartId} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center gap-4 shadow-sm">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                    <div className="flex-1 text-right space-y-2">
                      <p className="font-bold text-sm text-slate-800">{item.name}</p>
                      <div className="flex items-center gap-3">
                         <button onClick={() => updateCartQty(item.id, -1)} className="p-1.5 bg-slate-50 rounded-lg"><Minus size={14}/></button>
                         <span className="text-xs font-black">{item.qty}</span>
                         <button onClick={() => updateCartQty(item.id, 1)} className="p-1.5 bg-slate-50 rounded-lg"><Plus size={14}/></button>
                      </div>
                    </div>
                    <div className="text-left font-black text-blue-600">${item.price * item.qty}</div>
                  </div>
                ))}
                <div className="pt-10 border-t border-slate-100 mt-10">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-slate-400 font-bold">الإجمالي الكلي</span>
                    <span className="text-3xl font-black">${totalPrice}</span>
                  </div>
                  <button className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform">
                    <CreditCard /> دفع آمن بالبطاقة
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-lg mx-auto rounded-t-[4rem] p-10 shadow-2xl overflow-hidden">
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
              <img src={selectedProduct.image} className="w-full h-72 object-cover rounded-[3rem] mb-8 shadow-xl" alt="" />
              <div className="flex justify-between items-start mb-6 text-right">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">{selectedProduct.name}</h3>
                  <span className="text-blue-600 font-black text-sm uppercase tracking-widest">{selectedProduct.category}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                   <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xl">${selectedProduct.price}</div>
                   <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                      <button onClick={() => setTempQty(p => Math.max(1, p - 1))} className="p-1"><Minus size={14}/></button>
                      <span className="font-black text-xs">{tempQty}</span>
                      <button onClick={() => setTempQty(p => p + 1)} className="p-1"><Plus size={14}/></button>
                   </div>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-loose text-right mb-10">{selectedProduct.desc}</p>
              <button onClick={() => { addToCart(selectedProduct, tempQty); setSelectedProduct(null); }} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-4">
                <ShoppingCart size={22} /> تأكيد الإضافة للسلة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FutureStore;
