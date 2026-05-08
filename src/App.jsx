import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, Trash2, CreditCard, X, LogIn, LogOut, ChevronRight
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

// إعدادات Firebase الخاصة بك
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
  { id: 1, name: "JCG Q20 Custom Router", price: 45, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500", category: "Networking", rating: 4.9, desc: "راوتر معدل بأداء عالي للشبكات." },
  { id: 2, name: "Premium Wireless Headset", price: 120, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "Electronics", rating: 4.8, desc: "سماعات لاسلكية بجودة صوت نقية." },
  { id: 3, name: "Smart Watch Series", price: 85, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "Tech", rating: 4.7, desc: "ساعة ذكية لمتابعة النشاط اليومي." },
  { id: 4, name: "Mechanical Keyboard", price: 60, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", category: "Gaming", rating: 4.9, desc: "لوحة مفاتيح ميكانيكية احترافية." }
];

const FutureStore = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // مراقبة حالة تسجيل الدخول ومزامنة السلة
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setCart(docSnap.data().cart || []);
        });
        return () => unsubDoc();
      } else {
        setCart([]);
      }
    });
    return () => unsubAuth();
  }, []);

  const syncCart = async (newCart) => {
    if (user) {
      await setDoc(doc(db, "users", user.uid), { cart: newCart }, { merge: true });
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("خطأ في تسجيل الدخول، حاول مرة أخرى");
    }
  };

  const addToCart = (product) => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً لتتمكن من إضافة المنتجات للسلة");
      handleLogin();
      return;
    }
    const updated = [...cart, { ...product, qty: 1, cartId: Date.now() }];
    setCart(updated);
    syncCart(updated);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">F</div>
          <span className="font-black text-gray-800 tracking-tight">FUTURE STORE</span>
        </div>
        
        <div className="flex gap-2">
          {user ? (
            <button onClick={() => signOut(auth)} className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-xl text-xs font-bold">
              <LogOut size={14}/> خروج
            </button>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-100">
              <LogIn size={14}/> دخول
            </button>
          )}
          <button onClick={() => setView(view === 'cart' ? 'home' : 'cart')} className="bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg relative">
            <ShoppingCart size={18} />
            <span className="font-bold text-sm">${totalPrice}</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
          </button>
        </div>
      </nav>

      {/* Main View */}
      {view === 'home' ? (
        <div className="p-4 grid grid-cols-2 gap-4">
          {productsData.map(product => (
            <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
              <div onClick={() => setSelectedProduct(product)} className="aspect-square bg-gray-100 relative cursor-pointer">
                <img src={product.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star size={10} className="fill-yellow-400 text-yellow-400"/>
                  <span className="text-[10px] font-bold">{product.rating}</span>
                </div>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                <span className="text-[10px] text-gray-400 mb-3 block">{product.category}</span>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-black text-gray-900">${product.price}</span>
                  <button onClick={() => addToCart(product)} className="bg-gray-100 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 max-w-md mx-auto">
          <h2 className="text-2xl font-black mb-6">سلة المشتريات</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-400">السلة فارغة</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-2xl flex items-center gap-4 border border-gray-100">
                  <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div className="flex-1 text-xs font-bold">{item.name}</div>
                  <div className="font-black">${item.price}</div>
                  <button onClick={() => {
                    const newCart = cart.filter((_, i) => i !== index);
                    setCart(newCart); syncCart(newCart);
                  }} className="text-red-400"><Trash2 size={16}/></button>
                </div>
              ))}
              <div className="bg-gray-900 text-white p-6 rounded-[2rem] mt-10">
                <div className="flex justify-between mb-4"><span>الإجمالي</span><span className="text-xl font-black">${totalPrice}</span></div>
                <button className="w-full bg-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <CreditCard size={18}/> إتمام الشراء
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* نافذة التفاصيل (Product Detail Modal) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between mb-4">
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">{selectedProduct.category}</div>
              <button onClick={() => setSelectedProduct(null)} className="bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <img src={selectedProduct.image} className="w-full h-48 object-cover rounded-[2rem] mb-6" alt="" />
            <h2 className="text-xl font-black mb-2">{selectedProduct.name}</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{selectedProduct.desc}</p>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <span className="text-gray-400 text-xs block">السعر</span>
                <span className="text-2xl font-black text-gray-900">${selectedProduct.price}</span>
              </div>
              <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-xl">إضافة للسلة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureStore;
