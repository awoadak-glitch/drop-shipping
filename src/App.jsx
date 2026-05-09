import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, 
  MapPin, Phone, Send, Info, CheckCircle, ShieldCheck, Edit3, Search,
  Bell, Heart, Layout, Filter, ArrowRight, Home, Menu, RefreshCw, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Setup
import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, 
  orderBy, deleteDoc, updateDoc, arrayUnion, where, limit, getDocs 
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

// --- Components ---

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
  const [myChats, setMyChats] = useState([]); // قائمة المحادثات النشطة
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [editingReview, setEditingReview] = useState(null);

  // Profile Edit State
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Product Creation State
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', image: '', category: 'Networking', desc: '', 
    paymentMethods: { kuraimi: true, qutaibi: false, paypal: false },
    paymentDetails: { kuraimi: '', qutaibi: '', paypal: '' } 
  });

  const chatEndRef = useRef(null);

  // --- Effects ---

  useEffect(() => {
    // 1. Fetch Products
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Auth & User Data
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
                cart: [], 
                wishlist: [],
                createdAt: Date.now(),
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL
            });
          }
        });
        
        // 3. Fetch My Chats (Central Inbox)
        // هذا الجزء يقوم بجلب كل المحادثات التي شارك فيها المستخدم
        const chatsRef = collection(db, "chats");
        const qChats = query(chatsRef, where("participants", "array-contains", currentUser.uid));
        onSnapshot(qChats, (snap) => {
            setMyChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
    });

    return () => { unsubProducts(); unsubAuth(); };
  }, []);

  // Sync Chat Messages
  useEffect(() => {
    if (chatInfo) {
      const q = query(collection(db, `chats/${chatInfo.id}/messages`), orderBy("time", "asc"));
      const unsubChat = onSnapshot(q, (s) => {
        setMessages(s.docs.map(d => d.data()));
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
      return () => unsubChat();
    }
  }, [chatInfo]);

  // Sync Product Reviews
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
        sellerId: user.uid, 
        sellerName: user.displayName,
        sellerPhoto: user.photoURL,
        rating: 5, 
        createdAt: Date.now() 
      });
      showToast("تم نشر المنتج بنجاح ✅");
      setView('home');
    } catch (err) { showToast("حدث خطأ أثناء النشر", "error"); }
  };

  const addToCart = async (product) => {
    if (!user) return handleLogin();
    try {
      const newCartItem = { ...product, cartId: Date.now(), qty: 1 };
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { cart: arrayUnion(newCartItem) });
      showToast("تمت الإضافة للسلة 🛒");
    } catch (err) { showToast("فشل إضافة المنتج", "error"); }
  };

  const removeFromCart = async (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    await updateDoc(doc(db, "users", user.uid), { cart: newCart });
    showToast("تم الحذف من السلة");
  };

  const startChat = async (product) => {
    if(!user) return handleLogin();
    if(user.uid === product.sellerId) return showToast("لا يمكنك مراسلة نفسك", "info");

    const chatId = user.uid < product.sellerId ? 
                   `${user.uid}_${product.sellerId}` : 
                   `${product.sellerId}_${user.uid}`;
    
    // إنشاء رأس المحادثة إذا لم تكن موجودة
    await setDoc(doc(db, "chats", chatId), {
        id: chatId,
        participants: [user.uid, product.sellerId],
        productName: product.name,
        lastMsg: "بدأ المحادثة...",
        time: Date.now(),
        users: {
            [user.uid]: { name: user.displayName, photo: user.photoURL },
            [product.sellerId]: { name: product.sellerName, photo: product.sellerPhoto }
        }
    }, { merge: true });

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
        await addDoc(collection(db, `chats/${chatInfo.id}/messages`), {
            text, 
            sender: user.uid, 
            time: Date.now()
        });
        await updateDoc(doc(db, "chats", chatInfo.id), {
            lastMsg: text,
            time: Date.now()
        });
    } catch (e) { showToast("فشل إرسال الرسالة", "error"); }
  };

  // --- View Components ---

  const Sidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[250]"
          />
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-80 bg-white z-[300] shadow-2xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">الرسائل (Inbox)</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-xl"><X/></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {myChats.length === 0 ? (
                <div className="text-center py-10">
                  <MessageCircle size={48} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 font-bold text-sm">لا توجد محادثات بعد</p>
                </div>
              ) : (
                myChats.map(chat => {
                  const otherUser = Object.keys(chat.users).find(id => id !== user?.uid);
                  const info = chat.users[otherUser];
                  return (
                    <button 
                      key={chat.id}
                      onClick={() => {
                        setChatInfo({ id: chat.id, productName: chat.productName, sellerName: info.name, sellerPhoto: info.photo });
                        setView('chat');
                        setIsSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-[2rem] transition-all text-right border border-transparent hover:border-blue-100"
                    >
                      <img src={info.photo} className="w-12 h-12 rounded-2xl object-cover" />
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

  const totalPrice = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-['Cairo',_sans-serif]" dir="rtl">
      
      <Sidebar />

      {/* Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 30, opacity: 1 }} exit={{ y: -100, opacity: 0 }} 
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 font-black border ${
                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {toast.type === 'error' ? <X size={20}/> : <CheckCircle size={20} className="text-green-400"/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-3xl z-[200] px-4 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <MessageCircle size={22} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Zap size={20} fill="currentColor"/>
            </div>
            <span className="font-black text-lg hidden sm:block">FUTURE <span className="text-blue-600">ST</span></span>
          </div>
        </div>

        <div className="flex gap-2">
          {user && (
            <button onClick={() => setView('admin')} className="hidden sm:flex p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white items-center gap-2 transition-all font-bold text-xs">
              <Plus size={18}/> نشر منتج
            </button>
          )}
          
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl relative active:scale-95 transition-transform">
            <ShoppingBag size={20}/>
            <span className="font-black text-sm hidden sm:block">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-black">{cart.length}</span>}
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
                       <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase">مرحباً بك</p>
                        <p className="text-xs font-black truncate">{user?.displayName || 'زائر جديد'}</p>
                       </div>
                    </div>
                    <button onClick={() => { setView('profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-right">
                       <User size={18} className="text-blue-600"/> <span className="text-xs font-bold">الملف الشخصي</span>
                    </button>
                    <button onClick={() => { setView('admin'); setShowProfileMenu(false); }} className="sm:hidden w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-right">
                       <Plus size={18} className="text-blue-600"/> <span className="text-xs font-bold">نشر منتج جديد</span>
                    </button>
                    <div className="h-px bg-slate-50 my-2" />
                    {user ? (
                      <button onClick={() => { signOut(auth); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-colors text-right">
                        <LogOut size={18}/> <span className="text-xs font-bold">تسجيل الخروج</span>
                      </button>
                    ) : (
                      <button onClick={() => { handleLogin(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors text-right">
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

      {/* Main Content Areas */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW */}
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                <input 
                    type="text" placeholder="ابحث عن أجهزة، حسابات، أو خدمات..." 
                    className="w-full bg-white border border-slate-100 p-6 pr-16 rounded-[2.5rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-100 font-bold transition-all"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>

              {/* Categories */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                {["الكل", "Networking", "Electronics", "Gaming", "Software"].map(c => (
                  <button 
                    key={c} onClick={() => setActiveCategory(c)} 
                    className={`px-10 py-4 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                        activeCategory === c ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map(product => (
                  <motion.div 
                    layout key={product.id}
                    className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all"
                  >
                    <div 
                        className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-4 bg-slate-50 cursor-pointer relative"
                        onClick={() => setSelectedProduct(product)}
                    >
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                        {product.category}
                      </div>
                    </div>
                    <h3 className="text-xs font-black px-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    <div className="flex justify-between items-center mt-4 px-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">السعر</span>
                        <span className="text-blue-600 font-black text-xl">${product.price}</span>
                      </div>
                      <button onClick={() => addToCart(product)} className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg active:scale-90">
                        <Plus size={20}/>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ADMIN / SELL VIEW */}
          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-50">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black">بيع منتج جديد</h2>
                  <button onClick={() => setView('home')} className="p-4 bg-slate-100 rounded-3xl"><X/></button>
               </div>
               
               <form onSubmit={handleAddProduct} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 uppercase">اسم السلعة</label>
                    <input type="text" placeholder="مثلاً: Mikrotik hAP ac2" required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2 uppercase">السعر ($)</label>
                        <input type="number" placeholder="0.00" required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-bold" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2 uppercase">التصنيف</label>
                        <select className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-black appearance-none" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                            <option>Networking</option><option>Electronics</option><option>Gaming</option><option>Software</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 uppercase">رابط الصورة (URL)</label>
                    <input type="url" placeholder="https://..." required className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none font-bold" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                 </div>

                 <div className="p-8 bg-blue-50 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <CreditCard size={20}/><h4 className="font-black text-sm">بيانات الدفع لاستقبال الأموال</h4>
                    </div>
                    {['kuraimi', 'qutaibi', 'paypal'].map(m => (
                        <div key={m} className="space-y-3">
                            <button 
                                type="button" 
                                onClick={() => setNewProduct({...newProduct, paymentMethods: {...newProduct.paymentMethods, [m]: !newProduct.paymentMethods[m]}})}
                                className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${newProduct.paymentMethods[m] ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}
                            >
                                <span className="font-black text-xs uppercase">{m}</span>
                                {newProduct.paymentMethods[m] ? <CheckCircle size={16}/> : <Plus size={16}/>}
                            </button>
                            {newProduct.paymentMethods[m] && (
                                <motion.input 
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    type="text" placeholder={`رقم الحساب لـ ${m}...`} required
                                    className="w-full p-5 bg-white rounded-2xl border-2 border-blue-200 outline-none font-bold text-xs"
                                    onChange={e => setNewProduct({...newProduct, paymentDetails: {...newProduct.paymentDetails, [m]: e.target.value}})}
                                />
                            )}
                        </div>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 uppercase">الوصف</label>
                    <textarea placeholder="اشرح حالة المنتج وتفاصيله..." className="w-full p-6 bg-slate-50 rounded-[2rem] h-40 outline-none font-bold" onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
                 </div>

                 <button className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                    تأكيد ونشر المنتج
                 </button>
               </form>
            </motion.div>
          )}

          {/* CHAT INTERFACE */}
          {view === 'chat' && chatInfo && (
            <motion.div key="chat" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="fixed inset-0 z-[400] bg-slate-50 flex flex-col">
                <header className="p-6 bg-white border-b flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('home')} className="p-3 hover:bg-slate-100 rounded-2xl"><ArrowRight/></button>
                        <img src={chatInfo.sellerPhoto} className="w-12 h-12 rounded-2xl object-cover" alt=""/>
                        <div>
                            <h3 className="font-black text-sm">{chatInfo.sellerName}</h3>
                            <p className="text-[10px] text-blue-600 font-bold uppercase">{chatInfo.productName}</p>
                        </div>
                    </div>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl"><Info size={20}/></button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <MessageCircle size={64} className="mb-4 opacity-20"/>
                            <p className="font-black text-sm">ابدأ المحادثة الآن بخصوص {chatInfo.productName}</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            key={i} className={`flex ${m.sender === user?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`p-5 rounded-[2rem] max-w-[80%] shadow-sm ${
                                m.sender === user?.uid ? 
                                'bg-blue-600 text-white rounded-br-none' : 
                                'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                            }`}>
                                <p className="font-bold text-sm leading-relaxed">{m.text}</p>
                                <span className="text-[8px] opacity-50 mt-2 block font-black">
                                    {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 bg-white border-t">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <input 
                            type="text" placeholder="اكتب رسالتك بوضوح..."
                            className="flex-1 bg-slate-100 p-5 rounded-[2rem] outline-none font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            value={msgInput} onChange={e => setMsgInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMsg()}
                        />
                        <button onClick={sendMsg} className="w-16 h-16 bg-blue-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all">
                            <Send size={24}/>
                        </button>
                    </div>
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Product Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[450] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-3xl rounded-t-[5rem] p-10 max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl">
              
              <div className="flex justify-between items-center mb-8">
                 <button onClick={() => setSelectedProduct(null)} className="p-5 bg-slate-100 rounded-3xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"><X size={28}/></button>
                 <div className="flex gap-3">
                   {user?.uid === selectedProduct.sellerId && (
                     <button onClick={() => deleteProduct(selectedProduct.id)} className="px-8 py-4 bg-red-50 text-red-600 rounded-[2rem] font-black text-xs border border-red-100 flex items-center gap-2">
                        <Trash2 size={16}/> حذف من المتجر
                     </button>
                   )}
                   <div className="bg-blue-600 text-white px-6 py-4 rounded-[2rem] flex items-center gap-2 shadow-lg">
                      <ShieldCheck size={18}/><span className="text-[10px] font-black uppercase">ضمان FUTURE</span>
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white">
                      <img src={selectedProduct.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <img src={selectedProduct.sellerPhoto} className="w-16 h-16 rounded-[1.5rem] object-cover" alt=""/>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase">التاجر</p>
                                <h4 className="font-black text-lg">{selectedProduct.sellerName}</h4>
                            </div>
                        </div>
                        <button 
                            onClick={() => startChat(selectedProduct)}
                            className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            <MessageCircle size={18}/> مراسلة التاجر الآن
                        </button>
                    </div>
                </div>

                <div className="space-y-8 py-4">
                    <div className="space-y-2">
                        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black">{selectedProduct.category}</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h2>
                        <div className="flex items-center gap-2 text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"}/>)}
                            <span className="text-slate-400 text-xs font-black mr-2">4.8 (24 تقييم)</span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-blue-600">${selectedProduct.price}</span>
                        <span className="text-slate-400 line-through text-sm font-bold">${(selectedProduct.price * 1.2).toFixed(2)}</span>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-black text-sm flex items-center gap-2 underline decoration-blue-500 underline-offset-4">
                           <Info size={16}/> تفاصيل المنتج
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed font-bold">
                            {selectedProduct.desc || "لا يوجد وصف تقني لهذا المنتج، يرجى التواصل مع البائع للاستفسار عن المواصفات."}
                        </p>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-[3rem] space-y-4 shadow-xl">
                        <h4 className="text-xs font-black flex items-center gap-2 text-blue-400 uppercase tracking-widest"><CreditCard size={16}/> خيارات الدفع والتحويل</h4>
                        <div className="space-y-3">
                            {Object.entries(selectedProduct.paymentMethods || {}).map(([method, active]) => active && (
                                <div key={method} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <span className="text-[10px] font-black uppercase text-slate-300">{method}</span>
                                    <span className="text-xs font-black text-blue-400 select-all">{selectedProduct.paymentDetails?.[method] || "متوفر"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => addToCart(selectedProduct)}
                        className="w-full bg-blue-600 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ShoppingCart size={24}/> شراء المنتج الآن
                    </button>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-16 pt-10 border-t border-slate-100 space-y-8">
                 <h3 className="text-2xl font-black">ماذا يقول المشترون؟</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    {reviews.length === 0 ? (
                        <div className="p-10 bg-slate-50 rounded-[3rem] text-center md:col-span-2">
                            <p className="font-black text-slate-400">كن أول من يقيم هذا المنتج</p>
                        </div>
                    ) : (
                        reviews.map((r, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex gap-4">
                                <img src={r.userPhoto} className="w-12 h-12 rounded-2xl" alt=""/>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-black text-xs">{r.userName}</h5>
                                        <div className="flex text-yellow-400">
                                            {[...Array(r.rating)].map((_, idx) => <Star key={idx} size={10} fill="currentColor"/>)}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{r.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                 </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile & Settings View */}
      {view === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 p-4">
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-50 overflow-hidden relative">
                <div className="h-48 bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400" />
                <div className="px-10 pb-12 -mt-20 text-center">
                    <div className="relative inline-block mb-6">
                        <img 
                            src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                            className="w-40 h-40 rounded-[3rem] border-[10px] border-white shadow-2xl object-cover" 
                            alt="avatar"
                        />
                        <div className="absolute bottom-2 right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-1">{user?.displayName}</h2>
                    <p className="text-slate-400 font-bold text-sm mb-8">{user?.email}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">المشتريات</p>
                            <p className="text-2xl font-black">{cart.length}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">المبيعات</p>
                            <p className="text-2xl font-black text-blue-600">{products.filter(p => p.sellerId === user?.uid).length}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">المفضلة</p>
                            <p className="text-2xl font-black">0</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">الرصيد</p>
                            <p className="text-2xl font-black text-green-500">$0</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-right">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 mr-4 flex items-center gap-2 uppercase">
                                <MapPin size={14} className="text-blue-600"/> عنوان الشحن الرئيسي
                            </label>
                            <input 
                                type="text" value={editAddress} placeholder="المدينة - الشارع - المعلم..."
                                className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] font-bold outline-none focus:bg-white focus:border-blue-200 transition-all shadow-inner"
                                onChange={e => setEditAddress(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 mr-4 flex items-center gap-2 uppercase">
                                <Phone size={14} className="text-blue-600"/> رقم التواصل (واتساب)
                            </label>
                            <input 
                                type="text" value={editPhone} placeholder="+967..."
                                className="w-full p-6 bg-slate-50 border border-transparent rounded-[2rem] font-bold outline-none focus:bg-white focus:border-blue-200 transition-all shadow-inner"
                                onChange={e => setEditPhone(e.target.value)} 
                            />
                        </div>
                        
                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                            <button onClick={handleUpdateProfile} className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black shadow-xl hover:bg-blue-600 transition-colors">
                                حفظ كافة التغييرات
                            </button>
                            <button onClick={() => setView('home')} className="flex-1 bg-white border-2 border-slate-100 text-slate-500 py-6 rounded-[2rem] font-black hover:bg-slate-50 transition-colors">
                                العودة للمتجر
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      )}

      {/* Empty State for Cart */}
      {view === 'cart' && cart.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-48 h-48 bg-white rounded-[4rem] flex items-center justify-center shadow-2xl mb-8 border border-slate-50">
                <ShoppingBag size={80} className="text-slate-100" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">حقيبة التسوق فارغة</h2>
            <p className="text-slate-400 font-bold mb-10">يبدو أنك لم تضف أي منتجات حتى الآن!</p>
            <button onClick={() => setView('home')} className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:scale-105 transition-all">
                ابدأ التسوق الآن
            </button>
        </motion.div>
      )}

      {/* Cart Items View */}
      {view === 'cart' && cart.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black">سلتك الحالية</h2>
                <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-black text-xs">{cart.length} عناصر</span>
            </div>
            
            <div className="space-y-4">
                {cart.map((item) => (
                    <motion.div 
                        layout key={item.cartId} 
                        className="bg-white p-6 rounded-[3rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:shadow-xl transition-all"
                    >
                        <img src={item.image} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-50" alt=""/>
                        <div className="flex-1">
                            <h4 className="font-black text-sm mb-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black">${item.price}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">بائع: {item.sellerName}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => removeFromCart(item.cartId)}
                                className="p-5 text-red-500 bg-red-50 rounded-[1.8rem] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <Trash2 size={24}/>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900 rounded-[4rem] p-12 text-white flex flex-col md:flex-row justify-between items-center mt-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 text-center md:text-right mb-8 md:mb-0">
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">إجمالي المطلوب سداده</p>
                    <h3 className="text-6xl font-black text-white">${totalPrice.toFixed(2)}</h3>
                </div>
                <button className="relative z-10 bg-blue-600 hover:bg-blue-500 text-white px-16 py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
                    تأكيد الطلب <ArrowRight />
                </button>
            </div>
        </motion.div>
      )}

      {/* Footer Branding */}
      <footer className="mt-20 py-10 text-center border-t border-slate-100">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Package size={16} />
            </div>
            <span className="font-black text-sm tracking-widest text-slate-900">FUTURE STORE © 2026</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Developed with ❤️ for Modern Trading</p>
      </footer>

    </div>
  );
};

export default FutureStore;
