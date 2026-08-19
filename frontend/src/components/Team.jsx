import React from 'react';

export default function Team() {
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    {
      name: 'CHRIS',
      role: 'Founder & Head of Art Direction & Strategic Vision',
      desc: "Chris is just… good. Like genuinely good. Being around him feels like an instant energy boost. The kind that hits different and makes the whole room feel lighter. Yeah, he might be a little clumsy sometimes, but he’s always ready to give everything for Tattooplatz and for the people he cares about. He’s a fighter in the most literal, loyal way. Our steady right shoulder when life gets messy, our hype, our support, our safe spot. Chris is all the good things wrapped into one chaotic, sweet human. Long story short: We adore our safe person Chris — the heart, the push, the comfort, and the good vibes we’re lucky to have.",
      image: '/CHRIS.jpg',
      imageFirst: true
    },
    {
      name: 'TULI',
      role: 'Co-Founder & Head of Finance',
      desc: "When it comes to the money side of things, he’s the boss. The backbone. The one who keeps everything running in the background. And his jokes?… he roasts everyone equally, and we love him for it. That humour, that timing, that “I’ll tease you but I’d also die for you” vibe classic Tuli. He’s a huge reason Tattooplatz even exists in the first place, and that’s something we’ll forever be grateful for. You might not see him around every day, but trust, he’s always there, always supporting, always having our back. In short: Tuli is heart, honesty and stability… all in one.",
      image: '/TULI.jpg',
      imageFirst: false
    },
    {
      name: 'BEA',
      role: 'Studio Manager & Head of Online Marketing',
      desc: "Young, fresh, open hearted, and beautiful inside and out. She leads with fairness, stands up for what’s right, and protects the people she cares about with quiet strength. Justice and responsibility aren’t just words to her they guide everything she does. Even under pressure, Bea never loses her glow. She carries weight with grace, stays focused, and still finds space to uplift everyone around her. No matter how intense things get, her energy stays warm, steady, and grounding. Without Bea, Tattooplatz wouldn’t be what it is today. She always shows up when she’s needed. Reliable, strong, and truly irreplaceable.",
      image: '/BEA.jpg',
      imageFirst: true
    },
    {
      name: 'DANI',
      role: 'Director of Legal Affairs & Strategic Development (Partner)',
      desc: "He’s the guy who’s always ready to step in, solve things, calm the storm, and keep the whole crew safe. Our newest member of the Tattooplatz fam… and somehow already one of the most cherished. But he’s not just bringing legal expertise, he’s bringing vibes. Good mood, quick jokes, that chill energy that makes everyone relax for a sec. Dani just has a way of bringing out a smile in everyone, in any circumstance. Long story short: He’s funny, reliable, and the kind of person who makes Tattooplatz feel a little lighter. We’re so grateful to have him in the fam.",
      image: '/DANI.jpg',
      imageFirst: false
    },
    {
      name: 'SARAH',
      role: 'Studio Operations Supervisor & Tattoo Artist Trainee',
      desc: "Sarah is basically pure fire in human form. Super organized, crazy responsible, and somehow always two steps ahead, she just gets people. Sarah knows exactly how to make everyone feel safe, welcome, and held. And let’s be real… she’s the unofficial fun captain of the whole crew. With her, there’s always something to laugh about, always a good moment, always that feeling of “yeah, I can rely on her, no question.” In short: Sarah is the spark, the structure, the heartbeat, and the chaos in the best way of Tattooplatz. We adore her.",
      image: '/SARAH.jpg',
      imageFirst: true
    },
    {
      name: 'LUCY',
      role: 'Studio Operations Supervisor & Event Coordinator',
      desc: "She’s not only our studio supervisor, and event coordinator, she’s also the sunshine we didn’t know we needed. Lucy steps into the room and suddenly the vibe is brighter, happier and lighter. And her tattoo game? Straight fire. Hours of practice, her own emerging style, and a dedication that hits different, she’s already growing into something seriously special. Long story short: Lucy is the sweetest soul, the happiest energy boost, and one of the reasons Tattooplatz feels like home.",
      image: '/LUCY.jpg', 
      imageFirst: false
    },
    {
      name: 'LEONIE',
      role: 'Studio Operations Supervisor & Hygiene Standards Lead',
      desc: "While others are debating whether to take the lift, Leonie is already running up the mountain. 60 kilometres? Sounds more like a relaxing day out to her. If you‘re looking for her, check the nearest summit first. As a former medical practice assistant, hygiene isn‘t just a recommendation—it‘s a way of life. Germs stand about as much chance with Leonie as the rest of us do in a race uphill. Helpful, trustworthy, and always one step ahead—often several. Before you even realise you need a hand, Leonie is already there.",
      image: '/LEONIE.jpg',
      imageFirst: true
    }
  ];

  return (
    <div className="w-full bg-white text-black font-sans overflow-hidden min-h-screen flex flex-col">
      
      {/* ── Top Pink Banner ── */}
      <div className={`relative w-full overflow-hidden transition-all duration-1000 ease-in-out ${
        showBanner ? 'h-[200px] md:h-[260px] opacity-100' : 'h-0 opacity-0'
      } bg-[#FF66C4] flex items-center justify-between px-8 md:px-24`}>
        <h2 className="relative z-10 text-white text-[50px] sm:text-[80px] md:text-[110px] font-black tracking-tighter uppercase leading-none">
          TEAM
        </h2>

        {/* Massive White X on the right */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[15%] w-[400px] h-[400px] items-center justify-center pointer-events-none">
          <div className="absolute w-[120%] h-[90px] bg-white rotate-45"></div>
          <div className="absolute w-[120%] h-[90px] bg-white -rotate-45"></div>
        </div>
      </div>

      {/* ── Team Grid ── */}
      <div className="w-full flex flex-col">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex flex-col md:flex-row w-full h-auto md:h-[600px]">
            
            {/* Image Box */}
            <div className={`w-full md:w-1/2 h-[320px] sm:h-[450px] md:h-full bg-[#EFEFEF] overflow-hidden flex items-center justify-center ${member.imageFirst ? 'md:order-1' : 'md:order-2'}`}>
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover grayscale" 
                style={{ objectPosition: 'center calc(50% + 40px)' }}
              />
            </div>
            
            {/* Text Box */}
            <div className={`w-full md:w-1/2 h-auto md:h-full bg-white flex flex-col items-center justify-center px-6 sm:px-10 py-12 text-center ${member.imageFirst ? 'md:order-2' : 'md:order-1'}`}>
              <h3 className="text-5xl md:text-7xl font-black text-[#FF66C4] uppercase tracking-wider mb-2">{member.name}</h3>
              <p className="text-[10px] md:text-xs font-semibold text-[#FF66C4] uppercase tracking-[0.2em] mb-6">{member.role}</p>
              <p className="text-[11px] md:text-[13px] font-bold text-black uppercase max-w-sm leading-relaxed">{member.desc}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
