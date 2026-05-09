import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, MapPin, Phone, Send, Info, CheckCircle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Setup
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
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
  
  // States المحادثة والمراجعات
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
    // جلب المنتجات
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // مراقبة حالة المستخدم والسلة
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setCart(docSnap.data().cart || []);
            setUserData({ phone: docSnap.data().phone || '', address: docSnap.data().address || '' });
          } else {
            setDoc(doc(db, "users", currentUser.uid), { cart: [], createdAt: Date.now() });
          }
        });
      }
    });

    return () => { unsubProducts(); unsubAuth(); };
  }, []);

  // جلب المراجعات للمنتج المختار
  useEffect(() => {
    if (selectedProduct) {
      const q = query(collection(db, `products/${selectedProduct.id}/reviews`), orderBy("date", "desc"));
      return onSnapshot(q, (s) => setReviews(s.docs.map(d => d.data())));
    }
  }, [selectedProduct]);

  // جلب رسائل الشات
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
    if (!user) return showToast("سجل دخولك أولاً");
    try {
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
    } catch (err) { showToast("حدث خطأ أثناء النشر"); }
  };

  const addToCart = async (product) => {
    if (!user) return handleLogin();
    try {
      const newCartItem = { ...product, cartId: Date.now(), qty: 1 };
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        cart: arrayUnion(newCartItem)
      });
      showToast("تمت الإضافة للسلة 🛒");
    } catch (err) { showToast("فشل إضافة المنتج"); }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteDoc(doc(db, "products", productId));
      showToast("تم حذف المنتج بنجاح");
      setSelectedProduct(null);
    }
  };

  const addReview = async () => {
    if(!user || !reviewInput) return;
    await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), {
      text: reviewInput, rating: ratingInput, userName: user.displayName, userPhoto: user.photoURL, date: Date.now()
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

  const totalPrice = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold border border-slate-700">
            <CheckCircle size={20} className="text-green-400"/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Top Navigation */}
      <nav className="sticky top-0 bg-white/70 backdrop-blur-3xl z-[150] px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3" onClick={() => setView('home')}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Package size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter">FUTURE <span className="text-blue-600">ST</span></span>
        </div>
        <div className="flex gap-2">
          {user && <button onClick={() => setView('admin')} className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all"><Plus size={22}/></button>}
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl relative">
            <ShoppingBag size={20}/>
            <span className="font-black text-sm">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-bold">{cart.length}</span>}
          </button>
          <button onClick={() => setView(user ? 'profile' : 'home')} className="p-1 bg-white border border-slate-100 rounded-2xl">
            <img src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-10 h-10 rounded-xl object-cover" />
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Main Store View */}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {["الكل", "Networking", "Electronics", "Gaming"].map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} className={`px-8 py-4 rounded-2xl text-sm font-black transition-all ${activeCategory === c ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border border-slate-50'}`}>{c}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.filter(p => activeCategory === "الكل" || p.category === activeCategory).map(product => (
                <motion.div layout key={product.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50 relative group hover:shadow-xl transition-all">
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-50 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <h3 className="text-xs font-black px-2 line-clamp-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-3 px-2">
                    <span className="text-blue-600 font-black text-lg">${product.price}</span>
                    <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg hover:bg-blue-600 transition-colors"><Plus size={18}/></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Product Interface */}
        {view === 'admin' && (
          <motion.div key="admin" className="p-6 max-w-md mx-auto space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">إضافة منتج جديد</h2>
                <button onClick={() => setView('home')} className="p-3 bg-slate-100 rounded-full"><X/></button>
             </div>
             <form onSubmit={handleAddProduct} className="space-y-4">
               <input type="text" placeholder="اسم المنتج" required className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
               <input type="number" placeholder="السعر $" required className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
               <input type="url" placeholder="رابط صورة المنتج" required className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
               <select className="w-full p-5 bg-white border border-slate-100 rounded-3xl outline-none font-bold appearance-none" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                 <option>Networking</option><option>Electronics</option><option>Gaming</option>
               </select>
               <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-3">
                 <p className="text-xs font-black text-slate-400">طرق الدفع المدعومة:</p>
                 <div className="flex flex-wrap gap-2">
                   {['kuraimi', 'qutaibi', 'paypal'].map(m => (
                     <button key={m} type="button" onClick={() => setNewProduct({...newProduct, paymentMethods: {...newProduct.paymentMethods, [m]: !newProduct.paymentMethods[m]}})} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${newProduct.paymentMethods[m] ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                       {m.toUpperCase()}
                     </button>
                   ))}
                 </div>
               </div>
               <textarea placeholder="وصف المنتج..." className="w-full p-5 bg-white border border-slate-100 rounded-3xl h-32 outline-none" onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
               <button className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-100">نشر المنتج الآن</button>
             </form>
          </motion.div>
        )}

        {/* Chat System */}
        {view === 'chat' && chatInfo && (
          <motion.div key="chat" className="fixed inset-0 z-[200] bg-white flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-2xl">
              <div className="flex items-center gap-4">
                <img src={chatInfo.sellerPhoto} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500" />
                <div>
                  <h3 className="font-black">محادثة: {chatInfo.sellerName}</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{chatInfo.productName}</p>
                </div>
              </div>
              <button onClick={() => setView('home')} className="p-3 bg-white/10 rounded-full"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === user.uid ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-5 rounded-3xl max-w-[80%] text-sm font-bold shadow-sm ${m.sender === user.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white border-t flex gap-3">
              <input type="text" className="flex-1 bg-slate-100 p-5 rounded-2xl outline-none font-bold" placeholder="اكتب رسالتك..." value={msgInput} onChange={e => setMsgInput(e.target.value)} />
              <button onClick={sendMsg} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Modal - الارتفاع والترتيب */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-2xl rounded-t-[4rem] p-8 max-h-[95vh] overflow-y-auto shadow-2xl">
              
              {/* Close & Seller Actions */}
              <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setSelectedProduct(null)} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
                 <div className="flex gap-2">
                   {user?.uid === selectedProduct.sellerId && (
                     <button onClick={() => deleteProduct(selectedProduct.id)} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs border border-red-100"><Trash2 size={16}/> حذف المنتج</button>
                   )}
                   <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                      <ShieldCheck size={16} className="text-blue-600"/>
                      <span className="text-[10px] font-black text-blue-600 uppercase">بائع موثوق</span>
                   </div>
                 </div>
              </div>

              {/* Product Header */}
              <div className="space-y-8">
                <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" alt="" />
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-black text-xs text-yellow-700">{selectedProduct.rating}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({reviews.length} مراجعة)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السعر الحالي</p>
                    <span className="text-4xl font-black text-blue-600 tracking-tighter">${selectedProduct.price}</span>
                  </div>
                </div>

                {/* Seller Info Section */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                   <div className="flex items-center gap-4">
                      <img src={selectedProduct.sellerPhoto} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">الناشر:</p>
                        <h4 className="font-black text-slate-800">{selectedProduct.sellerName}</h4>
                      </div>
                   </div>
                   <button onClick={() => { setChatInfo({ id: `${user.uid}_${selectedProduct.sellerId}`, productName: selectedProduct.name, sellerName: selectedProduct.sellerName, sellerPhoto: selectedProduct.sellerPhoto }); setView('chat'); setSelectedProduct(null); }} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-colors shadow-lg"><MessageCircle size={22}/></button>
                </div>

                {/* Description & Payment */}
                <div className="space-y-4">
                   <h4 className="font-black text-lg">عن هذا المنتج</h4>
                   <p className="text-slate-500 leading-relaxed font-medium">{selectedProduct.desc || "لا يوجد وصف مفصل متاح لهذا المنتج حالياً."}</p>
                </div>

                <div className="space-y-4 pt-4">
                   <h4 className="font-black text-sm text-slate-400 uppercase tracking-widest">طرق الدفع المتوفرة لهذا البائع:</h4>
                   <div className="flex gap-3">
                      {selectedProduct.paymentMethods && Object.entries(selectedProduct.paymentMethods).map(([m, active]) => active && (
                        <div key={m} className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-3xl">
                          <CreditCard size={16} className="text-blue-500"/>
                          <span className="font-black text-xs uppercase">{m}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Main Action Button */}
                <button onClick={() => addToCart(selectedProduct)} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                  <ShoppingCart size={24}/> أضف إلى السلة الآن
                </button>

                {/* Reviews List */}
                <div className="border-t border-slate-100 pt-10 space-y-6">
                  <h4 className="text-xl font-black">تعليقات المشترين</h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="اكتب مراجعتك هنا..." className="flex-1 bg-slate-50 p-5 rounded-2xl outline-none font-bold text-xs" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                    <button onClick={addReview} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs">نشر</button>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((r, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 flex gap-4">
                        <img src={r.userPhoto} className="w-10 h-10 rounded-xl" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h5 className="font-black text-[11px]">{r.userName}</h5>
                            <div className="flex text-yellow-400"><Star size={10} fill="currentColor"/></div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
