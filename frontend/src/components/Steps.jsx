import React from 'react';

export default function Steps() {
  const [v1, setV1] = React.useState(false);
  const [v2, setV2] = React.useState(false);
  const [v3, setV3] = React.useState(false);

  const ref1 = React.useRef(null);
  const ref2 = React.useRef(null);
  const ref3 = React.useRef(null);

  React.useEffect(() => {
    const observerOptions = { threshold: 0.15 };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === ref1.current && entry.isIntersecting) {
          setV1(true);
        }
        if (entry.target === ref2.current && entry.isIntersecting) {
          setV2(true);
        }
        if (entry.target === ref3.current && entry.isIntersecting) {
          setV3(true);
        }
      });
    }, observerOptions);

    if (ref1.current) observer.observe(ref1.current);
    if (ref2.current) observer.observe(ref2.current);
    if (ref3.current) observer.observe(ref3.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="steps" className="w-full bg-white text-black py-16 md:py-24 overflow-hidden border-t border-zinc-150">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12 md:space-y-16">
        
        {/* Step 1 */}
        <div 
          ref={ref1}
          className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 md:gap-12 justify-start transform transition-all duration-1000 ease-out ${
            v1 ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
            } group cursor-default hover:translate-x-2`}
        >
          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#FF66C4] leading-none tracking-tight uppercase select-none flex-shrink-0">
            STEP 1
          </span>
          <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-black uppercase leading-relaxed tracking-normal">
            FILL YOUR AGENDA.
          </span>
        </div>

        {/* Step 2 */}
        <div 
          ref={ref2}
          className={`flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 sm:gap-8 md:gap-12 w-full transform transition-all duration-1000 ease-out ${
            v2 ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
          } group cursor-default hover:-translate-x-2`}
        >
          <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-black uppercase leading-relaxed tracking-normal text-left">
            BOOK A WORKSTATION FOR THE TIME YOU NEED IT.
          </span>
          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#FF66C4] leading-none tracking-tight uppercase select-none flex-shrink-0">
            STEP 2
          </span>
        </div>

        {/* Step 3 */}
        <div 
          ref={ref3}
          className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 md:gap-12 justify-start transform transition-all duration-1000 ease-out ${
            v3 ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
          } group cursor-default hover:translate-x-2`}
        >
          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#FF66C4] leading-none tracking-tight uppercase select-none flex-shrink-0">
            STEP 3
          </span>
          <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-black uppercase leading-relaxed tracking-normal">
            ENJOY A BEAUTIFUL STUDIO WITH NO COMMISSION FEES.
          </span>
        </div>

      </div>
    </section>
  );
}
