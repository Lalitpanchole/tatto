import React from 'react';
import { User, ShieldAlert, Mail, Lock, ArrowLeft, Sparkles, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onBack, registeredArtists = [] }) {
  const [role, setRole] = React.useState('artist'); // 'artist' | 'admin'
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Forgot Password / OTP Modal States
  const [isForgotOpen, setIsForgotOpen] = React.useState(false);
  const [forgotStep, setForgotStep] = React.useState('email'); // 'email' | 'otp' | 'new_password'
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [forgotError, setForgotError] = React.useState('');
  const [forgotSuccess, setForgotSuccess] = React.useState('');

  // Clear inputs and errors on tab change
  React.useEffect(() => {
    setError('');
    setEmail('');
    setPassword('');
  }, [role]);

  // Handler: Send 6-digit OTP code to email
  const handleSendOTP = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const { authAPI } = await import('../services/api.js');
      const res = await authAPI.requestOTP(forgotEmail.toLowerCase().trim());
      setForgotLoading(false);
      setForgotStep('otp');
      setForgotSuccess(`Verification code sent to ${forgotEmail}. Please check your inbox.`);
    } catch (err) {
      setForgotLoading(false);
      setForgotError(err.message || 'Failed to send OTP. Please check email address.');
    }
  };

  // Handler: Verify OTP code
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setForgotError('Please enter the full 6-digit OTP code');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const { authAPI } = await import('../services/api.js');
      await authAPI.verifyOTP(forgotEmail.toLowerCase().trim(), otpCode.trim());
      setForgotLoading(false);
      setForgotSuccess('OTP verified successfully!');
      setForgotStep('new_password');
    } catch (err) {
      setForgotLoading(false);
      setForgotError(err.message || 'Invalid or expired OTP code.');
    }
  };

  // Handler: Reset Password using OTP
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const { authAPI } = await import('../services/api.js');
      const res = await authAPI.resetPasswordOTP(forgotEmail.toLowerCase().trim(), otpCode.trim(), newPassword.trim());
      setForgotLoading(false);

      // Set credentials on form and transition to professional success view
      setEmail(forgotEmail);
      setPassword(newPassword);
      setForgotStep('success');
      setError('');
    } catch (err) {
      setForgotLoading(false);
      setForgotError(err.message || 'Failed to reset password. Please try again.');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { authAPI } = await import('../services/api.js');
      const res = await authAPI.login({ email: email.toLowerCase().trim(), password: password.trim() });
      setIsLoading(false);

      // Verify account role matches selected login tab
      if (res.user.role !== role) {
        setError(
          role === 'admin'
            ? 'This is an Artist account. Please switch to the "Artist Login" tab.'
            : 'This is a Studio Manager account. Please switch to the "Studio Manager" tab.'
        );
        return;
      }

      if (res.token) {
        localStorage.setItem('tattooplatz_token', res.token);
      }

      const profile = {
        name: res.user.name,
        role: res.user.role,
        email: res.user.email,
        password: password,
        phone: res.user.phone,
        ig: res.user.instagram,
        bio: res.user.bio || res.user.short_biography || ''
      };
      localStorage.setItem('tattooplatz_current_user', JSON.stringify(profile));

      onLoginSuccess?.(profile);
    } catch (err) {
      setIsLoading(false);
      
      // If server responded with 401 / error message, display exact message
      if (err.message && !err.message.toLowerCase().includes('failed to fetch')) {
        setError(err.message);
        return;
      }

      // Fallback local auth ONLY if server is completely offline / unreachable
      const checkEmail = email?.toLowerCase().trim();
      const checkPassword = password?.trim();

      // All studio admin team members (offline fallback only)
      const adminEmails = [
        'chris@tattooplatz.ch',
        'admin@tattooplatz.ch',
        'bea@tattooplatz.ch',
        'lucy@tattooplatz.ch',
        'tuli@tattooplatz.ch',
        'dani@tattooplatz.ch',
        'leonie@tattooplatz.ch',
      ];
      const adminNames = {
        'chris@tattooplatz.ch':  'Chris (Co-Founder)',
        'admin@tattooplatz.ch':  'Admin',
        'bea@tattooplatz.ch':    'Bea',
        'lucy@tattooplatz.ch':   'Lucy',
        'tuli@tattooplatz.ch':   'Tuli',
        'dani@tattooplatz.ch':   'Dani',
        'leonie@tattooplatz.ch': 'Leonie',
      };

      if (role === 'artist') {
        const matched = registeredArtists.find(
          (a) => a.email?.toLowerCase().trim() === checkEmail &&
                 a.password === checkPassword &&
                 a.status === 'Active'
        );
        if (matched) {
          onLoginSuccess?.({ name: matched.name, role: 'artist', email: matched.email, phone: matched.phone, ig: matched.ig, bio: matched.bio || '' });
        } else if (checkEmail === 'artist@tattooplatz.ch' && checkPassword === 'artist123') {
          onLoginSuccess?.({ name: 'Demo Artist', role: 'artist', email: checkEmail, bio: '' });
        } else {
          setError('Invalid credentials. Please verify email and password.');
        }
      } else {
        // Admin fallback
        if (adminEmails.includes(checkEmail) && (checkPassword === 'admin123' || checkPassword === 'TattoPlatz@2026')) {
          const name = adminNames[checkEmail] || 'Admin';
          onLoginSuccess?.({ name, role: 'admin', email: checkEmail });
        } else {
          setError('Invalid credentials. Please contact support or retry.');
        }
      }
    }
  };


  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col justify-center items-center px-4 relative overflow-hidden py-20">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-studio-pink/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-studio-lightpink/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      
      {/* Back button with micro-animation */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2.5 text-[10px] font-black text-zinc-500 hover:text-black uppercase tracking-widest transition-all duration-200 bg-white hover:bg-zinc-55 border border-zinc-200/80 px-5 py-3 rounded-xl shadow-2xs hover:shadow-xs group"
      >
        <ArrowLeft size={12} className="text-zinc-500 group-hover:text-black group-hover:-translate-x-0.5 transition-transform duration-200" /> 
        Back to website
      </button>

      <div className="w-full max-w-[430px] relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo-1.png" alt="Tattooplatz Logo" className="h-10 sm:h-11 w-auto object-contain mb-3" />
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
            GUEST & STUDIO PORTAL
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06),_0_0_50px_rgba(255,102,196,0.02)] p-8 sm:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06),_0_0_50px_rgba(255,102,196,0.04)]">
          
          {/* Top Line Gradient Accent */}
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-studio-pink via-studio-lightpink to-studio-pink shadow-[0_2px_12px_rgba(255,102,196,0.3)]" />

          {/* Role selector switcher */}
          <div className="grid grid-cols-2 gap-2.5 bg-zinc-100/80 p-1 rounded-xl mb-8 border border-zinc-200/50">
            <button
              type="button"
              onClick={() => setRole('artist')}
              className={`py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 rounded-lg flex items-center justify-center gap-2 ${
                role === 'artist'
                  ? 'bg-black text-white shadow-md font-black'
                  : 'text-zinc-500 hover:text-black bg-transparent'
              }`}
            >
              <User size={13} className={role === 'artist' ? 'text-studio-pink' : ''} />
              Tattoo Artist
            </button>
            
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 rounded-lg flex items-center justify-center gap-2.5 ${
                role === 'admin'
                  ? 'bg-black text-white shadow-md font-black'
                  : 'text-zinc-500 hover:text-black bg-transparent'
              }`}
            >
              <ShieldAlert size={13} className={role === 'admin' ? 'text-studio-pink' : ''} />
              Studio Manager
            </button>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xs font-black text-black uppercase tracking-widest mb-2">
              {role === 'artist' ? 'ARTIST PORTAL LOGIN' : 'STUDIO ADMIN LOGIN'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium font-sans leading-normal">
              Enter your credentials to access your secure co-working workspace dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-pink-50/80 border border-pink-200 rounded-xl text-black text-xs font-semibold flex items-start gap-3 animate-fade-in">
              <ShieldAlert size={15} className="text-pink-500 flex-shrink-0 mt-0.5" />
              <span className="leading-snug text-black font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none group-focus-within:text-studio-pink transition-colors">
                  <Mail size={15} />
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50/40 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/10 transition-all duration-200 font-sans"
                  placeholder={role === 'admin' ? 'admin@tattooplatz.ch' : 'artist@tattooplatz.ch'}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || '');
                    setForgotStep('email');
                    setForgotError('');
                    setForgotSuccess('');
                    setIsForgotOpen(true);
                  }}
                  className="text-[9px] font-extrabold text-studio-pink hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none group-focus-within:text-studio-pink transition-colors">
                  <Lock size={15} />
                </span>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-zinc-50/40 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/10 transition-all duration-200 font-sans"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-studio-pink transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-350 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-[0_4px_15px_rgba(255,102,196,0.3)] disabled:opacity-50 mt-8 hover:scale-[1.01] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles size={14} className="animate-spin text-studio-pink" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  SIGN IN TO PORTAL
                </>
              )}
            </button>

          </form>
        </div>

      </div>

      {/* Forgot Password OTP Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-studio-pink via-studio-lightpink to-studio-pink" />
            
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                <Lock size={14} className="text-studio-pink" /> Reset Password via OTP
              </h4>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="text-zinc-400 hover:text-black font-extrabold text-xs"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="mb-5 p-3.5 bg-pink-50/80 border border-pink-200 rounded-xl text-black text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-fade-in">
                <ShieldAlert size={16} className="text-pink-500 flex-shrink-0" />
                <span className="leading-snug text-black font-bold">{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-5 p-3.5 bg-pink-50/80 border border-pink-200 rounded-xl text-black text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-fade-in">
                <CheckCircle size={16} className="text-pink-500 flex-shrink-0" />
                <span className="leading-snug text-black font-bold">{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 'email' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 font-medium">
                  Enter your registered admin or artist email address. We will send a 6-digit OTP code to verify your identity.
                </p>
                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@tattooplatz.ch"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-bold rounded-xl focus:border-studio-pink focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={forgotLoading}
                  onClick={handleSendOTP}
                  className="w-full py-3.5 bg-black hover:bg-studio-pink hover:text-black text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Sparkles size={14} className="animate-spin" /> : null}
                  SEND OTP VERIFICATION CODE
                </button>
              </div>
            )}

            {/* STEP 2: Enter 6-digit OTP */}
            {forgotStep === 'otp' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 font-medium">
                  We sent a 6-digit code to <strong className="text-black">{forgotEmail}</strong>. Please enter the OTP code below.
                </p>
                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-center font-mono text-lg font-black tracking-[0.3em] rounded-xl focus:border-studio-pink focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="w-1/3 py-3 bg-zinc-100 text-zinc-600 font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:bg-zinc-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={forgotLoading || otpCode.length !== 6}
                    onClick={handleVerifyOTP}
                    className="w-2/3 py-3 bg-black hover:bg-studio-pink hover:text-black text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? <Sparkles size={14} className="animate-spin" /> : null}
                    VERIFY CODE
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 'new_password' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 font-medium">
                  OTP Verified! Create your new secure password for <strong className="text-black">{forgotEmail}</strong>.
                </p>
                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-bold rounded-xl focus:border-studio-pink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-bold rounded-xl focus:border-studio-pink focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={forgotLoading || !newPassword}
                  onClick={handleResetPassword}
                  className="w-full py-3.5 bg-black hover:bg-studio-pink hover:text-black text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Sparkles size={14} className="animate-spin" /> : null}
                  SAVE NEW PASSWORD & LOGIN
                </button>
              </div>
            )}

            {/* STEP 4: Password Reset Success */}
            {forgotStep === 'success' && (
              <div className="space-y-5 text-center py-3 animate-fade-in font-sans">
                <div className="mx-auto w-14 h-14 bg-pink-50 text-pink-500 border border-pink-200 rounded-full flex items-center justify-center shadow-xs">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-black">Password Reset Successful</h4>
                  <p className="text-xs text-zinc-550 font-medium mt-1.5 leading-relaxed">
                    Your account password has been updated in the database. You can now log in securely with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(false);
                    setForgotStep('email');
                    setOtpCode('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setForgotSuccess('');
                    setError('');
                  }}
                  className="w-full py-3.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer text-center"
                >
                  PROCEED TO SIGN IN
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

