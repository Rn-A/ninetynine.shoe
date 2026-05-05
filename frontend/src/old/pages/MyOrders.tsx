"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from '@/context/AppContext';

export default function MyOrders() {
  const { user, setUser } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stages = [
    { name: "Pesanan Dibuat", icon: "fa-file-invoice" },
    { name: "Menunggu Pickup", icon: "fa-motorcycle" },
    { name: "Tiba di Lab (Mencuci)", icon: "fa-hands-bubbles" },
    { name: "Repaint/Finishing", icon: "fa-spray-can-sparkles" },
    { name: "Dalam Perjalanan Pengiriman", icon: "fa-truck-fast" },
    { name: "Selesai", icon: "fa-box-open" }
  ];

  const getStatusIndex = (status: string) => {
    const idx = stages.findIndex(s => s.name === status);
    return idx >= 0 ? idx : 0;
  };

  useEffect(() => {
    // If not logged in, redirect to auth
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched orders:", data);
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (!user) return null;

  const activeOrders = orders.filter(o => o.status !== 'Selesai');
  const historyOrders = orders.filter(o => o.status === 'Selesai');
  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-montserrat">
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="font-bebas text-2xl text-slate-800 tracking-wider">
            <Link href="/">Ninetynine <span className="text-primary">Shoe</span></Link>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Pelanggan</span>
              <span className="text-sm font-bold text-slate-700">{user.name}</span>
            </div>
            <Link href="/order" className="bg-primary text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md">
              <i className="fa-solid fa-plus mr-1"></i> Pesanan Baru
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 px-4 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-5xl font-bebas tracking-wide text-slate-800 mb-2">PESANAN SAYA</h1>
            <p className="text-slate-500 font-medium max-w-md">Lacak status pengerjaan sepatu Anda secara real-time dari laboratorium kami.</p>
          </div>
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
             <button onClick={() => setUser(null)} className="text-slate-400 hover:text-red-500 text-xs font-bold transition-colors uppercase tracking-widest px-2 py-1">
               <i className="fa-solid fa-right-from-bracket mr-1"></i> Logout Sesi
             </button>
             {/* Tabs Toggle */}
             <div className="flex bg-slate-200 p-1 rounded-xl w-full md:w-auto">
               <button 
                onClick={() => setActiveTab('active')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Aktif ({activeOrders.length})
               </button>
               <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Riwayat ({historyOrders.length})
               </button>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-32 text-slate-300">
            <i className="fa-solid fa-spinner fa-spin text-5xl mb-6 block"></i>
            <p className="font-bebas text-xl tracking-widest animate-pulse">MEMUAT DATA...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border-4 border-slate-50 shadow-inner">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <h3 className="text-3xl font-bebas text-slate-800 mb-3 tracking-wide">
              {activeTab === 'active' ? 'TIDAK ADA PESANAN AKTIF' : 'RIWAYAT MASIH KOSONG'}
            </h3>
            <p className="text-slate-400 mb-10 max-w-xs mx-auto font-medium">
              {activeTab === 'active' 
                ? 'Semua sepatu Anda sudah bersih atau Anda belum melakukan pemesanan baru.' 
                : 'Anda belum memiliki riwayat pesanan yang telah selesai pengerjaannya.'}
            </p>
            <Link href="/order" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/40 hover:bg-blue-700 transition-all hover:-translate-y-1">
              Buat Pesanan Baru
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {displayedOrders.map(order => {
              const statusIndex = getStatusIndex(order.status);
              const percentHeight = statusIndex === 0 ? 0 : (statusIndex / (stages.length - 1)) * 100;
              const formattedDate = order.date 
                ? new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Tanggal tidak tersedia';

              return (
                <div key={order.id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden group">
                  {activeTab === 'history' && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-green-500 text-white text-[10px] font-bold px-8 py-1 rotate-45 translate-x-6 translate-y-2 uppercase tracking-widest shadow-sm">DONE</div>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-10">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                        <i className="fa-solid fa-box-tissue"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Resi</span>
                          <span className="text-[10px] font-bold text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formattedDate}</span>
                        </div>
                        <strong className="text-3xl font-bebas tracking-widest text-slate-800">{order.id}</strong>
                      </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100/50 flex flex-col items-start md:items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Layanan yang Dipilih</span>
                      <strong className="text-slate-700 text-lg">{order.services_used}</strong>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-microscope text-primary"></i> Progress Pengerjaan
                      </h4>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 uppercase tracking-widest animate-pulse">
                        {order.status}
                      </span>
                    </div>

                    <div className="relative mb-4 px-2">
                      <div className="flex justify-between relative z-10 transition-all duration-700">
                        {stages.map((stage, idx) => (
                          <div key={stage.name} className="flex flex-col items-center group relative w-1/6">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-md z-10 border-2 ${idx <= statusIndex ? 'bg-primary text-white border-primary shadow-primary/30 scale-110' : 'bg-white text-slate-300 border-slate-100 group-hover:border-primary/30'}`}>
                              <i className={`fa-solid ${stage.icon} text-sm`}></i>
                            </div>
                            <div className="absolute top-12 w-24 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg z-50">
                              {stage.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute top-5 left-0 w-full h-1.5 bg-slate-100 -z-0 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 ease-in-out relative"
                          style={{ width: `${percentHeight}%` }}
                        >
                          <div className="absolute top-0 right-0 w-2 h-full bg-white/40 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* PC visible labels */}
                    <div className="hidden sm:flex justify-between mt-8 px-0">
                      {stages.map((stage, idx) => (
                        <div key={stage.name} className="w-1/6 text-center">
                          <span className={`text-[9px] font-bold transition-colors block leading-tight px-1 uppercase tracking-tighter ${idx <= statusIndex ? 'text-primary' : 'text-slate-300'}`}>
                            {stage.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 p-6 rounded-2xl mt-4 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                      <div className="flex flex-wrap gap-4 p-2 font-bebas text-4xl">Ninetynine Ninetynine Ninetynine</div>
                    </div>
                    <div className="flex items-center gap-4 mb-4 sm:mb-0 relative z-10">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                        <i className="fa-solid fa-wallet"></i>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Pembayaran</span>
                        <span className="text-xl font-bebas tracking-wider text-white">Rp {(order.total_price || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <Link href={`/tracking?resi=${order.id}`} className="relative z-10 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                       Detail Tracking <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

