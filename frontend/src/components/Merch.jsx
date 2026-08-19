import React from 'react';
import { printfulAPI } from '../services/api.js';

const products = [
  {
    id: 1,
    name: 'Pink Vulva Pajama Top',
    price: 45,
    front: '/produt.png',
    desc: 'Premium satin-blend pajama top featuring custom neon pink embroidered vulva designs. Light, breathable, and styled for ultimate comfort.',
    checkoutUrl: 'https://www.printful.com', // TODO: Replace with your actual Stripe Payment Link (synced with Printful product)
  },
  {
    id: 2,
    name: 'Vulva Socks',
    price: 17.50,
    front: '/product1.png',
    desc: 'Crew length white combed-cotton socks with purple vulva graphic embroidery. One size fits most.',
    checkoutUrl: 'https://www.printful.com', // TODO: Replace with your actual Stripe Payment Link (synced with Printful product)
  },
  {
    id: 3,
    name: 'Pink Vulva White Mug',
    price: 15,
    front: '/product2.png',
    desc: 'Ceramic matte white mug with high-gloss pink interior and front accent graphic. Microwave and dishwasher safe.',
    checkoutUrl: 'https://www.printful.com', // TODO: Replace with your actual Stripe Payment Link (synced with Printful product)
  },
  {
    id: 4,
    name: 'Tattooplatz Logo Back Print Hoodie',
    price: 65,
    front: '/product-front side.png',
    desc: 'Premium black pullover hoodie. Subtle Tattooplatz X Zürich chest logo on front, bold vulva backprint on the back.',
    checkoutUrl: 'https://www.printful.com', // TODO: Replace with your actual Stripe Payment Link (synced with Printful product)
  },
  {
    id: 5,
    name: 'Vulva Back Print T-Shirt',
    price: 35,
    front: '/product frontside2.png',
    desc: 'Maroon oversized tee with Tattooplatz X Zürich chest print and a large pink vulva artwork on the back.',
    checkoutUrl: 'https://www.printful.com', // TODO: Replace with your actual Stripe Payment Link (synced with Printful product)
  },
  {
    id: 6,
    name: 'Tattooplatz Logo Dad Hat',
    price: 35,
    front: '/product3.png',
    desc: 'Unstructured 6-panel strapback dad hat in washed black canvas. Vulva embroidery on front panel.',
    checkoutUrl: 'https://www.printful.com', // TODO: Replace with your actual Stripe Payment Link (synced with Printful product)
  },
];

export default function Merch({ onAddToCart }) {
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="merch" className="w-full bg-white font-sans overflow-hidden">
      
      {/* ── Top Pink Banner with White X and MERCH text ── */}
      <div className={`relative w-full overflow-hidden transition-all duration-1000 ease-in-out ${
        showBanner ? 'h-[200px] md:h-[260px] opacity-100' : 'h-0 opacity-0'
      } bg-[#FF66C4] flex items-center justify-between px-8 md:px-24`}>
        
        {/* MERCH text */}
        <h2 className="relative z-10 text-white text-[50px] sm:text-[80px] md:text-[110px] font-black tracking-tighter uppercase leading-none">
          MERCH
        </h2>

        {/* Massive White X on the right */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[15%] w-[400px] h-[400px] items-center justify-center pointer-events-none">
          <div className="absolute w-[120%] h-[90px] bg-white rotate-45"></div>
          <div className="absolute w-[120%] h-[90px] bg-white -rotate-45"></div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-10 md:py-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-20">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col h-full justify-between">
              
              {/* Product Image & Info Group */}
              <div className="flex flex-col flex-1">
                {/* Product Image */}
                <div className="w-full aspect-square mb-6 flex items-center justify-center bg-white border border-zinc-100 rounded-xl p-4 overflow-hidden shadow-xs">
                  <img 
                    src={product.front} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain drop-shadow-sm hover:scale-[1.03] transition-transform duration-500 mix-blend-multiply" 
                  />
                </div>

                {/* Product Details (Exactly matching Canva typography) */}
                <h3 className="text-[#FF66C4] font-serif text-xl font-bold uppercase tracking-wide mb-2 leading-snug">
                  {product.name}
                </h3>
                
                <p className="text-[#FF66C4] font-serif text-xl mb-4">
                  {product.price.toFixed(2)} CHF
                </p>
                
                <p className="text-black font-serif text-[15px] leading-relaxed mb-6">
                  {product.desc}
                </p>
              </div>

              {/* Add to Cart / Buy Now Button */}
              <button 
                onClick={() => {
                  if (product.checkoutUrl) {
                    window.open(product.checkoutUrl, '_blank', 'noopener,noreferrer');
                  } else if (onAddToCart) {
                    onAddToCart(product);
                  }
                }}
                className="w-full py-3 bg-[#FF66C4] text-white hover:bg-black hover:text-white text-xs font-black tracking-widest uppercase transition-all duration-300 rounded-full shadow-xs hover:shadow-[0_4px_12px_rgba(255,102,196,0.3)] mt-auto"
              >
                {product.checkoutUrl ? 'Buy Now' : 'Add to Cart'}
              </button>

            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
