import React from 'react';

export default function Hero({ onBookClick }) {
  return (
    <section id="start" className="w-full bg-white font-sans overflow-hidden">
      {/* ── Top White Section with Pink X Background ── */}
      <div className="relative w-full min-h-[580px] sm:min-h-[750px] md:min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-10">
        
        {/* SVG Filter to color logo-2.png to the client's light pink color (#FFC5E3) */}
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <filter id="pink-x-filter">
            <feFlood floodColor="#FFC5E3" result="flood" />
            <feComposite in="flood" in2="SourceAlpha" operator="in" />
          </filter>
        </svg>

        {/* Massive Pink X Background (using client's official X logo-2.png with SVG filter) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <img 
            src="/logo-2.png" 
            alt="Background X Logo" 
            className="w-[900px] h-[900px] sm:w-[1100px] sm:h-[1100px] md:w-[1300px] md:h-[1300px] flex-shrink-0 object-contain translate-x-[12%] sm:translate-x-[15%] lg:translate-x-[18%] select-none pointer-events-none"
            style={{
              filter: 'url(#pink-x-filter)'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl">
          {/* Main Logo */}
          <img 
            src="/logo-1.png" 
            alt="Tattooplatz Zurich" 
            className="w-[350px] sm:w-[550px] md:w-[720px] h-auto object-contain mb-8 mix-blend-multiply" 
          />
          
          {/* Tagline - monospaced, space-separated matching Canva width */}
          <p className="text-black text-[13px] sm:text-[18px] md:text-[21px] font-mono font-medium mb-12 sm:mb-20 tracking-normal select-none">
            T h e   f u t u r e   o f   t a t t o o i n g
          </p>

          {/* Book Here Button - oval with grey border, pink text, enlarged and pulsing */}
          <button 
            onClick={onBookClick}
            className="w-[265px] h-[95px] sm:w-[330px] sm:h-[115px] rounded-[50%] border border-neutral-400 text-[#FF66C4] hover:text-white bg-white/30 backdrop-blur-xs flex items-center justify-center font-black text-xl sm:text-2xl uppercase tracking-wider hover:bg-[#FF66C4] hover:border-[#FF66C4] transition-all duration-300 shadow-xs cursor-pointer animate-book-pulse"
          >
            BOOK HERE
          </button>
        </div>
      </div>

    </section>
  );
}
