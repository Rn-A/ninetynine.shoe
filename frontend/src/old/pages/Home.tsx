"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const { user, categories: services, loadingServices: loading } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<any[]>([]);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/uploads/') ? `http://127.0.0.1:5001${url}` : url;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCmsData = () => {
      fetch('/api/testimonials').then(r => r.ok ? r.json() : []).then(setTestimonials).catch(() => { });
      fetch('/api/showcase').then(r => r.ok ? r.json() : []).then(setShowcaseItems).catch(() => { });
    };

    // Fetch immediately when page loads
    fetchCmsData();

    // Re-fetch when user switches BACK to this browser tab (e.g. from admin tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCmsData();
    };

    // Re-fetch when user returns from another app to browser
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchCmsData);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchCmsData);
    };
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-montserrat">

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative flex justify-between items-center px-6 py-3 rounded-2xl transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/20' : 'bg-transparent'}`}>
            <div className="font-bebas text-3xl tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <Link href="/" className="flex items-center">
                <span className="text-slate-900">NINETYNINE</span>
                <span className="text-primary ml-1.5">SHOE</span>
              </Link>
            </div>

            <ul className="hidden lg:flex gap-10 items-center">
              {['About', 'Services', 'Testimonials', 'Location'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-primary transition-all relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden lg:flex items-center gap-6">
              {!user && (
                <Link href="/tracking" className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-primary transition-all">
                  Track Order
                </Link>
              )}
              <Link
                href="/order"
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10"
              >
                BOOK NOW
              </Link>
            </div>

            <button
              className="lg:hidden text-2xl text-slate-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i>
            </button>
          </div>
        </div>
      </nav>


      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)}>
        <div
          className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-10 shadow-2xl transition-transform duration-500 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-8 mt-12">
            {['About', 'Services', 'Testimonials', 'Location'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-2xl font-bebas tracking-wide text-slate-900 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="h-px bg-slate-100 my-4" />
            {user ? (
              <Link href={user.role === 'admin' ? "/admin" : "/my-orders"} className="text-xl font-bold text-slate-900">
                {user.role === 'admin' ? "Admin Dashboard" : "My Orders"}
              </Link>
            ) : (
              <Link href="/auth" className="text-xl font-bold text-slate-900">Login / Register</Link>
            )}
            <Link href="/order" className="bg-primary text-white py-4 rounded-2xl font-bold text-center text-lg shadow-lg shadow-primary/20">BOOK NOW</Link>
          </div>
        </div>
      </div>


      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -z-10 rounded-l-[100px] hidden lg:block" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Premium Shoe Care in Indonesia
            </div>
            <h1 className="font-bebas text-7xl sm:text-8xl md:text-9xl text-slate-900 leading-[0.85] mb-8">
              EVERYDAY<br />
              <span className="text-primary relative inline-block">
                CLEAN DAY.
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 400 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C100 2 300 2 397 9" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-slate-500 text-xl mb-12 max-w-xl leading-relaxed">
              Experience the pioneer of <span className="font-bold text-slate-900 text-lg">&quot;Cleaning while Sleeping&quot;</span>.
              Professional deep clean service that brings your favorite kicks back to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/order" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Pesan Antar Sekarang
              </Link>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] aspect-[4/5] lg:aspect-square">
              <img
                src="/uploads/Banner.png"
                alt="Premium Shoe Care"
                className="w-full h-full object-cover transform scale-110 hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`/uploads/profile${i}.png`} alt="Client" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold">5,000+ Happy Kicks</div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>


      <div className="w-full bg-slate-900 text-white py-6 overflow-hidden transform -rotate-1 origin-center scale-105 z-20 shadow-2xl shadow-slate-900/20">
        <div className="flex animate-marquee whitespace-nowrap font-bebas tracking-[0.2em] text-2xl w-max uppercase italic opacity-90">
          <span className="px-12">• Premium Deep Clean • Express Service • Pick Up & Delivery • Best in Cilacap • Trusted by Sneakershead • </span>
          <span className="px-12">• Premium Deep Clean • Express Service • Pick Up & Delivery • Best in Cilacap • Trusted by Sneakershead • </span>
          <span className="px-12">• Premium Deep Clean • Express Service • Pick Up & Delivery • Best in Cilacap • Trusted by Sneakershead • </span>
        </div>
      </div>



      <section className="max-w-5xl mx-auto mt-12 mb-20 px-4 flex flex-col md:flex-row justify-center gap-6 relative z-20">
        {showcaseItems.map((item, idx) => (
          <div
            key={item.id}
            className={`w-full md:w-1/3 h-80 rounded-3xl shadow-lg relative overflow-hidden group transition-transform hover:-translate-y-2 ${idx === 1 ? 'md:translate-y-6' : ''}`}
          >
            {item.media_type === 'video' ? (
              <video
                className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                src={getMediaUrl(item.media_url)}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-700"
                style={{ backgroundImage: `url('${getMediaUrl(item.media_url)}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-white font-bold text-sm tracking-wider uppercase drop-shadow-md">
                <i className={`fa-solid ${item.icon} mr-2 text-primary`}></i>{item.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Advantages */}
      <section id="about" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bebas text-center text-slate-800 mb-2">KEUNGGULAN Ninetynine <span className="text-primary">Shoe</span></h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors group-hover:scale-110 group-hover:rotate-6">
              <i className="fa-solid fa-bed"></i>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">Tiduran Sambil Cuci Sepatu</h3>
            <p className="text-slate-500">Pencetus cuci sepatu sambil tiduran pertama di Indonesia! Anda rebahan, sepatu kesayangan bersih maksimal.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors group-hover:scale-110 group-hover:rotate-6">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">Express Service</h3>
            <p className="text-slate-500">Pengerjaan kilat dan hasil profesional untuk Anda yang butuh cepat menjaga penampilan terbaik.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors group-hover:scale-110 group-hover:rotate-6">
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">Pick Up & Delivery</h3>
            <p className="text-slate-500">Antar jemput ke lokasi Anda di wilayah Cilacap dan Purwokerto. Tak perlu repot keluar rumah.</p>
          </div>
        </div>
      </section>

      {/* Loved Banner */}
      <section className="w-full py-40 px-4 text-center relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/uploads/Favorite.jpg')" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bebas text-[10vw] text-white/5 whitespace-nowrap pointer-events-none uppercase tracking-tighter">FAVORITE KICKS</div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bebas text-white mb-8 leading-tight">
            LOVED BY YOUR<br />
            <span className="text-primary italic drop-shadow-[0_2px_10px_rgba(37,99,235,0.5)]">FAVORITE KICKS.</span>
          </h2>
          <a href="https://wa.me/6287720603708" className="inline-block border-2 border-white text-white px-10 py-4 rounded-full font-bebas tracking-widest text-xl hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:-translate-y-1">
            Hubungi Ninetynine Shoe
          </a>
        </div>
      </section>

      {/* Pricelist */}
      <section id="shoes" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-primary pb-4 mb-12">
          <h2 className="text-5xl md:text-6xl font-bebas text-slate-800 leading-none">SHOES<br /><span className="text-primary">TREATMENT</span></h2>
          <p className="text-slate-400 font-semibold italic text-lg mt-4 md:mt-0">Bersih Menyeluruh & Higienis</p>
        </div>

        <div className="flex flex-col gap-12">
          {loading ? (
            <div className="py-10 text-center text-slate-400 w-full font-medium">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Memuat katalog layanan...
            </div>
          ) : Object.keys(services).length === 0 ? (
            <div className="py-10 text-center text-slate-400 w-full font-medium">
              Belum ada layanan yang tersedia.
            </div>
          ) : (
            Object.entries(services).map(([catName, svcs]: [string, any]) => (
              <div key={catName} className="w-full">
                <div className="inline-block bg-slate-800 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">{catName}</div>
                <div className="grid grid-cols-1 gap-4">
                  {svcs.map((svc: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md hover:border-l-4 hover:border-l-primary transition-all gap-4">
                      <div>
                        <strong className="block text-lg text-slate-800">{svc.name}</strong>
                        <span className="text-sm text-slate-500">{svc.description || ''}</span>
                      </div>
                      <div className="bg-blue-50 text-primary font-bebas text-2xl px-4 py-1 rounded-xl self-start sm:self-auto whitespace-nowrap">
                        {(svc.price / 1000)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>



      <section id="another" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bebas text-center text-slate-800 mb-2">LAYANAN LAINNYA</h2>
        <p className="text-center text-slate-500 font-medium mb-12">Bukan Sekadar Sepatu</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-motorcycle text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">CUCI HELM</h3>
            <p className="font-bebas text-3xl text-primary mb-2">35K</p>
            <span className="text-xs text-slate-500">Higienis & Bebas Bakteri</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-suitcase-rolling text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">TAS CARRIER / KOPER</h3>
            <p className="font-bebas text-3xl text-primary mb-2">55K</p>
            <span className="text-xs text-slate-500">Berbagai Ukuran</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-baby-carriage text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">STROLLER / CARSEAT</h3>
            <p className="font-bebas text-3xl text-primary mb-2">55K</p>
            <span className="text-xs text-slate-500">Pembersihan Ramah Bayi</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-briefcase text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">TAS BIASA / KULIT</h3>
            <p className="font-bebas text-3xl text-primary mb-2">35K-40K</p>
            <span className="text-xs text-slate-500">Perawatan Menyeluruh</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-wallet text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">TOPI / DOMPET</h3>
            <p className="font-bebas text-3xl text-primary mb-2">25K</p>
            <span className="text-xs text-slate-500">Kembali Bersih Terawat</span>
          </div>
        </div>
      </section>
      */}


      <section id="testimonials" className="py-20 px-4 bg-slate-900 text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/uploads/Favorite.jpg')" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bebas tracking-wide mb-4">KATA <span className="text-primary">MEREKA</span></h2>
            <p className="text-slate-400 font-medium">Ribuan pasang sepatu telah kami selamatkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => {
              const stars = Number(t.rating) || 5;
              return (
                <div key={t.id} className="p-8 rounded-3xl border border-slate-700 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(30, 30, 30, 0.7), rgba(30, 30, 30, 0.7))" }}>
                  <i className="fa-solid fa-quote-left text-4xl text-primary/20 absolute top-6 right-6"></i>
                  <div className="flex text-yellow-400 mb-4 text-sm gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fa-solid ${i < stars ? 'fa-star' : 'fa-star text-slate-600'}`}></i>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic">{t.text}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xl">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <section id="contact" className="py-20 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl md:text-6xl font-bebas text-slate-800 mb-10">KUNJUNGI<br /><span className="text-primary">LAB KAMI.</span></h2>

          <div className="flex flex-col gap-8">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Area Layanan</strong>
                <p className="text-slate-500">melayani pick up delivery area purwokerto</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Waktu Operasional</strong>
                <p className="text-slate-500">senin-jumat 14.00-17.00, sabtu-minggu 11.00-17.00</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Layanan WhatsApp</strong>
                <a href="https://wa.me/6287720603708" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">0877-2060-3708</a>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-brands fa-instagram"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Instagram Resmi</strong>
                <a href="https://www.instagram.com/ninetynine.shoe" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">@ninetynine.shoe</a>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 rounded-[50px] blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
          <div className="relative h-[600px] rounded-[50px] overflow-hidden shadow-2xl border-8 border-white">
            <iframe
              src="https://maps.google.com/maps?q=-7.400142,109.253841&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden mt-12" >
        <div className="absolute -bottom-10 -right-10 font-bebas text-[15vw] text-white/5 leading-none pointer-events-none">Ninetynine</div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="font-bebas text-4xl mb-4 tracking-wider">Ninetynine Shoe.</h2>
            <p className="text-slate-400 max-w-md mx-auto md:mx-0">Tukang cuci sepatu andalan Anda. Pencetus cuci sepatu sambil tiduran di Indonesia! Berbasis di Cilacap dan Purwokerto.</p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex gap-4 justify-center md:justify-end mb-6">
              <a href="https://www.instagram.com/ninetynine.shoe" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-primary hover:-translate-y-1 transition-all"><i className="fa-brands fa-instagram"></i></a>
              <Link href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-primary hover:-translate-y-1 transition-all"><i className="fa-brands fa-tiktok"></i></Link>
              <Link href="/admin" title="Admin Panel" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-primary hover:-translate-y-1 transition-all"><i className="fa-solid fa-lock"></i></Link>
            </div>
            <p className="text-slate-500 text-sm">© 2026 Ninetynine Shoe.<br />HAK CIPTA DILINDUNGI.</p>
          </div>
        </div>
      </footer >
    </div >
  );
}
