import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, 
  MapPin, Phone, Send, Info, CheckCircle, ShieldCheck, Edit3, Search,
  Bell, Heart, Layout, Filter, ArrowRight, Home, Menu, RefreshCw, Eye, Check, CheckCheck,
  Truck, Receipt, CreditCard as CardIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Setup
import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, 
  orderBy, deleteDoc, updateDoc, arrayUnion, where, limit, getDocs, writeBatch
} from "firebase/firestore";
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
  // State Management
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ phone: '', address: '', wishlist: [] });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Chat & Messaging State
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [myChats, setMyChats] = useState([]); 
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [isEditingReview, setIsEditingReview] = useState(null);

  // Profile Edit State
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Product Creation State (أضيف حقل shippingFee هنا)
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', shippingFee: '', image: '', category: 'Networking', desc: '', 
    paymentMethods: { kuraimi: true, qutaibi: false, paypal: false },
    paymentDetails: { kuraimi: '', qutaibi: '', paypal: '' } 
  });

  const chatEndRef = useRef(null);

  // --- Effects ---

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
            const data = docSnap.data();
            setCart(data.cart || []);
            setUserData(data);
            setEditPhone(data.phone || '');
            setEditAddress(data.address || '');
          } else {
            setDoc(doc(db, "users", currentUser.uid), { 
                cart: [], wishlist: [], createdAt: Date.now(),
                displayName: currentUser.displayName, email: currentUser.email, photoURL: currentUser.photoURL
            });
          }
        });
        
        const qChats = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
        onSnapshot(qChats, (snap) => {
            setMyChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
    });

    return () => { unsubProducts(); unsubAuth(); };
  }, []);

  useEffect(() => {
    if (chatInfo && user) {
      const q = query(collection(db, `chats/${chatInfo.id}/messages`), orderBy("time", "asc"));
      const unsubChat = onSnapshot(q, (s) => {
        const msgs = s.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
        msgs.forEach(m => {
          if (m.sender !== user.uid && m.status !== 'read') {
            updateDoc(doc(db, `chats/${chatInfo.id}/messages`, m.id), { status: 'read' });
          }
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
      return () => unsubChat();
    }
  }, [chatInfo, user]);

  useEffect(() => {
    if (selectedProduct) {
      const q = query(collection(db, `products/${selectedProduct.id}/reviews`), orderBy("date", "desc"));
      return onSnapshot(q, (s) => setReviews(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [selectedProduct]);

  // --- Functions ---

  const showToast = (msg, type = "success") => { 
    setToast({ msg, type }); 
    setTimeout(() => setToast(null), 3000); 
  };

  const handleLogin = async () => {
    try { await signInWithPopup(auth, provider); showToast("أهلاً بك مجدداً"); } 
    catch (e) { showToast("فشل تسجيل الدخول", "error"); }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { phone: editPhone, address: editAddress });
      showToast("تم تحديث معلوماتك بنجاح");
    } catch (e) { showToast("حدث خطأ أثناء التحديث", "error"); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return showToast("سجل دخولك أولاً", "error");
    try {
      await addDoc(collection(db, "products"), { 
        ...newProduct, 
        price: Number(newProduct.price), 
        shippingFee: Number(newProduct.shippingFee || 0), // حفظ رسوم التوصيل
        sellerId: user.uid, 
        sellerName: user.displayName, 
        sellerPhoto: user.photoURL, 
        avgRating: 0, 
        reviewCount: 0, 
        createdAt: Date.now() 
      });
      showToast("تم نشر المنتج بنجاح ✅");
      setView('home');
    } catch (err) { showToast("حدث خطأ أثناء النشر", "error"); }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteDoc(doc(db, "products", id));
      setSelectedProduct(null);
      showToast("تم حذف المنتج");
    }
  };

  // --- Cart Core Functions ---

  const addToCart = async (product) => {
    if (!user) return handleLogin();
    try {
      const existingItem = cart.find(item => item.id === product.id);
      let newCart;

      if (existingItem) {
        newCart = cart.map(item => 
          item.id === product.id ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
        showToast(`تم زيادة كمية ${product.name}`);
      } else {
        const newCartItem = { ...product, cartId: Date.now(), qty: 1 };
        newCart = [...cart, newCartItem];
        showToast("تمت الإضافة للسلة 🛒");
      }
      
      await updateDoc(doc(db, "users", user.uid), { cart: newCart });
    } catch (err) { showToast("فشل إضافة المنتج", "error"); }
  };

  const updateCartQty = async (cartId, delta) => {
    if (!user) return;
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = (item.qty || 1) + delta;
        return { ...item, qty: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    await updateDoc(doc(db, "users", user.uid), { cart: newCart });
  };

  const removeFromCart = async (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    await updateDoc(doc(db, "users", user.uid), { cart: newCart });
    showToast("تم الحذف من السلة");
  };

  const clearCart = async () => {
    if(window.confirm("هل تريد إفراغ السلة بالكامل؟")) {
      await updateDoc(doc(db, "users", user.uid), { cart: [] });
      showToast("تم إفراغ السلة");
    }
  };

  // --- Chat & Review Functions ---

  const startChat = async (product) => {
    if(!user) return handleLogin();
    if(user.uid === product.sellerId) return showToast("لا يمكنك مراسلة نفسك", "info");
    const chatId = user.uid < product.sellerId ? `${user.uid}_${product.sellerId}` : `${product.sellerId}_${user.uid}`;
    
    // جلب معلومات الطرف الآخر بدقة
    const chatData = {
        id: chatId, 
        participants: [user.uid, product.sellerId], 
        productName: product.name,
        lastMsg: "بدأ المحادثة الاستفسارية...", 
        time: Date.now(),
        users: { 
            [user.uid]: { name: user.displayName, photo: user.photoURL }, 
            [product.sellerId]: { name: product.sellerName, photo: product.sellerPhoto } 
        }
    };

    await setDoc(doc(db, "chats", chatId), chatData, { merge: true });
    
    setChatInfo({ 
        id: chatId, 
        productName: product.name, 
        sellerName: product.sellerName, 
        sellerPhoto: product.sellerPhoto 
    });
    setView('chat');
    setSelectedProduct(null);
  };

  const sendMsg = async () => {
    if(!msgInput || !chatInfo || !user) return;
    const text = msgInput;
    setMsgInput("");
    try {
        await addDoc(collection(db, `chats/${chatInfo.id}/messages`), { text, sender: user.uid, time: Date.now(), status: 'sent' });
        await updateDoc(doc(db, "chats", chatInfo.id), { lastMsg: text, time: Date.now() });
    } catch (e) { showToast("فشل إرسال الرسالة", "error"); }
  };

  const updateProductRatingStats = async (productId, newReviews) => {
    const count = newReviews.length;
    const avg = count > 0 ? (newReviews.reduce((acc, curr) => acc + curr.rating, 0) / count) : 0;
    await updateDoc(doc(db, "products", productId), {
      avgRating: Number(avg.toFixed(1)),
      reviewCount: count
    });
  };

  const handleReviewAction = async () => {
    if (!user) return handleLogin();
    if (!reviewInput) return showToast("اكتب شيئاً أولاً", "error");
    try {
      let updatedReviews = [];
      if (isEditingReview) {
        await updateDoc(doc(db, `products/${selectedProduct.id}/reviews`, isEditingReview), { 
          text: reviewInput, rating: ratingInput, date: Date.now() 
        });
        updatedReviews = reviews.map(r => r.id === isEditingReview ? { ...r, rating: ratingInput } : r);
        showToast("تم تعديل التقييم");
      } else {
        const docRef = await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), { 
          userId: user.uid, userName: user.displayName, userPhoto: user.photoURL, 
          text: reviewInput, rating: ratingInput, date: Date.now() 
        });
        updatedReviews = [...reviews, { rating: ratingInput }];
        showToast("شكراً لتقييمك");
      }
      await updateProductRatingStats(selectedProduct.id, updatedReviews);
      setReviewInput(""); setRatingInput(5); setIsEditingReview(null);
    } catch (e) { showToast("فشل العملية", "error"); }
  };

  const deleteReview = async (reviewId) => {
    try {
        await deleteDoc(doc(db, `products/${selectedProduct.id}/reviews`, reviewId));
        const remainingReviews = reviews.filter(r => r.id !== reviewId);
        await updateProductRatingStats(selectedProduct.id, remainingReviews);
        showToast("تم حذف التقييم");
    } catch (e) { showToast("فشل الحذف", "error"); }
  };

  // --- Helper Components ---

  const MessageStatus = ({ status, isMine }) => {
    if (!isMine) return null;
    if (status === 'sent') return <Check size={12} className="text-slate-300" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-slate-300" />;
    if (status === 'read') return <CheckCheck size={12} className="text-green-400" />;
    return <Check size={12} className="text-slate-300" />;
  };

  const Sidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[250]" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 h-full w-80 bg-white z-[300] shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">الرسائل (Inbox)</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-xl"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {myChats.length === 0 ? (
                <div className="text-center py-10"><MessageCircle size={48} className="mx-auto text-slate-200 mb-2" /><p className="text-slate-400 font-bold text-sm">لا توجد محادثات</p></div>
              ) : (
                myChats.map(chat => {
                  const otherUser = Object.keys(chat.users).find(id => id !== user?.uid);
                  const info = chat.users[otherUser];
                  return (
                    <button key={chat.id} onClick={() => { setChatInfo({ id: chat.id, productName: chat.productName, sellerName: info.name, sellerPhoto: info.photo }); setView('chat'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-[2rem] transition-all text-right border border-transparent hover:border-blue-100">
                      <img src={info.photo} className="w-12 h-12 rounded-2xl object-cover" alt=""/>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-xs truncate">{info.name}</h4>
                        <p className="text-[10px] text-blue-600 font-bold mb-1">{chat.productName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{chat.lastMsg}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "الكل" || p.category === activeCategory;
    return matchesCategory && p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const subTotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  // تعديل: حساب رسوم التوصيل بناءً على ما حدده الناشر لكل منتج
  const shipping = cart.reduce((s, i) => s + (Number(i.shippingFee || 0) * (i.qty || 1)), 0);
  const total = subTotal + shipping;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-['Cairo',_sans-serif]" dir="rtl">
      
      <Sidebar />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 30, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className={`fixed top-0 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 font-black border ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
            {toast.type === 'error' ? <X size={20}/> : <CheckCircle size={20} className="text-green-400"/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 bg-white/80 backdrop-blur-3xl z-[200] px-4 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><MessageCircle size={22} /></button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Zap size={20} fill="currentColor"/></div>
            <span className="font-black text-lg hidden sm:block uppercase">Future <span className="text-blue-600">Net</span></span>
          </div>
        </div>

        <div className="flex gap-2">
          {user && <button onClick={() => setView('admin')} className="hidden sm:flex p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white items-center gap-2 transition-all font-bold text-xs"><Plus size={18}/> نشر منتج</button>}
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl relative active:scale-95 transition-transform">
            <ShoppingBag size={20}/> <span className="font-black text-sm hidden sm:block">${subTotal.toFixed(1)}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-black">{cart.reduce((a,b)=>a+(b.qty||1),0)}</span>}
          </button>
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-11 h-11 bg-white border-2 border-slate-100 rounded-2xl overflow-hidden active:scale-90 transition-transform">
              <img src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-full h-full object-cover" alt="user"/>
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-[160]" onClick={() => setShowProfileMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute left-0 mt-3 w-64 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-3 z-[170]">
                    <div className="p-4 border-b border-slate-50 mb-2 flex items-center gap-3 text-right">
                       <img src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-10 h-10 rounded-xl" alt=""/>
                       <div className="overflow-hidden"><p className="text-[10px] font-black text-slate-400 uppercase">مرحباً بك</p><p className="text-xs font-black truncate">{user?.displayName || 'زائر جديد'}</p></div>
                    </div>
                    <button onClick={() => { setView('profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-right"><User size={18} className="text-blue-600"/> <span className="text-xs font-bold">الملف الشخصي</span></button>
                    {user ? (
                      <button onClick={() => { signOut(auth); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-colors text-right"><LogOut size={18}/> <span className="text-xs font-bold">تسجيل الخروج</span></button>
                    ) : (
                      <button onClick={() => { handleLogin(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors text-right"><LogIn size={18}/> <span className="text-xs font-bold">تسجيل الدخول</span></button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                <input type="text" placeholder="ابحث عن أجهزة، حسابات، أو خدمات..." className="w-full bg-white border border-slate-100 p-6 pr-16 rounded-[2.5rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-100 font-bold transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                {["الكل", "Networking", "Electronics", "Gaming", "Software"].map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)} className={`px-10 py-4 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${activeCategory === c ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'bg-white text-slate-400 border border-slate-100'}`}>{c}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map(product => (
                  <motion.div layout key={product.id} className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all">
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-4 bg-slate-50 cursor-pointer relative" onClick={() => setSelectedProduct(product)}>
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1">
                        <Star size={10} className="text-yellow-400" fill="currentColor"/>
                        {product.avgRating || 0}
                      </div>
                    </div>
                    <h3 className="text-xs font-black px-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    <div className="flex justify-between items-center mt-4 px-2">
                      <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">السعر</span><span className="text-blue-600 font-black text-xl">${product.price}</span></div>
                      <button onClick={() => addToCart(product)} className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg active:scale-90"><Plus size={20}/></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-4">
               <div className="flex justify-between items-end mb-10">
                  <div>
                    <h2 className="text-4xl font-black mb-2 flex items-center gap-4">سلة المشتريات <ShoppingBag className="text-blue-600" size={32}/></h2>
                    <p className="text-slate-400 font-bold">لديك {cart.length} منتجات فريدة في سلتك</p>
                  </div>
                  {cart.length > 0 && <button onClick={clearCart} className="text-red-500 font-black text-xs hover:underline flex items-center gap-2"><Trash2 size={16}/> إفراغ السلة</button>}
               </div>

               {cart.length === 0 ? (
                 <div className="bg-white rounded-[4rem] p-20 text-center border border-dashed border-slate-200">
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300"><ShoppingBag size={64}/></div>
                    <h3 className="text-2xl font-black mb-2">سلتك فارغة تماماً!</h3>
                    <p className="text-slate-400 font-bold mb-8">يبدو أنك لم تضف أي منتجات بعد، ابدأ بالتسوق الآن</p>
                    <button onClick={() => setView('home')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all">العودة للمتجر</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <motion.div layout key={item.cartId} className="bg-white p-6 rounded-[3rem] flex flex-col sm:flex-row items-center gap-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <img src={item.image} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-inner" alt=""/>
                                <div className="flex-1 text-center sm:text-right">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{item.category}</span>
                                    <h4 className="font-black text-lg mt-1 line-clamp-1">{item.name}</h4>
                                    <p className="text-slate-400 text-xs font-bold">توصيل: ${item.shippingFee || 0}</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <button onClick={() => updateCartQty(item.cartId, -1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"><Minus size={16}/></button>
                                    <span className="w-8 text-center font-black text-lg">{item.qty || 1}</span>
                                    <button onClick={() => updateCartQty(item.cartId, 1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"><Plus size={16}/></button>
                                </div>
                                <div className="text-center sm:text-left min-w-[100px]">
                                    <p className="text-[10px] text-slate-400 font-black uppercase">المجموع</p>
                                    <span className="text-xl font-black text-slate-900">${((item.price) * (item.qty || 1)).toFixed(2)}</span>
                                </div>
                                <button onClick={() => removeFromCart(item.cartId)} className="p-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[3.5rem] p-8 text-white shadow-2xl sticky top-32">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-3 border-b border-white/10 pb-4"><Receipt size={24}/> ملخص الطلب</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between font-bold text-slate-400"><span>المجموع الفرعي</span><span className="text-white">${subTotal.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-slate-400"><span>رسوم التوصيل</span><span className="text-white">${shipping.toFixed(2)}</span></div>
                            </div>
                            <div className="flex justify-between items-end border-t border-white/10 pt-6 mb-8">
                                <span className="font-black text-slate-400">الإجمالي النهائي</span>
                                <span className="text-4xl font-black text-blue-400">${total.toFixed(2)}</span>
                            </div>
                            <button className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                <ShieldCheck /> تأكيد الدفع والطلب
                            </button>
                        </div>
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-50">
               <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black">بيع منتج جديد</h2><button onClick={() => setView('home')} className="p-4 bg-slate-100 rounded-3xl"><X/></button></div>
               <form onSubmit={handleAddProduct} className="space-y-6">
                 <div className="space-y-2"><label className="text-xs font-black text-slate-400 mr-2 uppercase">اسم السلعة</label><input type="text" placeholder="مثلاً: Mikrotik hAP ac2" required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-bold" onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-400 mr-2 uppercase">السعر ($)</label><input type="number" placeholder="0.00" required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-bold" onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-400 mr-2 uppercase">توصيل ($)</label><input type="number" placeholder="0.00" required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-bold" onChange={e => setNewProduct({...newProduct, shippingFee: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-400 mr-2 uppercase">التصنيف</label><select className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-black" onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Networking</option><option>Electronics</option><option>Gaming</option><option>Software</option></select></div>
                 </div>
                 <div className="space-y-2"><label className="text-xs font-black text-slate-400 mr-2 uppercase">رابط الصورة (URL)</label><input type="url" placeholder="https://..." required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-bold" onChange={e => setNewProduct({...newProduct, image: e.target.value})} /></div>
                 <div className="p-8 bg-blue-50 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-3 text-blue-600 mb-2"><CardIcon size={20}/><h4 className="font-black text-sm">بيانات الدفع</h4></div>
                    {['kuraimi', 'qutaibi', 'paypal'].map(m => (
                        <div key={m} className="space-y-3">
                            <button type="button" onClick={() => setNewProduct({...newProduct, paymentMethods: {...newProduct.paymentMethods, [m]: !newProduct.paymentMethods[m]}})} className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${newProduct.paymentMethods[m] ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><span className="font-black text-xs uppercase">{m}</span>{newProduct.paymentMethods[m] ? <CheckCircle size={16}/> : <Plus size={16}/>}</button>
                            {newProduct.paymentMethods[m] && <motion.input initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} type="text" placeholder={`رقم الحساب لـ ${m}...`} required className="w-full p-5 bg-white rounded-2xl border-2 border-blue-200 outline-none font-bold text-xs" onChange={e => setNewProduct({...newProduct, paymentDetails: {...newProduct.paymentDetails, [m]: e.target.value}})} />}
                        </div>
                    ))}
                 </div>
                 <div className="space-y-2"><label className="text-xs font-black text-slate-400 mr-2 uppercase">الوصف</label><textarea placeholder="اشرح حالة المنتج وتفاصيله..." className="w-full p-6 bg-slate-50 rounded-[2rem] h-40 outline-none font-bold" onChange={e => setNewProduct({...newProduct, desc: e.target.value})} /></div>
                 <button className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">تأكيد ونشر المنتج</button>
               </form>
            </motion.div>
          )}

          {view === 'chat' && chatInfo && (
            <motion.div key="chat" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="fixed inset-0 z-[400] bg-slate-50 flex flex-col">
                <header className="p-6 bg-white border-b flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('home')} className="p-3 hover:bg-slate-100 rounded-2xl"><ArrowRight/></button>
                        <img src={chatInfo.sellerPhoto} className="w-12 h-12 rounded-2xl object-cover" alt=""/>
                        <div><h3 className="font-black text-sm">{chatInfo.sellerName}</h3><p className="text-[10px] text-blue-600 font-bold uppercase">{chatInfo.productName}</p></div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#e5ddd5] bg-opacity-30">
                    {messages.map((m, i) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.sender === user?.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 px-5 rounded-2xl max-w-[80%] shadow-sm relative ${m.sender === user?.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                                <p className="font-bold text-sm leading-relaxed mb-1">{m.text}</p>
                                <div className="flex items-center justify-end gap-1">
                                    <span className="text-[8px] opacity-70 font-black">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <MessageStatus status={m.status} isMine={m.sender === user?.uid} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-white border-t">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <input type="text" placeholder="اكتب رسالتك..." className="flex-1 bg-slate-100 p-5 rounded-[2rem] outline-none font-bold" value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMsg()} />
                        <button onClick={sendMsg} className="w-16 h-16 bg-blue-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"><Send size={24}/></button>
                    </div>
                </div>
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 p-4">
                <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-50 overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-700 via-blue-50 to-cyan-400" />
                    <div className="px-10 pb-12 -mt-20 text-center">
                        <img src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-40 h-40 rounded-[3rem] border-[10px] border-white shadow-2xl object-cover mx-auto mb-6" alt=""/>
                        <h2 className="text-3xl font-black text-slate-900">{user?.displayName}</h2>
                        <p className="text-slate-400 font-bold text-sm mb-8">{user?.email}</p>
                        <div className="space-y-6 text-right">
                            <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 mr-4">العنوان</label><input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none" /></div>
                            <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 mr-4">الواتساب</label><input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none" /></div>
                            <button onClick={handleUpdateProfile} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black hover:scale-[1.02] active:scale-95 transition-all">حفظ التغييرات</button>
                        </div>
                    </div>
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[450] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-3xl rounded-t-[5rem] p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-8"><button onClick={() => setSelectedProduct(null)} className="p-5 bg-slate-100 rounded-3xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"><X size={28}/></button>
                <div className="flex gap-3">
                   {user?.uid === selectedProduct.sellerId && <button onClick={() => deleteProduct(selectedProduct.id)} className="px-8 py-4 bg-red-50 text-red-600 rounded-[2rem] font-black text-xs border border-red-100 flex items-center gap-2"><Trash2 size={16}/> حذف المنتج</button>}
                   <div className="bg-blue-600 text-white px-6 py-4 rounded-[2rem] flex items-center gap-2 shadow-lg"><ShieldCheck size={18}/><span className="text-[10px] font-black uppercase">ضمان FUTURE</span></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white"><img src={selectedProduct.image} className="w-full h-full object-cover" alt="" /></div>
                    <div className="p-6 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <div className="flex items-center gap-4 mb-4"><img src={selectedProduct.sellerPhoto} className="w-16 h-16 rounded-[1.5rem] object-cover" alt=""/><div className="text-right"><p className="text-[10px] text-slate-400 font-black uppercase">التاجر</p><h4 className="font-black text-lg">{selectedProduct.sellerName}</h4></div></div>
                        <button onClick={() => startChat(selectedProduct)} className="w-full py-4 bg-blue-600 text-white border border-transparent rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl"><MessageCircle size={18}/> مراسلة التاجر الآن</button>
                    </div>
                </div>
                <div className="space-y-8 py-4">
                    <div className="space-y-2 text-right">
                        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black">{selectedProduct.category}</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h2>
                        <div className="flex items-center gap-2 text-yellow-400 justify-end">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.round(selectedProduct.avgRating || 0) ? "currentColor" : "none"}/>
                            ))}
                            <span className="text-slate-400 text-xs font-black mr-2">
                                {selectedProduct.avgRating || 0} ({selectedProduct.reviewCount || 0} تقييم حقيقي)
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-4xl font-black text-blue-600">${selectedProduct.price}</span>
                        <span className="text-xs font-bold text-slate-400">رسوم التوصيل: ${selectedProduct.shippingFee || 0}</span>
                    </div>
                    <div className="space-y-4 text-right"><h4 className="font-black text-sm flex items-center gap-2 justify-end underline decoration-blue-500 underline-offset-4"><Info size={16}/> تفاصيل المنتج</h4><p className="text-slate-500 text-sm leading-relaxed font-bold">{selectedProduct.desc || "لا يوجد وصف تقني لهذا المنتج."}</p></div>
                    <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => startChat(selectedProduct)} className="bg-slate-100 text-slate-900 py-7 rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">تواصل مباشر</button>
                         <button onClick={() => addToCart(selectedProduct)} className="bg-blue-600 text-white py-7 rounded-[2.5rem] font-black text-sm shadow-2xl shadow-blue-100 flex items-center justify-center gap-2 hover:scale-105 transition-all"><ShoppingCart size={20}/> للسلة</button>
                    </div>
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-slate-100 space-y-8 text-right">
                 <h3 className="text-2xl font-black">تقييمات العملاء الموثقة</h3>
                 <div className="bg-slate-50 p-8 rounded-[3rem] space-y-4">
                    <h4 className="font-black text-sm">{isEditingReview ? 'تعديل تقييمك' : 'أضف تقييمك'}</h4>
                    <div className="flex gap-2 mb-4 justify-end">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRatingInput(star)} className={`${ratingInput >= star ? 'text-yellow-400' : 'text-slate-300'}`}><Star fill={ratingInput >= star ? "currentColor" : "none"} size={24}/></button>
                      ))}
                    </div>
                    <textarea value={reviewInput} onChange={e => setReviewInput(e.target.value)} placeholder="ما رأيك بالمنتج وبالتعامل مع التاجر؟" className="w-full p-6 rounded-[2rem] border-none outline-none font-bold text-sm h-32 shadow-sm" />
                    <div className="flex gap-2">
                        {isEditingReview && <button onClick={() => {setIsEditingReview(null); setReviewInput(""); setRatingInput(5);}} className="bg-slate-200 px-8 py-4 rounded-2xl font-black text-xs">إلغاء التعديل</button>}
                        <button onClick={handleReviewAction} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs flex-1 shadow-lg active:scale-95 transition-all">{isEditingReview ? 'تحديث التقييم' : 'نشر التقييم'}</button>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6 pb-20">
                    {reviews.length > 0 ? reviews.map((r) => (
                        <div key={r.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-3">
                            <div className="flex gap-4">
                                <img src={r.userPhoto} className="w-12 h-12 rounded-2xl object-cover" alt=""/>
                                <div className="flex-1 text-right">
                                    <div className="flex justify-between items-center">
                                        <div className="flex text-yellow-400">{[...Array(r.rating)].map((_, idx) => <Star key={idx} size={10} fill="currentColor"/>)}</div>
                                        <h5 className="font-black text-xs">{r.userName}</h5>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{r.text}</p>
                                </div>
                            </div>
                            {user?.uid === r.userId && (
                                <div className="flex gap-3 justify-end pt-2 border-t border-slate-50">
                                    <button onClick={() => { setIsEditingReview(r.id); setReviewInput(r.text); setRatingInput(r.rating); }} className="text-[10px] font-black text-blue-600 flex items-center gap-1"><Edit3 size={12}/> تعديل</button>
                                    <button onClick={() => deleteReview(r.id)} className="text-[10px] font-black text-red-500 flex items-center gap-1"><Trash2 size={12}/> حذف</button>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-10 text-center text-slate-400 font-bold">لا توجد تقييمات لهذا المنتج حتى الآن.</div>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 opacity-50"><span className="font-black text-xs tracking-widest text-slate-900 uppercase">Future Store Yemen © 2026</span></footer>
    </div>
  );
};

export default FutureStore;
