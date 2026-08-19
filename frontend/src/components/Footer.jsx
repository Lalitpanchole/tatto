import React from 'react';
import { Mail, Instagram } from 'lucide-react';

export default function Footer({ onAddInquiry, managerSettings, onOpenCookieSettings }) {
  const [showBanner, setShowBanner] = React.useState(true);

  const formattedDays = React.useMemo(() => {
    if (!managerSettings?.openingDays) return 'WEDNESDAY TO SUNDAY';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const openDays = days.filter(d => managerSettings.openingDays[d]);
    if (openDays.length === 0) return 'CLOSED';
    if (openDays.length === 7) return 'MONDAY TO SUNDAY';
    return openDays.join(', ').toUpperCase();
  }, [managerSettings]);

  const formattedHours = React.useMemo(() => {
    if (!managerSettings?.operatingHours) return '11:00 AM TO 7:00 PM';
    const formatTime = (timeStr) => {
      let [h, m] = timeStr.split(':');
      h = parseInt(h);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    };
    return `${formatTime(managerSettings.operatingHours.open)} TO ${formatTime(managerSettings.operatingHours.close)}`;
  }, [managerSettings]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [formState, setFormState] = React.useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    
    if (onAddInquiry) {
      onAddInquiry({
        id: Date.now(),
        name: formState.name, 
        email: formState.email, 
        message: formState.message,
        date: new Date().toISOString().split('T')[0]
      });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormState({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <footer id="contact" className={`w-full bg-white text-black font-sans overflow-hidden min-h-screen flex flex-col transition-all duration-1000 ${showBanner ? 'pt-0' : 'pt-20'}`}>
      
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
      <div className="max-w-[1400px] mx-auto px-8 md:px-24 pt-2 pb-10 md:py-32 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start">
          
          {/* Left Column */}
          <div className="flex flex-col pt-4">
            <h3 className="text-xl sm:text-[28px] font-bold text-black leading-snug mb-1">OPENING HOURS</h3>
            <p className="text-xl sm:text-[28px] font-bold text-black leading-snug mb-1">{formattedDays}</p>
            <p className="text-xl sm:text-[28px] font-bold text-black leading-snug mb-8 sm:mb-16">{formattedHours}</p>
            
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

          {/* Right Column (Form exactly matching Canva) */}
          <div className="bg-[#EBEBEB] rounded-[16px] p-8 md:p-10 w-full max-w-[500px] mx-auto md:ml-auto">
            {isSubmitted ? (
               <div className="text-center py-12">
                 <div className="w-16 h-16 bg-studio-pink/20 border-2 border-studio-pink rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="text-studio-pink text-2xl font-bold">✓</span>
                 </div>
                 <h4 className="text-xl font-black text-black uppercase tracking-wider mb-2">Message Sent</h4>
                 <p className="text-zinc-600 font-sans text-sm">We'll get back to you as soon as possible.</p>
               </div>
            ) : (
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-black uppercase tracking-wider">Name and Surname</label>
                    <input required type="text" value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} className="p-3 bg-white border border-[#CCCCCC] rounded-md outline-none focus:border-studio-pink" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-black uppercase tracking-wider">Email Address</label>
                    <input required type="email" value={formState.email} onChange={e => setFormState({ ...formState, email: e.target.value })} className="p-3 bg-white border border-[#CCCCCC] rounded-md outline-none focus:border-studio-pink" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-black uppercase tracking-wider">Message</label>
                    <textarea required rows={4} value={formState.message} onChange={e => setFormState({ ...formState, message: e.target.value })} className="p-3 bg-white border border-[#CCCCCC] rounded-md outline-none focus:border-studio-pink resize-none text-sm font-sans" placeholder="Write your message here..." />
                  </div>
                  
                  <button type="submit" className="w-full bg-[#FF66C4] text-black font-black uppercase text-xs tracking-widest py-4 rounded-full mt-2 hover:bg-black hover:text-white transition-colors">
                    SEND MESSAGE
                  </button>
                </form>
            )}
          </div>
          
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="w-full flex flex-col items-center mt-auto">
        <h3 className="text-2xl md:text-[28px] font-bold text-black mb-1">TATTOOPLATZ GMBH</h3>
        <h3 className="text-2xl md:text-[28px] font-bold text-black mb-1">Aargauerstrasse 180</h3>
        <h3 className="text-2xl md:text-[28px] font-bold text-black mb-12">8048 Zürich</h3>

        {/* Interactive Google Map */}
        <div className="w-full h-[400px] relative">
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply z-10 bg-studio-pink/10"></div>
          <iframe
            title="Tattooplatz Zürich Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2702.9!2d8.4967!3d47.3909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900a3b5c00f4e7%3A0x0!2sAargauerstrasse%20180%2C%208048%20Z%C3%BCrich!5e0!3m2!1sen!2sch!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* White footer matching the other pages */}
      <div className="border-t border-zinc-200 py-8 bg-white text-center flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto px-4 sm:px-6 w-full mt-12">
        <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          &copy; {new Date().getFullYear()} TATTOOPLATZ GMBH. ALL RIGHTS RESERVED.
        </div>
        <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-xxs font-black tracking-widest uppercase gap-y-2">
          <a href="/terms-and-conditions" className="text-zinc-500 hover:text-studio-pink transition-colors">Terms & Conditions</a>
          <a href="/privacy-policy" className="text-zinc-500 hover:text-studio-pink transition-colors">Privacy Policy</a>
          <a href="/cancellation-policy" className="text-zinc-500 hover:text-studio-pink transition-colors">Cancellation Policy</a>
          <a href="/impressum" className="text-zinc-500 hover:text-studio-pink transition-colors">Impressum</a>
        </div>
      </div>
      
    </footer>
  );
}
