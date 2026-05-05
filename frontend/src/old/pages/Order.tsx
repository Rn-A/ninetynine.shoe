"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from '@/context/AppContext';

export default function Order() {
  const { services, user, loadingServices: loading, refreshServices: loadServices } = useAppContext();
  const router = useRouter();
  
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResi, setSuccessResi] = useState<string | null>(null);
  const [dbError, setDbError] = useState(false);

  // Require login logic
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user, router]);

  if (!user) return null;

  const handleCheckboxChange = (svcId: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(svcId)) {
      newSet.delete(svcId);
    } else {
      newSet.add(svcId);
    }
    setSelectedServices(newSet);
  };

  const currentTotal = Array.from(selectedServices).reduce((total, svcId) => {
    const svc = services.find(s => s.id === Number(svcId) || s.id === svcId);
    return total + (svc ? Number(svc.price) : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.size === 0) {
      alert("Harap pilih setidaknya satu layanan.");
      return;
    }

    const chosenNames = Array.from(selectedServices).map(id => {
      return services.find(s => s.id === Number(id) || s.id === id)?.name;
    });

    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const customResi = `NS-${randomPart}`;

    const payload = {
      id: customResi,
      user_id: user.id || null, // attach the logged in user
      customer_name: formData.name,
      phone: formData.phone,
      address: formData.address,
      services_used: chosenNames.join(", "),
      total_price: currentTotal,
      status: "Pesanan Dibuat",
    };

    setIsSubmitting(true);
    setDbError(false);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error("Gagal menyimpan ke database");
      
      setSuccessResi(customResi);
      setFormData({ name: user.name, phone: '', address: '' });
      setSelectedServices(new Set());
    } catch (err) {
      console.error(err);
      setDbError(true);
      // Removed browser alert to soften error handling as requested
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-montserrat">
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="font-bebas text-2xl text-slate-800 tracking-wider">
            <Link href="/">Ninetynine <span className="text-primary">Shoe</span></Link>
          </div>
          <div>
            <Link href="/my-orders" className="border-2 border-slate-800 text-slate-800 px-4 py-2 rounded-full font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors">
              <i className="fa-solid fa-box-open mr-1"></i> Pesanan Saya
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 px-4 max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bebas tracking-wide text-slate-800">BUAT PESANAN BARU</h1>
          <p className="text-slate-500 font-medium">Isi detail pesanan dan pilih layanan yang Anda butuhkan.</p>
        </div>

        {dbError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl shadow-sm">
            <div className="flex items-center">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl mr-3"></i>
              <div>
                <p className="font-bold text-red-800">Gagal Terhubung ke Database</p>
                <p className="text-sm text-red-600">Terjadi kesalahan pada server saat membuat pesanan.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-user text-primary"></i> Data Pelanggan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Nama Lengkap</label>
                <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Contoh: Budi Santoso" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Nomor WhatsApp</label>
                <input type="tel" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Contoh: 08123456789" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-600 mb-1">Alamat Penjemputan / Pengiriman</label>
                <textarea required rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Detail alamat lengkap..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-spray-can-sparkles text-primary"></i> Pilih Layanan
              </h2>
              <button type="button" onClick={loadServices} className="text-xs font-bold text-primary hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-rotate-right"></i> Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loading ? (
                <div className="col-span-full py-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 font-bold"><i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br/>Memuat Layanan...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 font-bold mb-2"><i className="fa-solid fa-box-open text-2xl"></i></p>
                  <p className="text-sm text-slate-500">Belum ada layanan yang tersedia.<br/>Pemilik dapat mendaftarkan layanan melalui menu Admin.</p>
                </div>
              ) : (
                services.map(svc => (
                  <label key={svc.id} className="flex items-start gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-slate-50">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" checked={selectedServices.has(svc.id)} onChange={() => handleCheckboxChange(svc.id)} />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">{svc.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 mb-1 tracking-wider">{svc.category || 'Treatment'}</p>
                      <p className="text-sm font-bold text-primary">Rp {Number(svc.price).toLocaleString('id-ID')}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-6 mb-6">
            <div className="flex justify-between items-center bg-slate-800 text-white p-4 rounded-xl">
              <span className="font-bold">Total Estimasi:</span>
              <span className="text-2xl font-bebas tracking-wider text-primary">Rp {currentTotal.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">*Harga dapat berubah sesuai kondisi barang saat pengecekan fisik.</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-primary text-lg py-4 shadow-lg shadow-primary/30 flex justify-center items-center gap-2">
            {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Menyimpan Pesanan...</> : 'Buat Pesanan & Dapatkan Resi'}
          </button>
        </form>
      </div>

      {successResi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-check text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bebas tracking-wide text-slate-800 mb-2">PESANAN BERHASIL!</h3>
            <p className="text-slate-500 mb-6 font-medium">Simpan kode resi di bawah ini untuk melacak status pesanan Anda.</p>
            
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 p-4 rounded-xl mb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">KODE RESI ANDA</p>
              <p className="text-3xl font-bebas tracking-widest text-primary">{successResi}</p>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href={`https://wa.me/6281234567890?text=Halo%20Ninetynine%20Shoe,%20saya%20baru%20saja%20membuat%20pesanan%20dengan%20nomor%20resi:%20*${successResi}*.%20Mohon%20info%20selanjutnya.`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i> Kirim ke WhatsApp
              </a>
              <Link href="/tracking" className="btn-primary w-full">Lacak Pesanan Sekarang</Link>
              <button onClick={() => setSuccessResi(null)} className="btn-outline w-full">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
