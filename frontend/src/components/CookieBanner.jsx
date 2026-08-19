import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp, Settings, Check } from 'lucide-react';

export default function CookieBanner({ forceOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Cookie Category Preferences
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false
  });

  const STORAGE_KEY = 'tattooplatz_cookie_consent';
  const EXPIRY_DAYS = 365;

  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
      return;
    }

    try {
      const storedConsent = localStorage.getItem(STORAGE_KEY);
      if (storedConsent) {
        const parsed = JSON.parse(storedConsent);
        const now = new Date().getTime();
        const storedTime = parsed.timestamp || 0;
        const daysPassed = (now - storedTime) / (1000 * 60 * 60 * 24);

        if (daysPassed < EXPIRY_DAYS && parsed.accepted) {
          setIsVisible(false);
          return;
        }
      }
    } catch (e) {
      console.error('Error reading cookie consent state:', e);
    }

    // Small delay for smooth entry animation on fresh visits
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [forceOpen]);

  const saveConsent = (customPrefs) => {
    const consentData = {
      accepted: true,
      version: '1.0',
      timestamp: new Date().getTime(),
      expiryDays: EXPIRY_DAYS,
      preferences: customPrefs || preferences
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.error('Failed to save cookie consent:', e);
    }

    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleAcceptAll = () => {
    const allOn = { essential: true, analytics: true, marketing: true };
    setPreferences(allOn);
    saveConsent(allOn);
  };

  const handleAcceptEssential = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div 
      id="cookie-consent-banner"
      className="fixed bottom-4 sm:bottom-6 left-4 right-4 z-[9999] transition-all duration-700 ease-out font-sans"
    >
      <div className="max-w-5xl mx-auto bg-zinc-950/95 border-2 border-[#FF66C4]/40 text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl overflow-hidden animate-slide-up relative group">
        
        {/* Subtle Ambient Pink Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FF66C4]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF66C4]/30 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FF66C4]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Inner Padding Section */}
        <div className="px-5 py-5 sm:px-7 sm:py-6">
        
        {/* Top Main Section */}
        <div className="py-4 sm:py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 relative z-10">
          
          {/* Header & Body Content */}
          <div className="flex items-start gap-4 max-w-4xl">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#FF66C4]/25 to-black border border-[#FF66C4]/40 flex items-center justify-center shrink-0 text-[#FF66C4] shadow-[0_0_15px_rgba(255,102,196,0.25)] mt-0.5">
              <Cookie className="w-5 h-5 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-wider font-outfit">
                  COOKIE & PRIVACY PREFERENCES
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  Swiss nFADP Compliant
                </span>
              </div>
              
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans font-normal max-w-3xl">
                We use necessary cookies to ensure Tattooplatz operates smoothly. With your consent, optional analytics help us continuously refine your booking experience in accordance with Swiss Data Protection Law (nFADP) & GDPR.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-initial bg-[#FF66C4] hover:bg-[#F4B6DE] text-black font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_20px_rgba(255,102,196,0.4)] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              ACCEPT ALL
            </button>

            <button
              onClick={handleAcceptEssential}
              className="flex-1 sm:flex-initial bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/10 hover:border-white/20 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              ESSENTIAL ONLY
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-[#FF66C4]/40 font-bold text-xs px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Customize Preferences"
            >
              <Settings className="w-3.5 h-3.5 text-[#FF66C4]" />
              <span className="hidden sm:inline uppercase tracking-wider">SETTINGS</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>
          </div>

        </div>

        {/* Expandable Customization Panel */}
        {showDetails && (
          <div className="py-4 pb-6 bg-zinc-900/40 border-t border-white/10 space-y-4 animate-fade-in relative z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#FF66C4]">
                CUSTOMIZE PERMISSIONS
              </h4>
              <span className="text-[11px] text-zinc-400 font-sans">Toggle categories to customize consent</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Essential Cookies */}
              <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-white">Essential</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full uppercase">ALWAYS ACTIVE</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Required for station bookings, artist login session security, and system stability.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-white">Analytics</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#FF66C4]"></div>
                    </label>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Helps us understand user traffic to continuously enhance booking speed and UI response.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-white">Marketing</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#FF66C4]"></div>
                    </label>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Enables tailored guest artist highlights and studio merchandise updates.
                  </p>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/10 text-xs text-zinc-400 gap-3">
              <a 
                href="/privacy-policy" 
                className="hover:text-[#FF66C4] transition-colors flex items-center gap-1.5 font-medium underline decoration-white/20 underline-offset-4"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF66C4]" />
                Read Swiss Legal Privacy Policy
              </a>

              <button
                onClick={handleSavePreferences}
                className="bg-[#FF66C4] hover:bg-[#F4B6DE] text-black font-black text-xs uppercase tracking-wider px-5 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(255,102,196,0.3)] ml-auto cursor-pointer"
              >
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
