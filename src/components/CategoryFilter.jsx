import React from 'react';
import { 
  Sparkles, 
  Heart, 
  Gamepad2, 
  Flame, 
  Clock, 
  Zap, 
  Puzzle, 
  Coffee,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Games', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: 'Featured', label: 'Featured', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'Favorites', label: 'Favorites', icon: <Heart className="w-3.5 h-3.5 text-rose-400" /> },
  { id: 'Arcade', label: 'Arcade', icon: <Flame className="w-3.5 h-3.5 text-cyan-400" /> },
  { id: 'Action', label: 'Action', icon: <Zap className="w-3.5 h-3.5 text-pink-400" /> },
  { id: 'Retro', label: 'Retro', icon: <Clock className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'Puzzle', label: 'Puzzle', icon: <Puzzle className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'Casual', label: 'Casual', icon: <Coffee className="w-3.5 h-3.5 text-yellow-400" /> },
];

export const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  favoritesCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {cat.id === 'Favorites' && favoritesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-slate-950 text-cyan-400' : 'bg-rose-500 text-white'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="az">A to Z</option>
          <option value="category">Category</option>
        </select>
      </div>

    </div>
  );
};
