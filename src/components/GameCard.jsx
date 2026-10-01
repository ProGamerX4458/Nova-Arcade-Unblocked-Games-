import React from 'react';
import { Play, Star, Users, Heart, ExternalLink, Trophy } from 'lucide-react';

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onPlay,
  progress
}) => {
  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Thumbnail Card Banner */}
      <div 
        className="h-36 sm:h-40 w-full relative flex items-center justify-center overflow-hidden"
        style={{ background: game.bgGradient || 'linear-gradient(135deg, #1e293b, #0f172a)' }}
      >
        {/* Ambient glow */}
        <div 
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ background: `radial-gradient(circle at center, ${game.themeColor || '#38bdf8'}, transparent 70%)` }}
        />

        {/* Big Game Icon */}
        <span className="text-5xl sm:text-6xl drop-shadow-lg select-none group-hover:scale-110 transition-transform duration-300">
          {game.icon || '🎮'}
        </span>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {game.badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-sm text-cyan-400 border border-cyan-500/30">
              {game.badge}
            </span>
          )}
          {game.isCustom && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/30 backdrop-blur-sm text-purple-300 border border-purple-500/40">
              CUSTOM
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(game.id, e)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors z-10 cursor-pointer"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {/* Hover Overlay Play Icon */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/50 group-hover:scale-110 transition-transform">
            <ExternalLink className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/90">
              {game.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{game.rating}</span>
            </div>
          </div>

          <h3 className="font-extrabold text-base text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
            {game.title}
          </h3>

          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-2.5">
            {game.description}
          </p>

          {/* Saved Progress Indicator */}
          {progress && (progress.highScore > 0 || progress.gamesPlayed > 0) && (
            <div className="mb-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-bold text-cyan-300">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Best: {progress.highScore ? progress.highScore.toLocaleString() : 'Saved'}</span>
              </span>
              {progress.highestLevel > 1 ? (
                <span className="text-[10px] font-semibold text-slate-400">
                  Lvl {progress.highestLevel}
                </span>
              ) : progress.gamesPlayed > 0 ? (
                <span className="text-[10px] font-semibold text-slate-400">
                  {progress.gamesPlayed}x played
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer info: plays count and tags */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{game.plays.toLocaleString()} plays</span>
          </div>

          <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
            Play (New Tab) <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
