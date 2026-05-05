"use client";

import React, { useState } from 'react';
import Link from "next/link";

export default function Tracking() {
  const [resi, setResi] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const stages = [
    { name: "Pesanan Dibuat", icon: "fa-file-invoice" },
    { name: "Menunggu Pickup", icon: "fa-motorcycle" },
    { name: "Tiba di Lab (Mencuci)", icon: "fa-hands-bubbles" },
    { name: "Repaint/Finishing", icon: "fa-spray-can-sparkles" },
    { name: "Dalam Perjalanan Pengiriman", icon: "fa-truck-fast" },
    { name: "Selesai", icon: "fa-box-open" }
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const searchResi = resi.trim().toUpperCase();
    if (!searchResi) return;

    setIsSearching(true);
    setErrorMsg(null);
    setOrderData(null);

    try {
      const response = await fetch(`/api/orders/${searchResi}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      } else if (response.status === 404) {
        setErrorMsg("Resi tidak ditemukan. Periksa kembali kode Anda.");
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi ke database gagal.");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = stages.findIndex(s => s.name === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-montserrat">
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="font-bebas text-2xl text-slate-800 tracking-wider">
            <Link href="/">Ninetynine <span className="text-primary">Shoe</span></Link>
          </div>
          <div>
            <Link href="/order" className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
              Pesan Antar
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 px-4 max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bebas tracking-wide text-slate-800">LACAK PESANAN</h1>
          <p className="text-slate-500 font-medium">Masukkan kode resi (NS-XXXX) untuk melihat status sepatu Anda.</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 mb-8">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input 
              type="text" 
              value={resi}
              onChange={e => setResi(e.target.value)}
              className="w-full p-4 pl-6 pr-16 bg-slate-50 border-2 border-slate-200 rounded-full text-lg font-bebas tracking-widest uppercase focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all" 
              placeholder="NS-XXXX" 
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 bg-primary text-white w-12 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-bold text-center rounded-xl border border-red-100">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> {errorMsg}
            </div>
          )}
        </div>

        {orderData && (() => {
          const statusIndex = getStatusIndex(orderData.status);
          const percentHeight = statusIndex === 0 ? 0 : (statusIndex / (stages.length - 1)) * 100;

          return (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">STATUS SAAT INI</p>
                  <h2 className="text-2xl font-bebas text-primary tracking-wide">{orderData.status || "Pesanan Dibuat"}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">RESI</p>
                  <p className="text-xl font-bebas text-slate-800 tracking-widest">{orderData.id}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                <p className="text-sm font-bold text-slate-700 mb-2"><i className="fa-solid fa-user text-slate-300 mr-2"></i> {orderData.customer_name}</p>
                <p className="text-sm font-bold text-slate-700 mb-2"><i className="fa-solid fa-tags text-slate-300 mr-2"></i> {orderData.services_used || '-'}</p>
                <p className="text-sm font-bold text-slate-700"><i className="fa-solid fa-wallet text-slate-300 mr-2"></i> Rp {Number(orderData.total_price || 0).toLocaleString('id-ID')}</p>
              </div>

              <div className="relative pl-8 py-4">
                <div className="absolute left-11 top-8 bottom-8 w-1 bg-slate-100 rounded-full"></div>
                <div className="absolute left-11 top-8 w-1 bg-primary rounded-full transition-all duration-1000 ease-out" style={{ height: `${percentHeight}%` }}></div>

                <div className="flex flex-col gap-8 relative z-10">
                  {stages.map((stage, i) => {
                    const isCompleted = i <= statusIndex;
                    const isCurrent = i === statusIndex && i !== stages.length - 1;
                    
                    return (
                      <div key={i} className={`flex items-center gap-6 transition-all duration-500 ${!isCompleted ? 'opacity-40 grayscale' : ''}`}>
                        <div className={`indicator w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-500 bg-white ${isCurrent ? 'animate-pulse border-primary bg-primary' : isCompleted ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                          <i className={`icon fa-solid ${stage.icon} text-xl transition-colors ${isCurrent ? 'text-white' : isCompleted ? 'text-primary' : 'text-slate-400'}`}></i>
                        </div>
                        <div>
                          <p className={`font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{stage.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
