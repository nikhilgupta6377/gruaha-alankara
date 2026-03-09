import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout, Clock, ShoppingBag, History, ChevronRight, ExternalLink } from 'lucide-react';

import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function DashboardPage() {
  const [data, setData] = useState({ bookings: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    setUser(auth.currentUser);

    // Listen to bookings
    const qBookings = query(
      collection(db, 'bookings'), 
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(prev => ({ ...prev, bookings }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    // Listen to history
    const qHistory = query(
      collection(db, 'history'), 
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(prev => ({ ...prev, history }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'history');
    });

    return () => {
      unsubscribeBookings();
      unsubscribeHistory();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">Welcome Back, {user?.displayName || 'Designer'}</h1>
        <p className="text-white/50 text-sm sm:text-base">Manage your designs and furniture bookings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                <ShoppingBag size={24} />
              </div>
              <p className="text-3xl font-bold mb-1">{data.bookings.length}</p>
              <p className="text-sm text-white/40 uppercase tracking-widest">Active Bookings</p>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                <History size={24} />
              </div>
              <p className="text-3xl font-bold mb-1">{data.history.length}</p>
              <p className="text-sm text-white/40 uppercase tracking-widest">Design Projects</p>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold">Recent Bookings</h3>
              <button className="text-xs text-accent hover:underline">View All</button>
            </div>
            <div className="divide-y divide-white/5">
              {data.bookings.length > 0 ? (
                data.bookings.map((booking) => (
                  <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-accent">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{booking.furnitureName}</p>
                        <p className="text-xs text-white/40">
                          {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${booking.price}</p>
                      <p className={cn(
                        "text-[10px] uppercase tracking-widest font-bold",
                        booking.status === 'confirmed' ? "text-emerald-500" : "text-amber-500"
                      )}>{booking.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-white/30">No bookings yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl border border-white/5">
            <h3 className="font-bold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'New Design Project', icon: ChevronRight, link: '/upload' },
                { label: 'Browse New Furniture', icon: ChevronRight, link: '/booking' },
                { label: 'Contact Support', icon: ExternalLink, link: '#' },
              ].map((action, i) => (
                <a 
                  key={i} 
                  href={action.link}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-black transition-all group"
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  <action.icon size={16} className="text-white/30 group-hover:text-black" />
                </a>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 bg-accent/5">
            <h3 className="font-bold mb-4">Design Tip</h3>
            <p className="text-sm text-white/60 leading-relaxed italic">
              "Try mixing textures like velvet and wood to create a sophisticated, layered look in your living room."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
