import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, userName, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Logout gagal:', err.message);
    }
  };

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full pl-2 pr-2.5 py-1.5 hover:bg-white/25 transition-colors"
      >
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-indigo-700 font-black text-xs">
          {initials}
        </div>
        <span className="text-white text-[11px] font-semibold max-w-[80px] truncate hidden sm:block">
          {userName}
        </span>
        <ChevronDown size={12} className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
          <div className="p-3 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
