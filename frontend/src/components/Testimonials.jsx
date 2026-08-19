import React from 'react';
import { Quote, Star, MapPin } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Marco V.',
    origin: 'Milan, Italy',
    role: 'Guest Artist',
    stars: 5,
    text: 'I traveled from Milan to Zürich for a guest spot and Tattooplatz was absolutely the right choice. The station was immaculate, the lighting was studio-grade, and the vibe was incredibly welcoming. I will be back every time I pass through Switzerland.',
    tag: 'Guest Artist',
  },
  {
    id: 2,
    name: 'Alina R.',
    origin: 'Zürich, Switzerland',
    role: 'Resident Artist',
    stars: 5,
    text: 'Working at Tattooplatz changed everything for me. I keep 100% of my earnings, I set my own hours, and the space looks better than any traditional shop I have been in. The stencil printers alone are worth it.',
    tag: 'Resident Artist',
  },
  {
    id: 3,
    name: 'Jonas K.',
    origin: 'Berlin, Germany',
    role: 'Guest Artist',
    stars: 5,
    text: 'Booked two days last month and I already have my next visit planned. The booking system is easy, the space is clean and inspiring, and the location near Altstetten is super convenient. Exactly what I needed as a traveling artist.',
    tag: 'Guest Artist',
  },
  {
    id: 4,
    name: 'Sofia M.',
    origin: 'Barcelona, Spain',
    role: 'Guest Artist',
    stars: 5,
    text: 'The studio has an energy that is hard to describe — it is serious about hygiene and professionalism but also creative and relaxed. My clients loved the atmosphere. I will recommend Tattooplatz to every artist friend visiting Zürich.',
    tag: 'Guest Artist',
  },
  {
    id: 5,
    name: 'Lukas B.',
    origin: 'Vienna, Austria',
    role: 'Resident Artist',
    stars: 5,
    text: 'As someone who was tired of giving away 40% of every session to a shop, Tattooplatz is a dream. Flat rent, no games, no commissions. The team is transparent and professional. Best decision I made for my career.',
    tag: 'Resident Artist',
  },
  {
    id: 6,
    name: 'Priya N.',
    origin: 'Amsterdam, Netherlands',
    role: 'Guest Artist',
    stars: 5,
    text: 'I have worked in many co-working tattoo spaces across Europe and Tattooplatz is easily top three. The ring lights, the hydraulic chairs, the coffee machine — every detail shows the team cares about artists.',
    tag: 'Guest Artist',
  },
];

function TestimonialCard({ item, index }) {
  const [hovered, setHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      className="relative group flex flex-col bg-white border border-zinc-200 rounded-xl p-5 hover:border-studio-pink transition-all duration-350 shadow-sm overflow-hidden animate-slide-up hover-premium-lift cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Pink top line on hover */}
      <div className={`absolute top-0 left-0 h-[3px] bg-studio-pink shadow-[0_0_10px_#FF66C4] transition-all duration-500 ${hovered ? 'w-full' : 'w-0'}`} />

      {/* Large background quote mark */}
      <div className="absolute -top-2 -right-2 text-[7rem] font-black text-zinc-100 select-none leading-none pointer-events-none group-hover:text-studio-pink/10 transition-colors duration-300">
        "
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-2.5">
        {Array.from({ length: item.stars }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className="text-studio-pink fill-studio-pink"
          />
        ))}
      </div>

      {/* Quote text */}
      <div className="flex-1 mb-4 relative z-10 flex flex-col justify-between">
        <p className={`text-sm text-zinc-700 leading-relaxed font-sans ${isExpanded ? '' : 'line-clamp-1'}`}>
          "{item.text}"
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-studio-pink hover:text-black text-left text-[10px] font-black tracking-widest uppercase mt-2 self-start transition-colors duration-200"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      </div>

      {/* Divider */}
      <div className="w-8 h-[2px] bg-studio-pink mb-3 group-hover:w-full transition-all duration-500 shadow-[0_0_6px_#FF66C4]" />

      {/* Author info */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-black uppercase tracking-wide">{item.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={10} className="text-studio-pink" />
            <span className="text-[10px] text-zinc-400 font-sans">{item.origin}</span>
          </div>
        </div>
        <span className={`text-[9px] font-black tracking-[0.25em] uppercase px-2.5 py-1 border rounded-full transition-all duration-300 ${hovered ? 'bg-studio-pink text-black border-studio-pink' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
          {item.tag}
        </span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-10 bg-zinc-50 border-t border-zinc-200 overflow-hidden text-black font-sans"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-studio-pink/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-4 left-8 text-[7rem] font-black text-zinc-200/60 select-none leading-none pointer-events-none uppercase">
        ARTISTS
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-slide-in-left">
          <div>
            <h2 className="text-xxs font-black tracking-[0.4em] text-studio-pink uppercase mb-2">
              ARTIST REVIEWS
            </h2>
            <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-black uppercase leading-none">
              WHAT ARTISTS SAY
            </h3>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {testimonials.map((item, index) => (
            <TestimonialCard key={item.id} item={item} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}
