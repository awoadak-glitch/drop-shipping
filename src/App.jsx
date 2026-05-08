import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Star, Heart, Trash2, CreditCard, ArrowRight, CheckCircle2, 
  Search, Package, StarHalf, Plus, Minus, User, LogOut, LogIn
} from 'lucide-react';

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

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const productsData = [
  { id: 1, name: "JCG Q20 Custom Router", price: 45, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9, reviews: 128, desc: "الراوتر الأقوى لأصحاب الشبكات، يدعم تعديلات السوفتوير المتقدمة ويوفر تغطية جبارة." },
  { id: 2, name: "Smart RGB Desk Lamp", price: 32, image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500", category: "Home Tech", rating: 4.7, reviews: 85, desc: "إضاءة مكتبية ذكية تريح العين وتدعم التحكم الصوتي الكامل." },
  { id: 3, name: "Noise Cancelling Buds Pro", price: 89, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", category: "Audio", rating: 4.8, reviews: 210, desc: "عزل صوتي فائق الدقة مع ميكروفونات عالية الوضوح للمكالمات." },
  { id: 4, name: "Mechanical Gaming Keyboard", price: 110, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9, reviews: 156, desc: "لوحة مفاتيح احترافية للاعبين والمبرمجين، استجابة لحظية ومتانة عالية." },
];

const FutureStore = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const scrollPosition = useRef(0);

  // --- إدارة البيانات السحابية (Firebase) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // الاستماع اللحظي للسلة: أي تغيير في الداتا بيس سيحدث الموقع هنا فوراً
        const userRef = doc(db, "users", currentUser.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCart(docSnap.data().cart || []);
            setWishlist(docSnap.data().wishlist || []);
          }
        });
        return () => unsubDoc();
      } else {
        setCart([]);
        setWishlist([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncWithCloud = async (newCart, newWishlist) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { 
        cart: newCart || cart, 
        wishlist: newWishlist || wishlist,
        email: user.email,
        lastActive: new Date()
      }, { merge: true });
    }
  };

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  // --- وظائف المتجر ---
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (product) => {
    if (!user) { showToast("يرجى تسجيل الدخول أولاً"); return; }
    const existingItem = cart.find(item => item.id === product.id);
    const updatedCart = existingItem 
      ? cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { ...product, qty: 1 }];
    
    setCart(updatedCart);
    syncWithCloud(updatedCart, null);
    showToast(`تم تحديث ${product.name}`);
  };

  const updateQty = (id, delta) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(updatedCart);
    syncWithCloud(updatedCart, null);
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    syncWithCloud(updatedCart, null);
    showToast("تم الحذف من السلة");
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900" dir="rtl">
      
      {/* التنبيهات */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${notification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10">
          <CheckCircle2 className="text-green-500" />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      </div>

      {/* الهيدر */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">F</div>
          <h1 className="text-xl font-black tracking-tighter">FUTURE STORE</h1>
        </div>

        <div className="flex gap-3 items-center">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 hidden md:block">{user.displayName}</span>
              <img src={user.photoURL} className="w-8 h-8 rounded-xl shadow-sm" alt="profile" />
              <button onClick={logout} className="p-2 text-red-400 hover:text-red-600 transition-colors"><LogOut size={18}/></button>
            </div>
          ) : (
            <button onClick={login} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all">
              <LogIn size={18}/> دخول
            </button>
          )}
          
          <button onClick={() => setView('cart')} className="bg-slate-900 text-white px-5 py-3 rounded-2xl relative flex items-center gap-3 hover:bg-blue-600 transition-all">
            <ShoppingCart size={20} />
            <span className="font-bold">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white text-[10px] font-black">{cart.length}</span>}
          </button>
        </div>
      </nav>

      {/* الصفحة الرئيسية */}
      {view === 'home' && (
        <main className="p-6 md:p-12 max-w-[1400px] mx-auto">
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Networking", "Home Tech", "Audio", "Gaming"].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                {cat === "All" ? "الكل" : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => {
              const inCart = cart.find(i => i.id === product.id);
              return (
                <div key={product.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-slate-50">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                  </div>
                  <h3 className="font-black text-slate-800 mb-6 px-2 line-clamp-2 h-12 leading-tight">{product.name}</h3>
                  
                  {/* حاوية السعر والأزرار المعدلة لعدم التداخل */}
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-[1.5rem] min-h-[64px]">
                    <span className="text-xl font-black text-slate-900 mr-3">${product.price}</span>
                    
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                        <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Minus size={14}/></button>
                        <span className="font-black text-sm w-6 text-center">{inCart.qty}</span>
                        <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-md"><Plus size={14}/></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-blue-600 transition-all">
                        <ShoppingCart size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* واجهة السلة */}
      {view === 'cart' && (
        <div className="max-w-4xl mx-auto p-6 md:py-20">
          <h2 className="text-4xl font-black mb-10">سلة المشتريات</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
              <Package size={60} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">لا يوجد منتجات في سلتك حالياً</p>
              <button onClick={() => setView('home')} className="mt-6 text-blue-600 font-bold">ابدأ التسوق الآن</button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-6">
                  <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-blue-600 font-black">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl">
                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><Minus size={14}/></button>
                    <span className="font-black w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2"><Trash2 size={20}/></button>
                </div>
              ))}
              <div className="mt-10 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400 font-bold">الإجمالي الكلي</span>
                  <span className="text-3xl font-black">${totalPrice}</span>
                </div>
                <button className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                  <CreditCard /> إتمام الطلب (الدفع عند الاستلام/كريمي)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FutureStore;
