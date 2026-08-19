import React from 'react';
import { Check, ArrowRight, Zap, Clock, Star } from 'lucide-react';
import { getPricingForDay } from '../utils/pricing';

const plans = [
  {
    id: 1,
    hours: 3,
    label: '3 HOURS',
    price: 90,
    perHour: 30,
    tag: null,
    color: 'default',
  },
  {
    id: 2,
    hours: 4,
    label: '4 HOURS',
    price: 120,
    perHour: 30,
    tag: 'MOST POPULAR',
    color: 'pink',
  },
  {
    id: 3,
    hours: 6,
    label: '6 HOURS',
    price: 180,
    perHour: 30,
    tag: 'GREAT VALUE',
    color: 'default',
  },
  {
    id: 4,
    hours: 8,
    label: '8 HOURS',
    price: 220,
    perHour: 27.5,
    tag: 'BEST RATE',
    color: 'default',
  },
];

export default function Pricing({ managerSettings, onBookClick }) {
  const dynamicPlans = plans.map(plan => {
    const pkgKey = `${plan.hours}H`;
    const currentPricing = getPricingForDay(managerSettings?.pricing);
    const newPrice = currentPricing?.[pkgKey] || plan.price;
    return {
      ...plan,
      price: newPrice,
      perHour: (newPrice / plan.hours).toFixed(1) // Keep UI consistent with per-hour rate logic
    };
  });
  return (
    <section
      id="pricing"
      className="relative py-10 md:py-24 bg-white border-t border-zinc-100 overflow-hidden text-black font-sans"
    >
      {/* Soft Background watermark */}
      <div className="absolute -bottom-8 -right-8 text-[12rem] font-black text-zinc-50 select-none uppercase pointer-events-none leading-none tracking-tighter">
        PRICING
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-slide-in-left">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-studio-pink/10 text-studio-pink text-xs font-black tracking-widest uppercase mb-6 shadow-sm border border-studio-pink/20">
              <Zap size={14} /> TRANSPARENT PRICING
            </div>
            <h3 className="text-5xl sm:text-6xl font-black tracking-tighter text-black uppercase leading-none mb-6">
              SELECT YOUR<br />SESSION
            </h3>
            <p className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed">
              Premium workstation rentals with everything included.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium bg-zinc-50 px-6 py-4 rounded-xl border border-zinc-100 shadow-sm">
            <Zap size={20} className="text-studio-pink flex-shrink-0" />
            <p className="tracking-wide">No commission. Keep 100% of your earnings.</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicPlans.map((plan, index) => {
            const isPink = plan.color === 'pink';
            return (
              <div
                key={plan.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`relative group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 animate-slide-up cursor-pointer hover:-translate-y-2 ${
                  isPink
                    ? 'bg-black border border-black shadow-[0_12px_30px_rgba(255,102,196,0.25)] hover:shadow-[0_20px_40px_rgba(255,102,196,0.35)]'
                    : 'bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:border-studio-pink/50'
                }`}
              >
                {/* Tag badge */}
                {plan.tag && (
                  <div className={`absolute top-5 right-5 text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full ${
                    isPink ? 'bg-studio-pink text-black' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {plan.tag}
                  </div>
                )}

                {/* Pink top line on hover (non-pink cards) */}
                {!isPink && (
                  <div className="absolute top-0 left-0 w-0 h-1 bg-studio-pink group-hover:w-full transition-all duration-500" />
                )}

                <div className="p-8 flex flex-col flex-1">
                  {/* Hours label */}
                  <div className="flex items-center gap-3 mb-6">
                    <Clock size={16} className={isPink ? 'text-studio-pink' : 'text-zinc-400'} />
                    <span className={`text-xs font-black tracking-[0.3em] uppercase ${isPink ? 'text-studio-pink' : 'text-zinc-400'}`}>
                      {plan.label}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-2 flex items-baseline">
                    <span className={`text-6xl font-black tracking-tighter leading-none ${isPink ? 'text-white' : 'text-black'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg font-bold ml-2 ${isPink ? 'text-white/60' : 'text-zinc-400'}`}>CHF</span>
                  </div>
                  <p className={`text-xs font-medium tracking-wide uppercase mb-6 ${isPink ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {plan.perHour % 1 === 0 ? plan.perHour : plan.perHour.toFixed(1)} CHF / hour
                  </p>

                  {/* Spacer */}
                  <div className="flex-1 mb-6" />

                  {/* CTA Button */}
                  <button
                    onClick={onBookClick}
                    className={`w-full py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 rounded-full ${
                      isPink
                        ? 'bg-studio-pink text-black hover:bg-white shadow-[0_4px_15px_rgba(255,102,196,0.3)]'
                        : 'bg-white border-2 border-zinc-200 text-black hover:border-studio-pink hover:bg-studio-pink hover:text-black hover:shadow-[0_4px_15px_rgba(255,102,196,0.2)]'
                    }`}
                  >
                    BOOK {plan.hours}H SESSION
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl">
          <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
            <Star size={18} strokeWidth={2.5} className="text-studio-pink fill-studio-pink" />
            <span>All sessions include full workstation access. No commission. No hidden fees.</span>
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] bg-white text-zinc-500 px-4 py-2 rounded-full border border-zinc-200">
            MINIMUM BOOKING: 3 HOURS
          </span>
        </div>

      </div>
    </section>
  );
}
