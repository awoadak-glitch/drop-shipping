import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, MapPin, Phone, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// إعدادات Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, deleteDoc } from "firebase/firestore";
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
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [toast, setToast] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  
  // نظام الشات
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  // التقييمات والتعليقات
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: 'Networking', desc: '' });

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setCart(docSnap.data().cart || []);
            setUserData({ phone: docSnap.data().phone || '', address: docSnap.data().address || '' });
          }
        });
      }
    });

    return () => { unsubProducts(); unsubAuth(); };
  }, []);

  // جلب التعليقات والشات في حال اختيار منتج أو محادثة
  useEffect(() => {
    if (selectedProduct) {
      const q = query(collection(db, `products/${selectedProduct.id}/reviews`), orderBy("date", "desc"));
      return onSnapshot(q, (s) => setReviews(s.docs.map(d => d.data())));
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (chatInfo) {
      const q = query(collection(db, `chats/${chatInfo.id}/messages`), orderBy("time", "asc"));
      return onSnapshot(q, (s) => setMessages(s.docs.map(d => d.data())));
    }
  }, [chatInfo]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleLogin = async () => {
    try { await signInWithPopup(auth, provider); } catch (e) { showToast("فشل تسجيل الدخول"); }
  };

  const syncCart = async (newCart) => {
    if (user) await setDoc(doc(db, "users", user.uid), { cart: newCart }, { merge: true });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return showToast("سجل دخولك");
    await addDoc(collection(db, "products"), { ...newProduct, price: Number(newProduct.price), sellerId: user.uid, rating: 5, createdAt: Date.now() });
    showToast("تم النشر ✅");
    setView('home');
    setNewProduct({ name: '', price: '', image: '', category: 'Networking', desc: '' });
  };

  const deleteProduct = async (id) => {
    if(window.confirm("هل تريد حذف هذا المنتج نهائياً؟")) {
      await deleteDoc(doc(db, "products", id));
      showToast("تم الحذف");
    }
  };

  const addToCart = async (product, qty = 1) => {
    if (!user) return handleLogin();
    let newCart = [...cart];
    const idx = newCart.findIndex(i => i.id === product.id);
    if (idx > -1) newCart[idx].qty += qty;
    else newCart.push({ ...product, qty, cartId: Date.now() });
    setCart(newCart);
    await syncCart(newCart);
    showToast("أضيف للسلة");
  };

  const removeFromCart = async (cartId) => {
    const newCart = cart.filter(i => i.cartId !== cartId);
    setCart(newCart);
    await syncCart(newCart);
  };

  const addReview = async () => {
    if(!user || !reviewInput) return;
    await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), {
      text: reviewInput, rating: ratingInput, userName: user.displayName, date: Date.now()
    });
    setReviewInput("");
  };

  const sendMsg = async () => {
    if(!msgInput || !chatInfo) return;
    await addDoc(collection(db, `chats/${chatInfo.id}/messages`), {
      text: msgInput, sender: user.uid, time: Date.now()
    });
    setMsgInput("");
  };

  const totalPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20" dir="rtl">
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm">
            <Zap size={16} className="text-blue-400"/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">F</div>
          <span className="font-black tracking-tighter">FUTURE STORE</span>
        </div>
        <div className="flex gap-2">
          {user && <button onClick={() => setView('admin')} className="p-2.5 bg-slate-100 rounded-xl"><Plus size={20}/></button>}
          <button onClick={() => setView(user ? 'profile' : 'home')} className="p-2.5 bg-slate-100 rounded-xl"><User size={20}/></button>
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 relative shadow-lg">
            <ShoppingBag size={18}/>
            <span className="font-bold text-sm">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-4 h-4 rounded-full text-[10px] flex items-center justify-center border border-white">{cart.length}</span>}
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Home: Grid 2 Columns */}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-4xl mx-auto space-y-6">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
               <h2 className="text-3xl font-black mb-2">أهلاً بك، <br/>{user?.displayName || 'ضيفنا'}</h2>
               <p className="text-blue-100 text-xs opacity-70">استكشف أحدث التقنيات والراوترات المعدلة</p>
               <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
              {["الكل", "Networking", "Electronics", "Gaming"].map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCategory === c ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{c}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.filter(p => activeCategory === "الكل" || p.category === activeCategory).map(product => (
                <div key={product.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-50 relative group">
                  {user?.uid === product.sellerId && (
                    <button onClick={() => deleteProduct(product.id)} className="absolute top-4 left-4 z-10 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                  )}
                  <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-3 bg-slate-50" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <h3 className="text-[11px] font-bold line-clamp-1 mb-2 px-1">{product.name}</h3>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-blue-600 font-black text-sm">${product.price}</span>
                    <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-2 rounded-xl shadow-md"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cart: With Remove Ability */}
        {view === 'cart' && (
          <motion.div key="cart" className="p-6 max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-black">سلة المشتريات</h2>
            {cart.length === 0 ? (
              <div className="py-20 text-center opacity-30 font-bold">السلة فارغة</div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cartId} className="bg-white p-4 rounded-3xl flex items-center gap-4 border border-slate-50">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    <div className="flex-1">
                      <p className="font-bold text-xs">{item.name}</p>
                      <p className="text-blue-600 font-black">${item.price * item.qty}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="p-2 text-red-400 bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                ))}
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white mt-10">
                  <div className="flex justify-between mb-4"><span>الإجمالي:</span><span className="font-black text-xl">${totalPrice}</span></div>
                  <button className="w-full bg-blue-600 py-4 rounded-2xl font-black shadow-lg">إتمام الطلب</button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Admin: Add Product */}
        {view === 'admin' && (
          <motion.div key="admin" className="p-6 max-w-md mx-auto">
             <h2 className="text-2xl font-black mb-6">أضف منتجك الجديد</h2>
             <form onSubmit={handleAddProduct} className="space-y-3">
               <input type="text" placeholder="اسم المنتج" required className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
               <input type="number" placeholder="السعر" required className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
               <input type="url" placeholder="رابط الصورة" required className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
               <select className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none font-bold" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                 <option>Networking</option><option>Electronics</option><option>Gaming</option>
               </select>
               <textarea placeholder="وصف سريع..." className="w-full p-4 bg-white border border-slate-100 rounded-2xl h-24 outline-none" onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
               <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">نشر المنتج</button>
             </form>
          </motion.div>
        )}

        {/* Profile */}
        {view === 'profile' && (
          <motion.div key="profile" className="p-8 max-w-md mx-auto text-center space-y-6">
            <img src={user?.photoURL} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl" alt="" />
            <h2 className="text-xl font-black">{user?.displayName}</h2>
            <div className="space-y-3 text-right">
              <input type="text" placeholder="رقم الهاتف" className="w-full p-4 bg-white border rounded-2xl" value={userData.phone} onChange={e => {setUserData({...userData, phone: e.target.value}); setDoc(doc(db, "users", user.uid), {phone: e.target.value}, {merge:true})}} />
              <input type="text" placeholder="العنوان" className="w-full p-4 bg-white border rounded-2xl" value={userData.address} onChange={e => {setUserData({...userData, address: e.target.value}); setDoc(doc(db, "users", user.uid), {address: e.target.value}, {merge:true})}} />
            </div>
            <button onClick={() => signOut(auth)} className="w-full py-4 text-red-500 font-bold border border-red-100 rounded-2xl">خروج</button>
          </motion.div>
        )}

        {/* Chat Interface */}
        {view === 'chat' && chatInfo && (
          <motion.div key="chat" className="fixed inset-0 z-[150] bg-white flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold">محادثة: {chatInfo.productName}</h3>
              <button onClick={() => setView('home')}><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === user.uid ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-bold shadow-sm ${m.sender === user.uid ? 'bg-blue-600 text-white' : 'bg-white'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input type="text" className="flex-1 bg-slate-100 p-4 rounded-xl outline-none" placeholder="اكتب رسالتك..." value={msgInput} onChange={e => setMsgInput(e.target.value)} />
              <button onClick={sendMsg} className="p-4 bg-blue-600 text-white rounded-xl"><Send size={18}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Modal with Reviews */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-lg mx-auto rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1 bg-slate-100 mx-auto mb-6 rounded-full" />
              <img src={selectedProduct.image} className="w-full h-64 object-cover rounded-[2rem] mb-6 shadow-lg" alt="" />
              <h2 className="text-2xl font-black mb-2">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-black text-sm">{selectedProduct.rating}</span>
              </div>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">{selectedProduct.desc}</p>
              
              <div className="flex gap-2 mb-10">
                <button onClick={() => addToCart(selectedProduct, tempQty)} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                  <ShoppingCart size={18}/> أضف للسلة
                </button>
                <button onClick={() => { setChatInfo({ id: `${user.uid}_${selectedProduct.sellerId}`, productName: selectedProduct.name }); setView('chat'); setSelectedProduct(null); }} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center"><MessageCircle size={20}/></button>
              </div>

              {/* Reviews Section */}
              <div className="border-t pt-8 space-y-6">
                <h4 className="font-black">تقييمات الزبائن ({reviews.length})</h4>
                <div className="flex gap-2">
                  <input type="text" placeholder="أضف تعليقك..." className="flex-1 bg-slate-50 p-4 rounded-xl outline-none text-xs" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                  <button onClick={addReview} className="bg-slate-100 px-4 rounded-xl text-blue-600 font-bold text-xs">نشر</button>
                </div>
                <div className="space-y-4">
                  {reviews.map((r, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-black text-[10px]">{r.userName}</span>
                        <div className="flex text-yellow-400"><Star size={10} fill="currentColor"/> <span className="text-[10px] ml-1">{r.rating}</span></div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FutureStore;
