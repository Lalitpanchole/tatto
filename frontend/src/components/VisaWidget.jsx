import React from 'react';

export default function VisaWidget() {
  return (
    <section id="work-visa" className="w-full bg-white text-black font-display py-12 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        
        {/* Title */}
        <h2 className="text-[44px] sm:text-[56px] font-black text-[#FF66C4] tracking-tighter mb-8 uppercase">
          WORK VISA
        </h2>

        {/* White Card Container (Widened and heightened to match Canva exactly) */}
        <div className="bg-white border border-zinc-200 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.05)] p-10 md:p-16 text-left max-w-4xl mx-auto">
          
          {/* EU Citizens */}
          <div className="mb-10">
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black tracking-tight mb-3 uppercase">
              EU-Citizens can register via this link:
            </h3>
            <a 
              href="https://www.easygov.swiss/easygov/#/en/landing/wpmv" 
              target="_blank" 
              rel="noreferrer" 
              className="text-base sm:text-lg md:text-xl font-bold text-[#000000] underline hover:text-[#FF66C4] transition-colors decoration-2 underline-offset-4"
            >
              EasyGov Registration Portal
            </a>
          </div>

          {/* Non-EU Citizens */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black tracking-tight mb-3 uppercase">
              Non-EU-Citizens can contact us and our legal department
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-zinc-650 font-medium leading-relaxed font-sans">
              Non EU nationals do not have to register via a link. You can contact us directly (via{' '}
              <a 
                href="https://www.instagram.com/tattooplatz_zurich" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold underline hover:text-[#FF66C4] transition-colors"
              >
                Instagram
              </a>{' '}
              or{' '}
              <a 
                href="mailto:hello@tattooplatz.ch" 
                className="font-bold underline hover:text-[#FF66C4] transition-colors"
              >
                email
              </a>
              ) and our legal department will discuss everything further with you.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
