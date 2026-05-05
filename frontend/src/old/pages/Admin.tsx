"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { useAppContext } from '@/context/AppContext';

export default function Admin() {
  const { user, setUser, loadingUser, refreshServices } = useAppContext();
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'cms'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', category: '', price: '', description: '' });

  // CMS State
  const [cmsTestimonials, setCmsTestimonials] = useState<any[]>([]);
  const [cmsShowcase, setCmsShowcase] = useState<any[]>([]);
  const [testiModalOpen, setTestiModalOpen] = useState(false);
  const [currentTesti, setCurrentTesti] = useState<any>(null);
  const [testiForm, setTestiForm] = useState({ name: '', location: '', rating: '5', text: '', sort_order: '0' });
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [currentShowcase, setCurrentShowcase] = useState<any>(null);
  const [showcaseForm, setShowcaseForm] = useState({ label: '', icon: 'fa-shoe-prints', media_url: '', media_type: 'video', sort_order: '0' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/uploads/') ? `http://127.0.0.1:5001${url}` : url;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const mediaType = file.type.startsWith('video') ? 'video' : 'image';
        setShowcaseForm(prev => ({ ...prev, media_url: data.url, media_type: mediaType }));
      } else {
        alert('Upload gagal. Coba lagi.');
      }
    } catch (e) {
      alert('Upload gagal. Pastikan backend berjalan.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setServices([]);
      return;
    }

    const fetchData = async () => {
      try {
        const ordRes = await fetch('/api/orders');
        const svcRes = await fetch('/api/services');
        const ords = await ordRes.json();
        const svcs = await svcRes.json();

        setOrders(ords);
        setServices(svcs);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
    loadCms();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      setOrders(await res.json());
    } catch (e) { }
  };

  const loadCms = async () => {
    try {
      const [tr, sr] = await Promise.all([fetch('/api/testimonials'), fetch('/api/showcase')]);
      if (tr.ok) setCmsTestimonials(await tr.json());
      if (sr.ok) setCmsShowcase(await sr.json());
    } catch (e) { }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...data.user, token: data.token });
      } else {
        const error = await res.json();
        console.error("Login fail:", error.error);
        alert(error.error || "Login gagal. Periksa kembali username dan password Anda.");
      }
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Gagal terhubung ke server. Pastikan backend berjalan di port 5001.");
    }
  };

  const handleLogout = async () => {
    setUser(null);
  };

  const openStatusModal = (order: any) => {
    setCurrentOrder(order);
    setStatusModalOpen(true);
  };

  const updateOrderStatus = async (status: string) => {
    if (!currentOrder) return;
    try {
      await fetch(`/api/orders/${currentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setStatusModalOpen(false);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Gagal update status");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Hapus pesanan ini?")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus pesanan");
    }
  };

  const openServiceModal = (service: any = null) => {
    setCurrentService(service);
    if (service) {
      setServiceForm({
        name: service.name,
        category: service.category,
        price: service.price.toString(),
        description: service.description || ''
      });
    } else {
      setServiceForm({ name: '', category: '', price: '', description: '' });
    }
    setServiceModalOpen(true);
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: serviceForm.name,
      category: serviceForm.category,
      price: Number(serviceForm.price),
      description: serviceForm.description
    };

    try {
      if (currentService) {
        await fetch(`/api/services/${currentService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`/api/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setServiceModalOpen(false);
      refreshServices();
      // Reload local service state safely
      const svcRes = await fetch('/api/services');
      setServices(await svcRes.json());
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan layanan");
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("Hapus layanan ini?")) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      refreshServices();
      const svcRes = await fetch('/api/services');
      setServices(await svcRes.json());
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus layanan");
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Selesai' && o.status !== 'Diambil').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  return (
    <div className="admin-page bg-slate-50 min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="text-2xl font-bebas tracking-widest text-white">Ninetynine <span className="text-primary">Shoe</span></Link>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Admin Portal</p>
        </div>

        <div className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 font-bold ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <i className="fa-solid fa-list-check"></i> Pesanan Masuk
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 font-bold ${activeTab === 'services' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <i className="fa-solid fa-tags"></i> Manajemen Layanan
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('cms'); loadCms(); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 font-bold ${activeTab === 'cms' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <i className="fa-solid fa-photo-film"></i> CMS Konten
              </button>
            </li>
          </ul>
        </div>

        <div className="p-4 border-t border-slate-800">
          {user ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={"https://ui-avatars.com/api/?name=Admin"} alt="Admin" className="w-10 h-10 rounded-full border-2 border-slate-700" />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.name || 'Admin'}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-bold transition-colors">
                <i className="fa-solid fa-right-from-bracket mr-2"></i> Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-2">
              <input type="text" placeholder="Username" required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
              <input type="password" placeholder="Password" required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              <button type="submit" className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors mt-2">
                <i className="fa-solid fa-right-to-bracket mr-2"></i> Login Admin
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {user && activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-box"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Total Pesanan</p>
                <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Pesanan Aktif</p>
                <p className="text-2xl font-bold text-slate-800">{pendingOrders}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Total Pendapatan</p>
                <p className="text-2xl font-bold text-slate-800">Rp {totalRevenue.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bebas tracking-wide text-slate-800">
            {activeTab === 'orders' ? 'PESANAN MASUK' : activeTab === 'services' ? 'MANAJEMEN LAYANAN' : 'CMS KONTEN'}
          </h1>
          {activeTab === 'services' && user && (
            <button onClick={() => openServiceModal()} className="btn-primary py-2 px-4 text-sm">
              <i className="fa-solid fa-plus mr-2"></i> Tambah Layanan
            </button>
          )}
        </div>

        {!user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-lock text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Dibatasi</h2>
            <p className="text-slate-500 mb-6">Silakan login menggunakan akun Google Admin untuk melihat data.</p>
            <button onClick={handleLogin} className="btn-primary">
              <i className="fa-brands fa-google mr-2"></i> Login Sekarang
            </button>
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                        <th className="p-4 font-bold">Tanggal & Resi</th>
                        <th className="p-4 font-bold">Pelanggan</th>
                        <th className="p-4 font-bold">Layanan</th>
                        <th className="p-4 font-bold">Total</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">Belum ada pesanan.</td>
                        </tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <p className="text-xs text-slate-400 mb-1">{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              <p className="font-bebas text-lg text-primary tracking-widest">{order.id}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-800">{order.customer_name}</p>
                              <p className="text-xs text-slate-500"><i className="fa-brands fa-whatsapp text-green-500"></i> {order.phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-slate-600 max-w-[200px] truncate" title={order.services_used}>{order.services_used}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-800">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => openStatusModal(order)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-colors mr-2" title="Update Status">
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button onClick={() => deleteOrder(order.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition-colors" title="Hapus Pesanan">
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CMS Tab */}
            {activeTab === 'cms' && (
              <div className="space-y-10">
                {/* === Testimonials === */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800"><i className="fa-solid fa-quote-left text-primary mr-2"></i>Testimonial Pelanggan</h2>
                    <button
                      onClick={() => { setCurrentTesti(null); setTestiForm({ name: '', location: '', rating: '5', text: '', sort_order: '0' }); setTestiModalOpen(true); }}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      <i className="fa-solid fa-plus mr-2"></i> Tambah
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cmsTestimonials.map(t => (
                      <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-800">{t.name}</p>
                            <p className="text-xs text-slate-400">{t.location}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setCurrentTesti(t); setTestiForm({ name: t.name, location: t.location, rating: String(t.rating), text: t.text, sort_order: String(t.sort_order) }); setTestiModalOpen(true); }} className="text-slate-400 hover:text-primary transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                            <button onClick={async () => { if (confirm('Hapus?')) { await fetch(`/api/testimonials/${t.id}`, { method: 'DELETE' }); loadCms(); } }} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <div className="flex text-yellow-400 text-xs mb-2">{Array.from({ length: t.rating }, (_, i) => <i key={i} className="fa-solid fa-star"></i>)}</div>
                        <p className="text-sm text-slate-500 italic line-clamp-3">{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* === Showcase === */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800"><i className="fa-solid fa-photo-film text-primary mr-2"></i>Showcase Video / Gambar</h2>
                    <button
                      onClick={() => { setCurrentShowcase(null); setShowcaseForm({ label: '', icon: 'fa-shoe-prints', media_url: '', media_type: 'video', sort_order: '0' }); setShowcaseModalOpen(true); }}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      <i className="fa-solid fa-plus mr-2"></i> Tambah
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cmsShowcase.map(s => (
                      <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-36 bg-slate-100 relative overflow-hidden">
                          {s.media_type === 'video'
                            ? <video src={getMediaUrl(s.media_url)} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                            : <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${getMediaUrl(s.media_url)}')` }} />
                          }
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold uppercase">{s.media_type}</span>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800"><i className={`fa-solid ${s.icon} text-primary mr-2`}></i>{s.label}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[160px]" title={s.media_url}>{s.media_url}</p>
                          </div>
                          <div className="flex gap-2 ml-2 shrink-0">
                            <button onClick={() => { setCurrentShowcase(s); setShowcaseForm({ label: s.label, icon: s.icon, media_url: s.media_url, media_type: s.media_type, sort_order: String(s.sort_order) }); setShowcaseModalOpen(true); }} className="text-slate-400 hover:text-primary transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                            <button onClick={async () => { if (confirm('Hapus?')) { await fetch(`/api/showcase/${s.id}`, { method: 'DELETE' }); loadCms(); } }} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Belum ada layanan.</div>
                ) : (
                  services.map(svc => (
                    <div key={svc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">{svc.category}</span>
                        <div className="flex gap-2">
                          <button onClick={() => openServiceModal(svc)} className="text-slate-400 hover:text-primary transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                          <button onClick={() => deleteService(svc.id)} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{svc.name}</h3>
                      <p className="text-xs text-slate-500 mb-4 flex-1">{svc.description}</p>
                      <p className="font-bold text-slate-800 text-xl">Rp {Number(svc.price).toLocaleString('id-ID')}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Testimonial Modal */}
      {testiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{currentTesti ? 'Edit Testimonial' : 'Tambah Testimonial'}</h3>
              <button onClick={() => setTestiModalOpen(false)} className="text-slate-400 hover:text-slate-800"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const payload = { ...testiForm, rating: Number(testiForm.rating), sort_order: Number(testiForm.sort_order) };
              if (currentTesti) {
                await fetch(`/api/testimonials/${currentTesti.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              } else {
                await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              }
              setTestiModalOpen(false);
              loadCms();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Nama</label>
                    <input required value={testiForm.name} onChange={e => setTestiForm({ ...testiForm, name: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Lokasi</label>
                    <input value={testiForm.location} onChange={e => setTestiForm({ ...testiForm, location: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Rating (1-5)</label>
                  <select value={testiForm.rating} onChange={e => setTestiForm({ ...testiForm, rating: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none">
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Teks Ulasan</label>
                  <textarea required rows={4} value={testiForm.text} onChange={e => setTestiForm({ ...testiForm, text: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Urutan</label>
                  <input type="number" value={testiForm.sort_order} onChange={e => setTestiForm({ ...testiForm, sort_order: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setTestiModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Showcase Modal */}
      {showcaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{currentShowcase ? 'Edit Showcase' : 'Tambah Showcase'}</h3>
              <button onClick={() => setShowcaseModalOpen(false)} className="text-slate-400 hover:text-slate-800"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const payload = { ...showcaseForm, sort_order: Number(showcaseForm.sort_order) };
              if (currentShowcase) {
                await fetch(`/api/showcase/${currentShowcase.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              } else {
                await fetch('/api/showcase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              }
              setShowcaseModalOpen(false);
              loadCms();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Label</label>
                    <input required value={showcaseForm.label} onChange={e => setShowcaseForm({ ...showcaseForm, label: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Deep Clean" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Icon (FontAwesome)</label>
                    <input value={showcaseForm.icon} onChange={e => setShowcaseForm({ ...showcaseForm, icon: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="fa-shoe-prints" />
                  </div>
                </div>
                {/* Upload Area */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">
                    <i className="fa-solid fa-cloud-arrow-up text-primary mr-2"></i>Upload File Lokal
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]); }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isUploading ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary hover:bg-slate-50'}`}
                  >
                    {isUploading ? (
                      <div className="text-primary">
                        <i className="fa-solid fa-spinner fa-spin text-3xl mb-2 block"></i>
                        <p className="font-bold text-sm">Sedang mengupload...</p>
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <i className="fa-solid fa-photo-film text-3xl mb-2 block"></i>
                        <p className="font-bold text-sm">Klik atau drag &amp; drop file di sini</p>
                        <p className="text-xs mt-1">MP4, WebM, JPG, PNG, GIF (maks 100MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    <i className="fa-solid fa-link text-slate-400 mr-2"></i>Atau Gunakan URL Eksternal
                  </label>
                  <input
                    value={showcaseForm.media_url}
                    onChange={e => setShowcaseForm({ ...showcaseForm, media_url: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    placeholder="https://... (Pexels, Coverr, dll)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Tipe Media</label>
                    <select value={showcaseForm.media_type} onChange={e => setShowcaseForm({ ...showcaseForm, media_type: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none">
                      <option value="video">🎬 Video</option>
                      <option value="image">🖼 Gambar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Urutan</label>
                    <input type="number" value={showcaseForm.sort_order} onChange={e => setShowcaseForm({ ...showcaseForm, sort_order: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>

                {showcaseForm.media_url && (
                  <div className="rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200">
                    {showcaseForm.media_type === 'video'
                          ? <video src={getMediaUrl(showcaseForm.media_url)} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                          : <div className="w-full h-full bg-cover bg-center" style={{backgroundImage:`url('${getMediaUrl(showcaseForm.media_url)}')`}} />
                    }
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowcaseModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {statusModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Update Status</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-800"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Resi: <strong className="text-primary">{currentOrder.id}</strong></p>

            <div className="flex flex-col gap-2">
              {["Pesanan Dibuat", "Menunggu Pickup", "Tiba di Lab (Mencuci)", "Repaint/Finishing", "Dalam Perjalanan Pengiriman", "Selesai"].map(status => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(status)}
                  className={`p-3 rounded-xl text-left font-bold text-sm transition-colors border ${currentOrder.status === status ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/50'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{currentService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-slate-800"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <form onSubmit={saveService}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Nama Layanan</label>
                  <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Contoh: Deep Clean Premium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Kategori</label>
                    <select required value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none">
                      <option value="">Pilih Kategori</option>
                      <option value="Paket pekat">Paket pekat</option>
                      <option value="Ladies care">Ladies care</option>
                      <option value="suede care">suede care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Harga (Rp)</label>
                    <input type="number" required min="0" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="35000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Deskripsi Singkat</label>
                  <input type="text" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Contoh: 2-3 Hari Jadi" />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setServiceModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
