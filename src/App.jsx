import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, MapPin, Phone, Send, Info, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Setup
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, deleteDoc, updateDoc } from "firebase/firestore";
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
  
  // States الجديدة
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);

  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', image: '', category: 'Networking', desc: '', 
    paymentMethods: { kuraimi: true, qutaibi: false, paypal: false } 
  });

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

  // جلب المراجعات وحساب التقييم الذكي
  useEffect(() => {
    if (selectedProduct) {
      const q = query(collection(db, `products/${selectedProduct.id}/reviews`), orderBy("date", "desc"));
      const unsubReviews = onSnapshot(q, (s) => {
        const revs = s.docs.map(d => d.data());
        setReviews(revs);
        
        // تحديث تقييم المنتج بناءً على المتوسط
        if(revs.length > 0) {
            const avg = revs.reduce((acc, curr) => acc + curr.rating, 0) / revs.length;
            updateDoc(doc(db, "products", selectedProduct.id), { rating: avg.toFixed(1) });
        }
      });
      return () => unsubReviews();
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return showToast("سجل دخولك");
    await addDoc(collection(db, "products"), { 
      ...newProduct, 
      price: Number(newProduct.price), 
      sellerId: user.uid, 
      sellerName: user.displayName,
      sellerPhoto: user.photoURL,
      rating: 5, 
      createdAt: Date.now() 
    });
    showToast("تم نشر المنتج بنجاح ✅");
    setView('home');
  };

  const addReview = async () => {
    if(!user || !reviewInput) return showToast("اكتب تعليقاً أولاً");
    await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), {
      text: reviewInput, rating: ratingInput, userName: user.displayName, userPhoto: user.photoURL, date: Date.now()
    });
    setReviewInput("");
    showToast("شكراً لتقييمك!");
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20 overflow-x-hidden" dir="rtl">
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] bg-blue-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold">
            <Zap size={20} className="text-yellow-400 animate-pulse"/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Navbar */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-2xl z-[150] px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">F</div>
          <div>
            <h1 className="font-black text-lg leading-none tracking-tighter">FUTURE</h1>
            <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em]">ELECTRONICS</span>
          </div>
        </div>
        <div className="flex gap-3">
          {user && <button onClick={() => setView('admin')} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Plus size={22}/></button>}
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl relative overflow-hidden group">
            <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-sm">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute top-0 right-0 bg-blue-500 w-5 h-5 rounded-bl-xl text-[10px] flex items-center justify-center font-black animate-bounce">{cart.length}</span>}
          </button>
          <button onClick={() => setView(user ? 'profile' : 'home')} className="p-1 border-2 border-slate-100 rounded-2xl overflow-hidden">
            <img src={user?.photoURL || 'https://via.placeholder.com/40'} className="w-9 h-9 rounded-xl object-cover" />
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Home Screen */}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-5xl mx-auto space-y-10">
            {/* Hero Card */}
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-3xl min-h-[240px] flex flex-col justify-center">
               <div className="relative z-10 space-y-4">
                  <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">جديدنا اليوم</span>
                  <h2 className="text-4xl font-black leading-tight">عالم من <br/><span className="text-blue-500 underline decoration-indigo-500">الاحترافية</span> بين يديك</h2>
               </div>
               <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]" />
               <div className="absolute -left-10 bottom-0 w-40 h-40 bg-indigo-600/30 rounded-full blur-[80px]" />
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
              {["الكل", "Networking", "Electronics", "Gaming", "Servers"].map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} className={`px-8 py-4 rounded-[2rem] text-sm font-black transition-all whitespace-nowrap shadow-sm ${activeCategory === c ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-slate-400 border border-slate-100'}`}>{c}</button>
              ))}
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.filter(p => activeCategory === "الكل" || p.category === activeCategory).map(product => (
                <motion.div layout key={product.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50 relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  {user?.uid === product.sellerId && (
                    <button onClick={() => deleteProduct(product.id)} className="absolute top-6 left-6 z-10 p-3 bg-red-500 text-white rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                  )}
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-5 bg-slate-50 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <div className="px-2 space-y-1">
                    <h3 className="text-xs font-black text-slate-800 line-clamp-1">{product.name}</h3>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-blue-600 font-black text-lg">${product.price}</span>
                       <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star size={10} className="fill-yellow-400 text-yellow-400"/>
                          <span className="text-[10px] font-black">{product.rating}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Product Screen */}
        {view === 'admin' && (
          <motion.div key="admin" className="p-8 max-w-md mx-auto space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">أضف منتجك</h2>
                <button onClick={() => setView('home')} className="p-3 bg-slate-100 rounded-full"><X/></button>
             </div>
             <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2 uppercase">بيانات المنتج</label>
                  <input type="text" placeholder="اسم المنتج" required className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 ring-blue-50" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <input type="number" placeholder="السعر $" required className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <input type="url" placeholder="رابط صورة المنتج" required className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2 uppercase">طرق الدفع المتوفرة لديك</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['kuraimi', 'qutaibi', 'paypal'].map(method => (
                      <button key={method} type="button" 
                        onClick={() => setNewProduct({...newProduct, paymentMethods: {...newProduct.paymentMethods, [method]: !newProduct.paymentMethods[method]} })}
                        className={`py-4 rounded-2xl text-[10px] font-black border-2 transition-all ${newProduct.paymentMethods[method] ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                        {method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea placeholder="وصف تفصيلي للمنتج..." className="w-full p-5 bg-white border border-slate-100 rounded-3xl h-32 outline-none" onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
                <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-600 transition-colors">نشر المنتج في السوق</button>
             </form>
          </motion.div>
        )}

        {/* Chat System */}
        {view === 'chat' && chatInfo && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-white flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('home')}><X/></button>
                <div className="relative">
                  <img src={chatInfo.sellerPhoto} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500" />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-4 border-slate-900"></div>
                </div>
                <div>
                  <h3 className="font-black text-sm">التواصل مع {chatInfo.sellerName}</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{chatInfo.productName}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
              {messages.length === 0 && <div className="text-center py-20 opacity-20 font-black italic">ابدأ المحادثة الآن...</div>}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === user.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-5 rounded-[2rem] max-w-[85%] text-sm font-bold shadow-sm ${m.sender === user.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
              <input type="text" className="flex-1 bg-slate-100 p-5 rounded-3xl outline-none font-bold text-sm" placeholder="اكتب رسالتك بوضوح..." value={msgInput} onChange={e => setMsgInput(e.target.value)} />
              <button onClick={sendMsg} className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100 hover:rotate-12 transition-transform"><Send size={24}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details - Scrolling Watcher & Fixed Exit */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-end">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-2xl mx-auto rounded-t-[4rem] min-h-[90vh] shadow-3xl p-8 pb-32">
              {/* Sticky Close Button */}
              <div className="sticky top-0 z-10 flex justify-between items-center mb-8 bg-white/80 py-4 backdrop-blur-sm">
                 <button onClick={() => setSelectedProduct(null)} className="p-4 bg-slate-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={24}/></button>
                 <span className="font-black text-slate-400 uppercase tracking-tighter">تفاصيل المنتج</span>
                 <div className="w-12"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 <img src={selectedProduct.image} className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl" alt="" />
                 <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <h2 className="text-3xl font-black leading-tight">{selectedProduct.name}</h2>
                       <div className="bg-blue-600 text-white p-4 rounded-3xl font-black text-xl shadow-xl shadow-blue-100">${selectedProduct.price}</div>
                    </div>
                    <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                       <img src={selectedProduct.sellerPhoto} className="w-12 h-12 rounded-xl" />
                       <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">البائع</p>
                          <p className="font-black text-sm">{selectedProduct.sellerName}</p>
                       </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{selectedProduct.desc}</p>
                    
                    <div className="pt-4 space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase">طرق الدفع لهذا المنتج:</p>
                       <div className="flex gap-2">
                          {selectedProduct.paymentMethods && Object.entries(selectedProduct.paymentMethods).map(([k, v]) => v && (
                            <span key={k} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-blue-600 italic">#{k}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-12">
                 <button onClick={() => { addToCart(selectedProduct, tempQty); setSelectedProduct(null); }} className="flex-[3] bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform">
                    <ShoppingCart /> تأكيد الإضافة
                 </button>
                 <button onClick={() => { setChatInfo({ id: `${user.uid}_${selectedProduct.sellerId}`, productName: selectedProduct.name, sellerName: selectedProduct.sellerName, sellerPhoto: selectedProduct.sellerPhoto }); setView('chat'); setSelectedProduct(null); }} 
                    className="flex-1 bg-blue-50 text-blue-600 py-6 rounded-[2.5rem] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-50">
                    <MessageCircle size={28}/>
                 </button>
              </div>

              {/* Smart Reviews Section */}
              <div className="mt-20 space-y-10">
                 <div className="flex justify-between items-end">
                    <div>
                       <h3 className="text-2xl font-black">تقييمات المجتمع</h3>
                       <p className="text-xs text-slate-400 font-bold">بناءً على {reviews.length} تجربة حقيقية</p>
                    </div>
                    <div className="text-center bg-yellow-50 p-4 rounded-3xl border-2 border-yellow-100">
                       <div className="text-3xl font-black text-yellow-600">{selectedProduct.rating}</div>
                       <div className="flex text-yellow-400"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-8 rounded-[3rem] space-y-4">
                    <div className="flex gap-4">
                       {[1,2,3,4,5].map(s => (
                         <button key={s} onClick={() => setRatingInput(s)} className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${ratingInput === s ? 'bg-yellow-400 text-white' : 'bg-white text-slate-300'}`}>{s}</button>
                       ))}
                    </div>
                    <div className="flex gap-4">
                       <input type="text" placeholder="ما رأيك بهذا المنتج؟" className="flex-1 bg-white p-5 rounded-2xl outline-none text-sm font-bold shadow-sm" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                       <button onClick={addReview} className="bg-slate-900 text-white px-8 rounded-2xl font-black">نشر</button>
                    </div>
                 </div>

                 <div className="grid gap-4">
                    {reviews.map((r, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 flex gap-4 shadow-sm">
                         <img src={r.userPhoto} className="w-10 h-10 rounded-full" />
                         <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                               <h4 className="font-black text-sm">{r.userName}</h4>
                               <div className="flex text-yellow-400 items-center gap-1"><Star size={10} fill="currentColor"/><span className="text-[10px] font-black">{r.rating}</span></div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{r.text}</p>
                         </div>
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
