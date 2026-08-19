import React from 'react';
import { Mail, Instagram } from 'lucide-react';

export default function ContactPage() {
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full bg-white text-black font-sans overflow-hidden min-h-screen transition-all duration-1000 ${showBanner ? 'pt-0' : 'pt-20'}`}>
      
      {/* ── Top Pink Banner ── */}
      <div className={`relative w-full overflow-hidden transition-all duration-1000 ease-in-out ${
        showBanner ? 'h-[200px] md:h-[260px] opacity-100' : 'h-0 opacity-0'
      } bg-[#FF66C4] flex items-center justify-between px-8 md:px-24`}>
        {/* CONTACT text */}
        <h2 className="relative z-10 text-white text-[50px] sm:text-[80px] md:text-[110px] font-black tracking-tighter uppercase leading-none">
          CONTACT
        </h2>

        {/* Massive White X on the right */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[15%] w-[400px] h-[400px] items-center justify-center pointer-events-none">
          <div className="absolute w-[120%] h-[90px] bg-white rotate-45"></div>
          <div className="absolute w-[120%] h-[90px] bg-white -rotate-45"></div>
        </div>
      </div>

      {/* ── Middle Section ── */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-24 pt-2 pb-10 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start">
          
          {/* Left Column */}
          <div className="flex flex-col pt-4">
            <h3 className="text-xl sm:text-[28px] font-bold text-black leading-snug mb-1">OPENING HOURS</h3>
            <p className="text-xl sm:text-[28px] font-bold text-black leading-snug mb-1">WEDNESDAY TO SUNDAY</p>
            <p className="text-xl sm:text-[28px] font-bold text-black leading-snug mb-8 sm:mb-16">11:00 AM TO 7:00 PM</p>
            
            <div className="flex flex-col gap-6 sm:gap-10">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="border-[3px] sm:border-4 border-black rounded-[15px] sm:rounded-[20px] p-2 sm:p-3 w-[52px] h-[52px] sm:w-[70px] sm:h-[70px] flex items-center justify-center flex-shrink-0">
                  <Instagram size={30} className="sm:w-[45px] sm:h-[45px]" strokeWidth={2} />
                </div>
                <a href="https://www.instagram.com/tattooplatz_zurich" className="text-sm sm:text-xl font-bold text-black underline decoration-2 underline-offset-4 break-all">
                  TATTOOPLATZ_ZURICH
                </a>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="border-[3px] sm:border-4 border-black rounded-[15px] sm:rounded-[20px] p-2 sm:p-3 w-[52px] h-[52px] sm:w-[70px] sm:h-[70px] flex items-center justify-center flex-shrink-0">
                  <Mail size={30} className="sm:w-[45px] sm:h-[45px]" strokeWidth={2} />
                </div>
                <a href="mailto:hello@tattooplatz.ch" className="text-sm sm:text-xl font-bold text-black underline decoration-2 underline-offset-4 break-all">
                  HELLO@TATTOOPLATZ.CH
                </a>
              </div>
            </div>
          </div>

          {/* Right Column (Contact Form) */}
          <div className="bg-[#EBEBEB] rounded-[16px] p-8 md:p-10 w-full max-w-[500px] mx-auto md:ml-auto">
            <form className="flex flex-col gap-5" onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent! We will write you back.");
              e.target.reset();
            }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-black uppercase tracking-wider">Name and Surname</label>
                <input required type="text" className="p-3 bg-white border border-[#CCCCCC] rounded-md outline-none focus:border-[#FF66C4]" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-black uppercase tracking-wider">Email Address</label>
                <input required type="email" className="p-3 bg-white border border-[#CCCCCC] rounded-md outline-none focus:border-[#FF66C4]" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-black uppercase tracking-wider">Message</label>
                <textarea required rows={4} className="p-3 bg-white border border-[#CCCCCC] rounded-md outline-none focus:border-[#FF66C4] resize-none text-sm font-sans" placeholder="Write your message here..." />
              </div>
              
              <button type="submit" className="w-full bg-[#FF66C4] text-black font-black uppercase text-xs tracking-widest py-4 rounded-full mt-2 hover:bg-black hover:text-white transition-colors">
                SEND MESSAGE
              </button>
            </form>
          </div>
          
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="w-full flex flex-col items-center">
        <h3 className="text-2xl md:text-[28px] font-bold text-black mb-1">TATTOOPLATZ GMBH</h3>
        <h3 className="text-2xl md:text-[28px] font-bold text-black mb-1">Aargauerstrasse 180</h3>
        <h3 className="text-2xl md:text-[28px] font-bold text-black mb-12">8048 Zürich</h3>

        {/* Map placeholder (styling to match the Canva pink vector map) */}
        <div className="w-full h-[350px] relative bg-[#FFA89F] overflow-hidden flex items-center justify-center">
          {/* Faux map lines */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `repeating-linear-gradient(15deg, transparent, transparent 30px, #4A1A60 30px, #4A1A60 33px), repeating-linear-gradient(105deg, transparent, transparent 40px, #4A1A60 40px, #4A1A60 44px)`
          }}></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, transparent 20%, #4A1A60 21%, transparent 22%), radial-gradient(circle at 70% 80%, transparent 10%, #4A1A60 11%, transparent 12%)`
          }}></div>
          
          {/* GOOGLE MAP Text box */}
          <div className="relative z-10 bg-white/95 px-12 py-5 rounded-2xl shadow-lg border-2 border-white/40">
            <h1 className="text-4xl md:text-5xl font-black text-[#EA4335] tracking-tight">GOOGLE MAP</h1>
          </div>
        </div>
      </div>
      
    </div>
  );
}
