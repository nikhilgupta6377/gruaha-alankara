import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Search, Filter, Loader2, CheckCircle2, Camera } from 'lucide-react';
import ARViewer from '../components/ARViewer';

import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MOCK_FURNITURE = [
  {
    id: 'f1',
    name: 'Velvet Cloud Sofa',
    category: 'Living Room',
    price: 1299,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    description: 'A luxurious deep-seated sofa with premium velvet upholstery and gold-finished legs.'
  },
  {
    id: 'f2',
    name: 'Nordic Oak Dining Table',
    category: 'Dining',
    price: 850,
    image_url: 'https://images.unsplash.com/photo-1577146333195-6c219f7e0f34?auto=format&fit=crop&q=80&w=800',
    description: 'Minimalist solid oak dining table that brings warmth and natural texture to your space.'
  },
  {
    id: 'f3',
    name: 'Industrial Loft Bookshelf',
    category: 'Office',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=800',
    description: 'Steel frame and reclaimed wood shelves, perfect for a modern industrial workspace.'
  },
  {
    id: 'f4',
    name: 'Zen Platform Bed',
    category: 'Bedroom',
    price: 1100,
    image_url: 'https://images.unsplash.com/photo-1505693419148-433060e1976f?auto=format&fit=crop&q=80&w=800',
    description: 'Low-profile bed frame with integrated nightstands for a clean, serene bedroom environment.'
  }
];

export default function BookingPage() {
  const [furniture, setFurniture] = useState(MOCK_FURNITURE);
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [showAR, setShowAR] = useState(false);
  const [arFurniture, setArFurniture] = useState(null);

  useEffect(() => {
    // Mocking the fetch
    setLoading(false);
  }, []);

  const handleBook = async (item) => {
    if (!auth.currentUser) {
      alert('Please sign in to book furniture.');
      return;
    }

    try {
      await addDoc(collection(db, 'bookings'), {
        uid: auth.currentUser.uid,
        furnitureId: item.id,
        furnitureName: item.name,
        price: item.price,
        status: 'confirmed',
        createdAt: serverTimestamp()
      });
      
      setBookingStatus(item.id);
      setTimeout(() => setBookingStatus(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const handleVisualize = (item) => {
    setArFurniture({
      name: item.name,
      type: item.category.toLowerCase().includes('dining') ? 'table' : 
            item.category.toLowerCase().includes('chair') ? 'chair' : 'sofa',
      color: '#c4a484'
    });
    setShowAR(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {showAR && <ARViewer initialFurniture={arFurniture} onClose={() => setShowAR(false)} />}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">Furniture Catalog</h1>
          <p className="text-white/50 text-sm sm:text-base">Curated pieces for your dream interior.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search furniture..." 
              className="pl-12 pr-6 py-3 glass rounded-full border border-white/10 focus:border-accent/50 outline-none w-full"
            />
          </div>
          <button className="w-full sm:w-auto p-3 glass rounded-full border border-white/10 hover:border-accent/50 transition-colors flex items-center justify-center">
            <Filter size={18} />
            <span className="sm:hidden ml-2 text-sm font-medium">Filter</span>
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {furniture.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-3xl border border-white/5 overflow-hidden group hover:border-accent/30 transition-all"
          >
            <div className="aspect-[4/5] overflow-hidden relative">
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 px-3 py-1 glass rounded-full text-xs font-bold text-accent">
                ${item.price}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleVisualize(item)}
                  className="p-4 bg-accent text-black rounded-full hover:scale-110 transition-transform"
                >
                  <Camera size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-accent uppercase tracking-widest mb-2">{item.category}</p>
              <h3 className="text-lg font-bold mb-2">{item.name}</h3>
              <p className="text-sm text-white/50 mb-6 line-clamp-2">{item.description}</p>
              
              <button
                onClick={() => handleBook(item)}
                className={cn(
                  "w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all",
                  bookingStatus === item.id 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white/5 text-white hover:bg-accent hover:text-black"
                )}
              >
                {bookingStatus === item.id ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Booked</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Book Now</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
