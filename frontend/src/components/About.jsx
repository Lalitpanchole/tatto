import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';


const galleryItems = [
  { src: '/studio1.png', tag: 'WORKSTATIONS',  headline: 'Your Personal Creative Zone',    sub: 'Fully hydraulic, adjustable tattoo chairs. Zero compromise on comfort.' },
  { src: '/studio3.png', tag: 'LIGHTING',       headline: 'Studio-Grade LED Lighting',      sub: 'High-intensity ring lights ensure perfect visibility for every detail.' },
  { src: '/studio4.png', tag: 'OPEN SPACE',     headline: 'Breathe. Create. Thrive.',       sub: 'A bright, open co-working floor with panoramic Zurich skyline views.' },
  { src: '/studio5.png', tag: 'ATMOSPHERE',     headline: 'Where Art Meets Light',          sub: 'Neon art, natural plants, and creative energy fill every corner.' },
  { src: '/studio6.png', tag: 'NEON ART',       headline: 'Iconic Studio Aesthetic',        sub: 'Unique neon sculptures and signature artworks define our identity.' },
  { src: '/studio7.png', tag: 'EQUIPMENT',      headline: 'Everything You Need',            sub: '2 stencil printers, tool carts, disinfectants & premium supplies included.' },
  { src: '/studio8.png', tag: 'COMMUNITY',      headline: 'A Place for Every Artist',       sub: 'Join a growing network of global artists who choose Tattooplatz.' },
  { src: '/studio2.png', tag: 'STUDIO VIBE',    headline: "DON'T WORRY. Just Create.",      sub: 'Relaxed, welcoming, professional. Our studio feels like home — with better lighting.' },
];

const includedItems = [
  'Hydraulic tattoo chair & workstation',
  'LED ring lights & workspace lighting',
  'Stencil printer & paper',
  'High-speed Wi-Fi',
  'Coffee machine access',
];



function GalleryCard({ item, className }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className={`relative overflow-hidden rounded-xl cursor-pointer ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image fills card completely */}
      <img
        src={item.src}
        alt={item.headline}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out ${hovered ? 'scale-110' : 'scale-100'}`}
      />

      {/* Permanent bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

      {/* Pink top line — animates in on hover */}
      <div className={`absolute top-0 left-0 h-[3px] bg-studio-pink shadow-[0_0_14px_#FF66C4] transition-all duration-500 ease-out ${hovered ? 'w-full' : 'w-0'}`} />

      {/* TAG badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`text-[9px] font-black tracking-[0.3em] uppercase px-2.5 py-1 transition-all duration-300 ${hovered ? 'bg-studio-pink text-black shadow-[0_0_10px_rgba(255,102,196,0.5)]' : 'bg-black/50 text-white/80 backdrop-blur-sm'}`}>
          {item.tag}
        </span>
      </div>

      {/* Hover dark wash */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-400 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

      {/* Hover text slide up */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 z-10 transition-all duration-500 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles size={10} className="text-studio-pink" />
          <span className="text-[9px] font-black tracking-[0.3em] text-studio-pink uppercase">TATTOOPLATZ ZÜRICH</span>
        </div>
        <h4 className="text-white font-black text-sm uppercase leading-tight mb-1">{item.headline}</h4>
        <p className="text-white/65 text-[11px] leading-relaxed font-light">{item.sub}</p>
      </div>

      {/* Corner accent */}
      <div className={`absolute bottom-3 right-3 z-10 transition-all duration-400 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-5 h-5 border-r-2 border-b-2 border-studio-pink" />
      </div>
    </div>
  );
}

export default function About() {
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="studio" className="relative bg-white border-t border-zinc-200 overflow-hidden text-black font-sans">

      {/* ── Top Pink Banner ── */}
      <div className={`relative w-full overflow-hidden transition-all duration-1000 ease-in-out ${
        showBanner ? 'h-[200px] md:h-[260px] opacity-100 mb-12' : 'h-0 opacity-0 mb-0'
      } bg-[#FF66C4] flex items-center justify-between px-8 md:px-24`}>
        <h2 className="relative z-10 text-white text-[50px] sm:text-[80px] md:text-[110px] font-black tracking-tighter uppercase leading-none">
          STUDIO
        </h2>

        {/* Massive White X on the right */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[15%] w-[400px] h-[400px] items-center justify-center pointer-events-none">
          <div className="absolute w-[120%] h-[90px] bg-white rotate-45"></div>
          <div className="absolute w-[120%] h-[90px] bg-white -rotate-45"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 animate-slide-in-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-black uppercase leading-none">STUDIO GALLERY</h3>
          </div>
          <p className="text-sm text-zinc-500 max-w-sm font-light leading-relaxed">
            A premium co-working tattoo space in Zurich — designed for artists who demand the best environment for their craft.
          </p>
        </div>


        {/* ── Bento Gallery (Desktop & Tablet) ── */}
        <div className="hidden sm:grid grid-cols-3 grid-rows-3 gap-2" style={{ height: '700px' }}>
          {/* Row 1: big card (spans 2 cols, 2 rows) + 2 small on right */}
          <GalleryCard item={galleryItems[0]} className="col-span-2 row-span-2 animate-slide-up" />
          <GalleryCard item={galleryItems[1]} className="col-span-1 row-span-1 animate-slide-up delay-100" />
          <GalleryCard item={galleryItems[2]} className="col-span-1 row-span-1 animate-slide-up delay-150" />
          {/* Row 3: 3 equal cards */}
          <GalleryCard item={galleryItems[3]} className="col-span-1 row-span-1 animate-slide-up delay-200" />
          <GalleryCard item={galleryItems[4]} className="col-span-1 row-span-1 animate-slide-up delay-250" />
          <GalleryCard item={galleryItems[5]} className="col-span-1 row-span-1 animate-slide-up delay-300" />
        </div>

        {/* Second row of gallery - 2 cards (Desktop & Tablet) */}
        <div className="hidden sm:grid grid-cols-2 gap-2 mt-2" style={{ height: '260px' }}>
          <GalleryCard item={galleryItems[6]} className="animate-slide-up delay-400" />
          <GalleryCard item={galleryItems[7]} className="animate-slide-up delay-500" />
        </div>

        {/* Stacked Gallery (Mobile Only) */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {galleryItems.map((item, idx) => (
            <div key={idx} className="relative h-64 overflow-hidden rounded-xl border border-zinc-200 shadow-sm animate-slide-up">
              <img src={item.src} alt={item.headline} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 z-10">
                <span className="text-[9px] font-black tracking-[0.3em] uppercase px-2.5 py-1 bg-studio-pink text-black shadow-[0_0_10px_rgba(255,102,196,0.5)]">
                  {item.tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={10} className="text-studio-pink" />
                  <span className="text-[9px] font-black tracking-[0.3em] text-studio-pink uppercase font-sans">TATTOOPLATZ</span>
                </div>
                <h4 className="text-white font-black text-sm uppercase leading-tight mb-1">{item.headline}</h4>
                <p className="text-white/80 text-[11px] leading-normal font-sans font-light">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up delay-500">
          {[
            { num: '4+',   label: 'Workstations' },
            { num: '100%', label: 'Your Earnings' },
            { num: '5 min',label: 'From Altstetten' },
            { num: '0%',   label: 'Commission' },
          ].map((s, i) => (
            <div key={i} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 flex flex-col items-center justify-center text-center hover:border-studio-pink hover-premium-lift cursor-pointer duration-300">
              <span className="text-2xl sm:text-3xl font-black text-black">{s.num}</span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


