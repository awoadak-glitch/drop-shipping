import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, MapPin, Phone, Send, Info, CheckCircle, ShieldCheck, Edit3, Search, Mail, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Setup
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, deleteDoc, updateDoc, arrayUnion, where } from "firebase/firestore";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [editingReview, setEditingReview] = useState(null);

  // حالات جديدة للرسائل الواردة
  const [userChats, setUserChats] = useState([]);

  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', image: '', category: 'Networking', desc: '', 
    paymentMethods: { kuraimi: true, qutaibi: false, paypal: false },
    paymentDetails: { kuraimi: '', qutaibi: '', paypal: '' } 
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
          } else {
            setDoc(doc(db, "users", currentUser.uid), { cart: [], createdAt: Date.now() });
          }
        });

        // جلب المحادثات التي يشارك فيها المستخدم
        const qChats = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
        onSnapshot(qChats, (snap) => {
          setUserChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
    });

    return () => { unsubProducts(); unsubAuth(); };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const q = query(collection(db, `products/${selectedProduct.id}/reviews`), orderBy("date", "desc"));
      return onSnapshot(q, (s) => setReviews(s.docs.map(d => ({ id: d.id, ...d.data() }))));
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
      await updateDoc(userRef, { cart: arrayUnion(newCartItem) });
      showToast("تمت الإضافة للسلة 🛒");
    } catch (err) { showToast("فشل إضافة المنتج"); }
  };

  const removeFromCart = async (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    await updateDoc(doc(db, "users", user.uid), { cart: newCart });
    showToast("تم الحذف من السلة");
  };

  const deleteProduct = async (productId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteDoc(doc(db, "products", productId));
      showToast("تم حذف المنتج بنجاح");
      setSelectedProduct(null);
    }
  };

  const handleReviewAction = async () => {
    if(!user || !reviewInput) return;
    const reviewData = {
      text: reviewInput, rating: ratingInput, userName: user.displayName, 
      userPhoto: user.photoURL, userId: user.uid, date: Date.now()
    };
    try {
      if (editingReview) {
        await updateDoc(doc(db, `products/${selectedProduct.id}/reviews`, editingReview.id), reviewData);
        showToast("تم تحديث التعليق");
        setEditingReview(null);
      } else {
        await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), reviewData);
        showToast("شكراً لتقييمك!");
      }
      setReviewInput(""); setRatingInput(5);
    } catch (e) { showToast("حدث خطأ"); }
  };

  const deleteReview = async (revId) => {
    if (window.confirm("حذف التعليق؟")) {
      await deleteDoc(doc(db, `products/${selectedProduct.id}/reviews`, revId));
      showToast("تم الحذف");
    }
  };

  // تحسين إرسال الرسائل لإنشاء وثيقة المحادثة إذا لم تكن موجودة
  const sendMsg = async () => {
    if(!msgInput || !chatInfo) return;
    const chatRef = doc(db, "chats", chatInfo.id);
    
    await setDoc(chatRef, {
      participants: chatInfo.id.split('_'),
      lastMessage: msgInput,
      lastTime: Date.now(),
      productName: chatInfo.productName,
      sellerName: chatInfo.sellerName,
      sellerPhoto: chatInfo.sellerPhoto,
      buyerName: user.displayName,
      buyerPhoto: user.photoURL
    }, { merge: true });

    await addDoc(collection(db, `chats/${chatInfo.id}/messages`), {
      text: msgInput, sender: user.uid, time: Date.now()
    });
    setMsgInput("");
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "الكل" || p.category === activeCategory;
    const searchTerms = searchQuery.toLowerCase().split(" ");
    return matchesCategory && searchTerms.every(term => 
      p.name.toLowerCase().includes(term) || (p.desc && p.desc.toLowerCase().includes(term))
    );
  });

  const totalPrice = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 pb-20" dir="rtl">
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold border border-slate-700">
            <CheckCircle size={20} className="text-green-400"/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 bg-white/70 backdrop-blur-3xl z-[150] px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Package size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter">FUTURE <span className="text-blue-600">ST</span></span>
        </div>
        <div className="flex gap-2 relative">
          {user && (
            <button onClick={() => setView('inbox')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:text-blue-600 transition-all relative">
              <Mail size={22}/>
              {userChats.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
          )}
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl relative">
            <ShoppingBag size={20}/>
            <span className="font-black text-sm">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-bold">{cart.length}</span>}
          </button>
          
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-1 bg-white border border-slate-100 rounded-2xl overflow-hidden active:scale-90 transition-transform">
              <img src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-10 h-10 rounded-xl object-cover" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-[160]" onClick={() => setShowProfileMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute left-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-[170] overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 mb-2 rounded-t-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الحساب الشخصي</p>
                       <p className="text-xs font-black truncate text-blue-600">{user?.displayName || 'زائر جديد'}</p>
                    </div>
                    <button onClick={() => { setView('profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl transition-colors text-right group">
                       <User size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors"/> <span className="text-xs font-bold">ملفي الشخصي</span>
                    </button>
                    <button onClick={() => { setView('inbox'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl transition-colors text-right group">
                       <Mail size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors"/> <span className="text-xs font-bold">الرسائل الواردة</span>
                    </button>
                    <button onClick={() => { setView('admin'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl transition-colors text-right group">
                       <Plus size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors"/> <span className="text-xs font-bold">إضافة منتج جديد</span>
                    </button>
                    <div className="h-px bg-slate-50 my-2" />
                    {user ? (
                      <button onClick={() => { signOut(auth); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-2xl transition-colors text-right">
                        <LogOut size={18}/> <span className="text-xs font-bold">تسجيل الخروج</span>
                      </button>
                    ) : (
                      <button onClick={() => { handleLogin(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors text-right">
                        <LogIn size={18}/> <span className="text-xs font-bold">تسجيل الدخول</span>
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="relative group max-w-xl mx-auto">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20}/>
              <input type="text" placeholder="ابحث عن منتجك بذكاء..." className="w-full bg-white border border-slate-100 p-5 pr-14 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-50 font-bold transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {["الكل", "Networking", "Electronics", "Gaming"].map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} className={`px-8 py-4 rounded-2xl text-sm font-black transition-all ${activeCategory === c ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border border-slate-50'}`}>{c}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
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

        {/* صفحة البروفايل الجديدة */}
        {view === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-full h-32 bg-blue-600/5 -z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <img src={user?.photoURL} className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl mb-4" />
                <h2 className="text-2xl font-black">{user?.displayName}</h2>
                <p className="text-slate-400 font-bold text-sm mb-6">{user?.email}</p>
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="bg-slate-50 p-4 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">الطلبات</p>
                    <p className="text-xl font-black text-blue-600">{cart.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">المبيعات</p>
                    <p className="text-xl font-black text-blue-600">{products.filter(p => p.sellerId === user?.uid).length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">التقييم</p>
                    <p className="text-xl font-black text-blue-600">5.0</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 space-y-4">
                 <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl font-bold text-sm">
                   <div className="flex items-center gap-3"><MapPin size={18} className="text-blue-600"/> عنوان الشحن</div>
                   <ChevronRight size={18}/>
                 </button>
                 <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl font-bold text-sm">
                   <div className="flex items-center gap-3"><Phone size={18} className="text-blue-600"/> رقم الهاتف</div>
                   <ChevronRight size={18}/>
                 </button>
              </div>
              <button onClick={() => setView('home')} className="w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-black">العودة للتسوق</button>
            </div>
          </motion.div>
        )}

        {/* صفحة صندوق الوارد الجديدة */}
        {view === 'inbox' && (
          <motion.div key="inbox" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black">المحادثات الواردة</h2>
              <button onClick={() => setView('home')} className="p-2 bg-slate-100 rounded-xl"><X/></button>
            </div>
            {userChats.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100">
                <MessageCircle size={48} className="mx-auto mb-4 text-slate-200"/>
                <p className="font-black text-slate-400">لا توجد رسائل بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userChats.map(chat => {
                  const isSeller = user.uid === chat.id.split('_')[1];
                  const otherName = isSeller ? chat.buyerName : chat.sellerName;
                  const otherPhoto = isSeller ? chat.buyerPhoto : chat.sellerPhoto;
                  
                  return (
                    <div key={chat.id} onClick={() => { setChatInfo(chat); setView('chat'); }} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-blue-200 transition-all shadow-sm">
                      <img src={otherPhoto} className="w-14 h-14 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-black text-sm">{otherName}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{chat.productName}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">{chat.lastMessage}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300"/>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {view === 'cart' && (
          <motion.div key="cart" className="p-6 max-w-2xl mx-auto space-y-6">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-black">سلة التسوق</h2>
               <button onClick={() => setView('home')} className="p-3 bg-slate-100 rounded-full"><X/></button>
             </div>
             {cart.length === 0 ? (
               <div className="bg-white p-12 rounded-[3rem] text-center border border-slate-100 shadow-sm">
                 <ShoppingBag size={64} className="mx-auto mb-4 text-slate-200" />
                 <p className="font-black text-slate-400">السلة فارغة حالياً</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {cart.map((item) => (
                   <div key={item.cartId} className="bg-white p-4 rounded-3xl border border-slate-50 flex items-center gap-4">
                     <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                     <div className="flex-1">
                       <h4 className="font-black text-sm">{item.name}</h4>
                       <p className="text-blue-600 font-black">${item.price}</p>
                     </div>
                     <button onClick={() => removeFromCart(item.cartId)} className="p-3 text-red-500 bg-red-50 rounded-2xl"><Trash2 size={20}/></button>
                   </div>
                 ))}
                 <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center mt-10">
                   <div><p className="text-xs text-slate-400 font-bold">إجمالي الحساب:</p><h3 className="text-3xl font-black">${totalPrice}</h3></div>
                   <button className="bg-blue-600 px-10 py-5 rounded-2xl font-black shadow-xl">تأكيد الطلب</button>
                 </div>
               </div>
             )}
          </motion.div>
        )}

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

               <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-4">
                 <p className="text-xs font-black text-slate-400">طرق الدفع المدعومة ومعلومات التحويل:</p>
                 <div className="space-y-3">
                   {['kuraimi', 'qutaibi', 'paypal'].map(m => (
                     <div key={m} className="space-y-2">
                        <button type="button" onClick={() => setNewProduct({...newProduct, paymentMethods: {...newProduct.paymentMethods, [m]: !newProduct.paymentMethods[m]}})} 
                          className={`w-full px-4 py-3 rounded-xl text-[10px] font-black border transition-all flex justify-between items-center ${newProduct.paymentMethods[m] ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {m.toUpperCase()}
                          {newProduct.paymentMethods[m] ? <CheckCircle size={14}/> : <Plus size={14}/>}
                        </button>
                        {newProduct.paymentMethods[m] && (
                          <motion.input initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} type="text" 
                            placeholder={m === 'paypal' ? "أدخل معرف PayPal (Email/ID)" : `أدخل رقم حساب ${m === 'kuraimi' ? 'الكريمي' : 'القطيبي'}`}
                            required className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs outline-none font-bold"
                            onChange={e => setNewProduct({...newProduct, paymentDetails: {...newProduct.paymentDetails, [m]: e.target.value}})}
                          />
                        )}
                     </div>
                   ))}
                 </div>
               </div>

               <textarea placeholder="وصف المنتج..." className="w-full p-5 bg-white border border-slate-100 rounded-3xl h-32 outline-none" onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
               <button className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-100">نشر المنتج الآن</button>
             </form>
          </motion.div>
        )}

        {view === 'chat' && chatInfo && (
          <motion.div key="chat" className="fixed inset-0 z-[200] bg-white flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-2xl">
              <div className="flex items-center gap-4">
                <img src={chatInfo.sellerPhoto} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500" />
                <div><h3 className="font-black truncate w-40">محادثة: {chatInfo.sellerName}</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{chatInfo.productName}</p></div>
              </div>
              <button onClick={() => setView('inbox')} className="p-3 bg-white/10 rounded-full"><X/></button>
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

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-2xl rounded-t-[4rem] p-8 max-h-[95vh] overflow-y-auto shadow-2xl">
              
              <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setSelectedProduct(null)} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
                 <div className="flex gap-2">
                   {user?.uid === selectedProduct.sellerId && (
                     <button onClick={() => deleteProduct(selectedProduct.id)} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs border border-red-100"><Trash2 size={16}/> حذف المنتج</button>
                   )}
                   <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                      <ShieldCheck size={16} className="text-blue-600"/><span className="text-[10px] font-black text-blue-600 uppercase">بائع موثوق</span>
                   </div>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" alt="" />
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="font-black text-xs text-yellow-700">{selectedProduct.rating}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({reviews.length} مراجعة)</span>
                    </div>
                  </div>
                  <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السعر الحالي</p><span className="text-4xl font-black text-blue-600 tracking-tighter">${selectedProduct.price}</span></div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                   <div className="flex items-center gap-4">
                      <img src={selectedProduct.sellerPhoto} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">الناشر:</p><h4 className="font-black text-slate-800">{selectedProduct.sellerName}</h4></div>
                   </div>
                   {user?.uid !== selectedProduct.sellerId && (
                     <button onClick={() => { setChatInfo({ id: `${user.uid}_${selectedProduct.sellerId}`, productName: selectedProduct.name, sellerName: selectedProduct.sellerName, sellerPhoto: selectedProduct.sellerPhoto }); setView('chat'); setSelectedProduct(null); }} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-colors shadow-lg"><MessageCircle size={22}/></button>
                   )}
                </div>

                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4">
                   <h4 className="font-black flex items-center gap-2"><CreditCard size={18}/> بيانات الدفع المتاحة:</h4>
                   <div className="grid grid-cols-1 gap-3">
                     {Object.entries(selectedProduct.paymentMethods || {}).map(([method, active]) => active && (
                       <div key={method} className="bg-white/10 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                         <span className="text-xs font-black uppercase tracking-widest">{method}</span>
                         <span className="font-bold text-blue-400">{selectedProduct.paymentDetails?.[method] || 'تواصل مع البائع'}</span>
                       </div>
                     ))}
                   </div>
                   <p className="text-[9px] text-slate-400 text-center font-bold italic">قم بالتحويل للحساب المذكور وأرسل صورة الإيصال (الريسيت) للبائع عبر المحادثة.</p>
                </div>

                <div className="space-y-4">
                   <h4 className="font-black text-lg">عن هذا المنتج</h4>
                   <p className="text-slate-500 leading-relaxed font-medium">{selectedProduct.desc || "لا يوجد وصف مفصل متاح لهذا المنتج حالياً."}</p>
                </div>

                <button onClick={() => addToCart(selectedProduct)} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                  <ShoppingCart size={24}/> أضف إلى السلة الآن
                </button>

                <div className="border-t border-slate-100 pt-10 space-y-6">
                  <h4 className="text-xl font-black">تعليقات المشترين</h4>
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4">
                    <div className="flex justify-center gap-2 mb-2">
                       {[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setRatingInput(star)} className="transition-transform active:scale-90"><Star size={32} className={`${ratingInput >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} /></button>))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder={editingReview ? "تعديل تعليقك..." : "اكتب مراجعتك هنا..."} className="flex-1 bg-white p-5 rounded-2xl outline-none font-bold text-xs shadow-sm" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                      <button onClick={handleReviewAction} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs">{editingReview ? "تحديث" : "نشر"}</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((r, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 flex gap-4 relative">
                        <img src={r.userPhoto} className="w-10 h-10 rounded-xl" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1"><h5 className="font-black text-[11px]">{r.userName}</h5><div className="flex text-yellow-400">{[...Array(r.rating)].map((_, idx) => <Star key={idx} size={10} fill="currentColor"/>)}</div></div>
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
