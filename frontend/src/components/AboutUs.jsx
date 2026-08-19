import React from 'react';

export default function AboutUs() {
  return (
    <section id="about" className="relative pt-6 pb-20 md:pt-12 md:pb-28 bg-white border-t border-zinc-100 overflow-hidden font-sans text-black">
      
      {/* Background accents - subtle dot grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNykiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[50vw] h-[50vw] bg-studio-pink/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section 1: OUR MISSION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col justify-center animate-slide-in-left">
            <h2 className="text-[70px] sm:text-[90px] md:text-[110px] font-black tracking-tighter uppercase leading-[0.85] text-[#FF66C4] mb-8">
              OUR<br />
              MISSION
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base leading-relaxed font-medium max-w-md">
              Welcome to Tattooplatz, your modern co-working tattoo studio in the heart of Zurich! We provide tattoo artists with the perfect workspace to unleash their creativity – with fair and transparent terms. Whether you're an experienced tattoo artist or just starting out, you'll find the space and support you need here to focus on what matters most: your art.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl animate-slide-in-right hover-premium-lift hover-pink-glow cursor-pointer transition-all duration-500">
            <img
              src="/about-hero.png"
              alt="Tattooplatz studio neon sign"
              className="w-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
              style={{ maxHeight: '450px' }}
            />
          </div>
        </div>

        {/* Section 2: What sets us apart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-20 pt-20 border-t border-zinc-200">
          <div className="overflow-hidden rounded-xl order-2 lg:order-1 animate-slide-in-left hover-premium-lift hover-pink-glow cursor-pointer transition-all duration-500">
            <img
              src="/about-img9.png"
              alt="Tattooplatz studio environment and setup"
              className="w-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
              style={{ maxHeight: '450px' }}
            />
          </div>
          <div className="flex flex-col justify-center order-1 lg:order-2 space-y-6 animate-slide-in-right text-zinc-700 text-sm sm:text-base leading-relaxed font-medium">
            <p>
              What sets us apart from other studios? With us, you only pay for the time you actually use – no additional fees or percentage deductions from your earnings. Your success is entirely yours! We offer flexible rental options at fair, fixed prices, giving you full control over your working hours and income.
            </p>
            <p>
              Our studio is fully equipped: The rental price includes all essential tools and supplies, from chairs to hygiene equipment. All you need to bring are your personal tools and your creativity. You can focus entirely on your craft without worrying about additional costs or hidden requirements.
            </p>
            <p>
              Tattooplatz is located in a prime spot – just a 5-minute walk from Altstetten train station, offering a stunning view of Zurich's skyline. We place great emphasis on creating a relaxed yet professional atmosphere where both you and your clients will feel comfortable. Whether you want to work regularly with us or just need a space for a few hours, you are always welcome here.
            </p>
          </div>
        </div>

        {/* Section 3: Gallery and concluding text */}
        <div className="mt-20 pt-20 border-t border-zinc-200 flex flex-col">
          <div className="max-w-4xl mb-12 space-y-6 animate-slide-up text-zinc-700 text-sm sm:text-base leading-relaxed font-medium">
            <p>
              In addition to the ideal working environment, we also offer you the opportunity to connect with other artists. Our co-working philosophy promotes creative exchange and builds a community of tattoo artists who inspire and support each other. Here, you can make new connections, share knowledge, and be part of a growing network.
            </p>
            <p>
              Tattooplatz is not just a place to work, but a space where artists can flourish, network, and shape the future of tattooing together. Let's create something unique – we look forward to welcoming you!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="overflow-hidden rounded-xl animate-scale-up delay-150 hover-premium-lift hover-pink-glow cursor-pointer transition-all duration-500">
              <img
                src="/about-img6.png"
                alt="Tattooplatz creative community space 1"
                className="w-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
                style={{ maxHeight: '450px' }}
              />
            </div>
            <div className="overflow-hidden rounded-xl animate-scale-up delay-300 hover-premium-lift hover-pink-glow cursor-pointer transition-all duration-500">
              <img
                src="/about-img7.png"
                alt="Tattooplatz creative community space 2"
                className="w-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
                style={{ maxHeight: '450px' }}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
