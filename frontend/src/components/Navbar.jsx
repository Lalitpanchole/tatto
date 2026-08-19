import React from 'react';
import { Instagram, ShoppingCart, Calendar, Menu, X, User } from 'lucide-react';
export default function Navbar({ activeSection, onNavClick, cartCount, onOpenCart, onContactClick, onLoginClick }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'start', label: 'HOME' },
    { id: 'booking', label: 'BOOK A SESSION' },
    { id: 'studio', label: 'STUDIO' },
    { id: 'about', label: 'ABOUT US' },
    { id: 'team', label: 'TEAM' },
    { id: 'contact', label: 'CONTACT' },
    { id: 'merch', label: 'MERCH' }
  ];


  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all duration-300 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:pl-8 lg:pr-2 xl:pl-12 xl:pr-3">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavClick('start')}>
            <img src="/logo-1.png" alt="Tattooplatz Logo" className="h-8 md:h-9 w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavClick(item.id);
                }}
                className={`text-[10px] xl:text-[11px] font-black tracking-wider transition-all duration-300 ease-out relative py-2 whitespace-nowrap hover:-translate-y-0.5 hover:scale-105 inline-block ${
                  activeSection === item.id 
                    ? 'text-studio-pink' 
                    : 'text-zinc-600 hover:text-studio-pink hover:drop-shadow-[0_0_8px_rgba(255,102,196,0.5)]'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-studio-pink shadow-[0_0_8px_#FF66C4] animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {/* Icons (Cart, Instagram, Login) */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3.5 flex-shrink-0">
            <a 
              href="https://www.instagram.com/tattooplatz_zurich" 
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-500 hover:text-studio-pink transition-colors duration-200 p-1"
            >
              <Instagram size={20} />
            </a>

            <button 
              onClick={onOpenCart}
              className="relative p-2 text-zinc-500 hover:text-studio-pink transition-colors duration-200"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-black bg-studio-pink rounded-full shadow-[0_0_5px_#FF66C4]">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onLoginClick}
              className="px-3 xl:px-4 py-1.5 bg-zinc-950 hover:bg-studio-pink text-white hover:text-black text-[9px] xl:text-[10px] font-black tracking-widest uppercase transition-all duration-300 rounded-full flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_12px_rgba(255,102,196,0.45)] border border-zinc-800 hover:border-studio-pink"
            >
              <User size={11} className="flex-shrink-0" />
              LOGIN
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-zinc-500 hover:text-studio-pink transition-colors duration-200"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-black bg-studio-pink rounded-full shadow-[0_0_5px_#FF66C4]">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-500 hover:text-black p-2 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-4 pt-2 pb-6 space-y-2 animate-slide-up">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavClick(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-3 rounded-lg text-base font-medium transition-all ${
                activeSection === item.id 
                  ? 'bg-zinc-50 text-studio-pink border-l-4 border-studio-pink' 
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-100">
            <button
              onClick={() => {
                onLoginClick?.();
                setIsOpen(false);
              }}
              className="w-full py-3 bg-black text-white hover:bg-studio-pink hover:text-black text-xs font-black tracking-widest uppercase transition-colors rounded-full flex items-center justify-center gap-2"
            >
              <User size={14} />
              Login Portal
            </button>
            <a 
              href="https://www.instagram.com/tattooplatz_zurich" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-zinc-500 hover:text-studio-pink transition-colors py-2"
            >
              <Instagram size={20} />
              <span className="text-sm">Instagram</span>
            </a>
        </div>
      </div>
      )}
    </nav>
  );
}
