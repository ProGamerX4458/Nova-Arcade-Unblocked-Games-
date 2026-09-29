import React, { useState, useRef, useEffect } from 'react';
import { 
  Gamepad2, 
  Search, 
  EyeOff, 
  ShieldAlert, 
  Heart, 
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { CLOAK_PRESETS, applyTabCloak } from '../utils/cloak.js';

export const Header = ({
  searchQuery,
  onSearchChange,
  onFavoritesClick,
  onHomeClick,
  favoritesCount,
  totalGamesCount
}) => {
  const [isCloakOpen, setIsCloakOpen] = useState(false);
  const [currentCloak, setCurrentCloak] = useState('default');
  const cloakRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_tab_cloak');
    if (saved) {
      setCurrentCloak(saved);
      applyTabCloak(saved);
    }

    const handleClickOutside = (e) => {
      if (cloakRef.current && !cloakRef.current.contains(e.target)) {
        setIsCloakOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === ']' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        triggerPanic();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectCloak = (presetId) => {
    setCurrentCloak(presetId);
    applyTabCloak(presetId);
    setIsCloakOpen(false);
  };

  const triggerPanic = () => {
    window.location.href = 'https://classroom.google.com';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={onHomeClick}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  NOVA
                </span>
                <span className="font-extrabold text-xl text-slate-100 tracking-wider">
                  ARCADE
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  UNBLOCKED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {totalGamesCount} Free Web Games • JSON Powered
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search games, tags, controls... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  /
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Tab Cloaker Dropdown */}
            <div className="relative" ref={cloakRef}>
              <button
                onClick={() => setIsCloakOpen(!isCloakOpen)}
                title="Cloak browser tab (disguises title and icon)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Tab Cloak</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isCloakOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-800">
                    Disguise Tab Title & Favicon
                  </div>
                  <div className="py-1">
                    {CLOAK_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectCloak(p.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentCloak === p.id 
                            ? 'bg-cyan-500/15 text-cyan-300 font-semibold' 
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={p.icon} 
                            alt="" 
                            className="w-4 h-4 rounded-sm object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span>{p.name}</span>
                        </div>
                        {currentCloak === p.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panic Button */}
            <button
              onClick={triggerPanic}
              title="Panic Key! Redirects immediately to Google Classroom"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 hover:text-rose-100 text-xs font-bold transition-all shadow-sm shadow-rose-900/20 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Panic!</span>
            </button>

            {/* Favorites shortcut */}
            <button
              onClick={onFavoritesClick}
              title="View your favorite games"
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games, tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
