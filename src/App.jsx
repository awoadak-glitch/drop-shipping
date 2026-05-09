import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, MessageCircle,
  Zap, ShoppingBag, ChevronRight, Plus, Minus, User, Settings, Package, MapPin, Phone, Send, Info, CheckCircle, ShieldCheck, Edit3
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
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [toast, setToast] = useState(null);
  
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [editingReview, setEditingReview] = useState(null);

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
          if (docSnap.exists()) setCart(docSnap.data().cart || []);
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleLogin = async () => {
    try { await signInWithPopup(auth, provider); } catch (e) { showToast("فشل تسجيل الدخول"); }
  };

  const addToCart = async (product) => {
    if (!user) return handleLogin();
    const newCart = [...cart, { ...product, cartId: Date.now(), qty: 1 }];
    await updateDoc(doc(db, "users", user.uid), { cart: newCart });
    showToast("تمت الإضافة للسلة 🛒");
  };

  const removeFromCart = async (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    await updateDoc(doc(db, "users", user.uid), { cart: newCart });
  };

  const addOrUpdateReview = async () => {
    if(!user || !reviewInput) return;
    const reviewData = {
      text: reviewInput, rating: ratingInput, userName: user.displayName, 
      userPhoto: user.photoURL, userId: user.uid, date: Date.now()
    };

    if (editingReview) {
      await updateDoc(doc(db, `products/${selectedProduct.id}/reviews`, editingReview.id), reviewData);
      setEditingReview(null);
    } else {
      await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), reviewData);
    }
    setReviewInput("");
    setRatingInput(5);
  };

  const deleteReview = async (reviewId) => {
    await deleteDoc(doc(db, `products/${selectedProduct.id}/reviews`, reviewId));
  };

  const totalPrice = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50 }} animate={{ y: 20 }} exit={{ y: -50 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[500] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl font-bold border border-slate-700 flex items-center gap-2">
            <Zap size={18} className="text-yellow-400"/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-[150] px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Package size={20} />
          </div>
          <span className="font-black text-lg tracking-tighter">FUTURE <span className="text-blue-600">ST</span></span>
        </div>
        <div className="flex gap-2">
          {user && <button onClick={() => setView('admin')} className="p-3 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Plus size={20}/></button>}
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg relative">
            <ShoppingBag size={18}/>
            <span className="font-bold text-sm">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-bold">{cart.length}</span>}
          </button>
          <button onClick={() => setView('profile')} className="p-1 border border-slate-100 rounded-xl overflow-hidden">
            <img src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-9 h-9 rounded-lg object-cover" />
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Home */}
        {view === 'home' && (
          <motion.div key="home" className="p-6 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
             {products.map(product => (
                <div key={product.id} className="bg-white p-3 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                   <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-3 bg-slate-50 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <h3 className="text-[11px] font-black px-1 line-clamp-1">{product.name}</h3>
                   <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-blue-600 font-black text-sm">${product.price}</span>
                      <button onClick={() => addToCart(product)} className="bg-slate-100 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"><Plus size={16}/></button>
                   </div>
                </div>
             ))}
          </motion.div>
        )}

        {/* Cart View */}
        {view === 'cart' && (
          <motion.div key="cart" className="p-6 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-black">سلة المشتريات</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <ShoppingBag size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="font-black text-slate-400">السلة فارغة حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cartId} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-black text-sm">{item.name}</h4>
                      <p className="text-blue-600 font-black">${item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="p-3 text-red-500 bg-red-50 rounded-2xl"><Trash2 size={18}/></button>
                  </div>
                ))}
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl">
                  <div>
                    <p className="text-xs text-slate-400 font-bold">إجمالي المبلغ</p>
                    <h3 className="text-3xl font-black">${totalPrice}</h3>
                  </div>
                  <button className="bg-blue-600 px-8 py-4 rounded-2xl font-black shadow-lg">إتمام الطلب</button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <motion.div key="profile" className="p-6 max-w-md mx-auto text-center space-y-6">
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl">
              <img src={user?.photoURL} className="w-24 h-24 rounded-[2rem] mx-auto mb-4 border-4 border-blue-50" />
              <h2 className="text-2xl font-black">{user?.displayName || "ضيف"}</h2>
              <p className="text-slate-400 font-bold mb-8">{user?.email}</p>
              <button onClick={() => { signOut(auth); setView('home'); }} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black flex items-center justify-center gap-2">
                <LogOut size={20}/> تسجيل الخروج
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-2xl rounded-t-[4rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              
              <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setSelectedProduct(null)} className="p-3 bg-slate-100 rounded-xl"><X/></button>
                 <span className="font-black text-xs uppercase text-slate-400">تفاصيل المنتج</span>
              </div>

              <img src={selectedProduct.image} className="w-full aspect-video object-cover rounded-[2.5rem] mb-6 shadow-lg" />
              
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black">{selectedProduct.name}</h2>
                <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl font-black text-xl">${selectedProduct.price}</div>
              </div>

              <button onClick={() => addToCart(selectedProduct)} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg mb-10 flex items-center justify-center gap-3">
                <ShoppingCart size={22}/> إضافة للسلة
              </button>

              {/* Reviews Section */}
              <div className="space-y-6 pt-6 border-t">
                <h4 className="text-xl font-black">المراجعات ({reviews.length})</h4>
                
                {/* Rating Picker */}
                <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRatingInput(star)} className="transition-transform active:scale-90">
                        <Star size={32} className={`${ratingInput >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder={editingReview ? "تعديل تعليقك..." : "اكتب تعليقك هنا..."} className="flex-1 bg-white p-4 rounded-2xl outline-none font-bold text-sm shadow-sm" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                    <button onClick={addOrUpdateReview} className="bg-blue-600 text-white px-6 rounded-2xl font-black text-sm">
                      {editingReview ? "تحديث" : "نشر"}
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex gap-4 relative">
                      <img src={r.userPhoto} className="w-10 h-10 rounded-xl" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-xs">{r.userName}</h5>
                          <div className="flex text-yellow-400">
                            {[...Array(r.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor"/>)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">{r.text}</p>
                      </div>

                      {/* Edit/Delete Actions */}
                      {user?.uid === r.userId && (
                        <div className="absolute left-4 bottom-4 flex gap-2">
                          <button onClick={() => { setEditingReview(r); setReviewInput(r.text); setRatingInput(r.rating); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                          <button onClick={() => deleteReview(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                      )}
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
