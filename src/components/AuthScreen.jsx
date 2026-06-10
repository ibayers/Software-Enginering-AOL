import React, { useState } from 'react';
import { MapPin, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Email atau password salah');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(email, password, fullName);
      if (!data.session) {
        setSuccess('Pendaftaran berhasil! Cek email Anda untuk verifikasi akun.');
      }
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Email sudah terdaftar. Silakan login.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Link reset password telah dikirim ke email Anda.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setShowForgot(false);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };

  // ─── Forgot Password Screen ───
  if (showForgot) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600">
        <div className="flex-1 flex flex-col justify-center px-8">
          <div className="mb-8">
            <button onClick={() => { setShowForgot(false); setError(''); setSuccess(''); }} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-sm">
              <ArrowLeft size={16} /> Kembali ke Login
            </button>
            <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
            <p className="text-indigo-200 text-sm">Masukkan email untuk menerima link reset password.</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-white text-xs p-3 rounded-xl mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-500/20 border border-emerald-400/30 text-white text-xs p-3 rounded-xl mb-4">{success}</div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
              <input
                type="email"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/15 border border-white/20 text-white placeholder:text-indigo-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-50 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Login / Register Screen ───
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
      <div className="absolute top-32 right-8 w-20 h-20 bg-white/5 rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full" />

      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        {/* Logo & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
              <MapPin size={24} className="text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Voyager Go</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {isLogin ? 'Selamat Datang!' : 'Buat Akun Baru'}
          </h1>
          <p className="text-indigo-200 text-sm">
            {isLogin
              ? 'Masuk untuk melanjutkan perjalanan Anda'
              : 'Daftar untuk mulai menjelajah destinasi'
            }
          </p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-white text-xs p-3 rounded-xl mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-500/20 border border-emerald-400/30 text-white text-xs p-3 rounded-xl mb-4">{success}</div>
        )}

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3.5">
          {!isLogin && (
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-white/15 border border-white/20 text-white placeholder:text-indigo-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/15 border border-white/20 text-white placeholder:text-indigo-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/15 border border-white/20 text-white placeholder:text-indigo-300 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white/15 border border-white/20 text-white placeholder:text-indigo-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-indigo-700 font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:75ms]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:150ms]" />
              </span>
            ) : (
              isLogin ? 'Masuk' : 'Daftar'
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          {isLogin && (
            <button
              onClick={() => { setShowForgot(true); setError(''); setSuccess(''); }}
              className="text-indigo-200 text-xs hover:text-white transition-colors block mx-auto"
            >
              Lupa Password?
            </button>
          )}
          <p className="text-indigo-200 text-xs">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button
              onClick={() => switchMode(!isLogin)}
              className="text-white font-bold hover:underline ml-1"
            >
              {isLogin ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
