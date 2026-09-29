import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Star, Users, Flame, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';

export const FeaturedBanner = ({ games, onPlayGame }) => {
  const featured = games.filter(g => g.featured);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const game = featured[currentIndex] || featured[0];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-sm mb-8">
      {/* Background ambient lighting */}
      <div 
        className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ background: game.themeColor || '#06b6d4' }}
      />
      <div 
        className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
        style={{ background: game.themeColor || '#3b82f6' }}
      />

      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Info Column */}
        <div className="flex-1 max-w-xl text-center md:text-left">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              Featured Unblocked
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {game.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold px-2 py-1 rounded-full bg-slate-800/80">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{game.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium px-2 py-1 rounded-full bg-slate-800/80">
              <Users className="w-3.5 h-3.5" />
              <span>{game.plays.toLocaleString()} plays</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            {game.title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {game.description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => onPlayGame(game)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/30 hover:scale-[1.03] transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              PLAY NOW (NEW TAB)
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3.5 py-2.5 rounded-xl border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Iframe Web Applet</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-1.5">
            {game.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Thumbnail Visual Badge */}
        <div className="shrink-0 relative group">
          <div 
            onClick={() => onPlayGame(game)}
            className="w-48 h-48 sm:w-60 sm:h-60 rounded-2xl flex flex-col items-center justify-center cursor-pointer shadow-2xl relative overflow-hidden transition-transform duration-300 group-hover:scale-105 border-2 border-slate-700 group-hover:border-cyan-400"
            style={{ background: game.bgGradient || 'linear-gradient(135deg, #1e293b, #0f172a)' }}
          >
            <span className="text-6xl sm:text-7xl mb-2 drop-shadow-md select-none">
              {game.icon || '🎮'}
            </span>
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <div className="w-14 h-14 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-400/50">
                <Play className="w-7 h-7 fill-slate-950 ml-1" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Carousel Navigation dots and arrows */}
      {featured.length > 1 && (
        <div className="relative z-10 px-6 pb-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
          <div className="flex items-center gap-1.5">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Previous game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % featured.length)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Next game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
