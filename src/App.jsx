/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.jsx';
import { FeaturedBanner } from './components/FeaturedBanner.jsx';
import { CategoryFilter } from './components/CategoryFilter.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { DEFAULT_GAMES } from './data/defaultGames.js';
import { openGameInNewTab } from './utils/cloak.js';
import { initProgressMessageListener, getAllProgress, clearGameProgress } from './utils/gameProgress.js';
import { Gamepad2, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState(DEFAULT_GAMES);
  const [activeGame, setActiveGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [progressData, setProgressData] = useState(() => getAllProgress());

  // Listen for real-time progress updates from game iframes
  useEffect(() => {
    initProgressMessageListener();

    const handleProgressUpdate = () => {
      setProgressData(getAllProgress());
    };

    window.addEventListener('nova_progress_updated', handleProgressUpdate);
    return () => {
      window.removeEventListener('nova_progress_updated', handleProgressUpdate);
    };
  }, []);

  // Load games from /games.json and merge custom games from localStorage
  useEffect(() => {
    const loadGames = async () => {
      let baseGames = DEFAULT_GAMES;
      try {
        const base = import.meta.env.BASE_URL || './';
        const url = `${base.replace(/\/$/, '')}/games.json`;
        let res = null;
        try {
          res = await fetch(url);
        } catch {
          res = await fetch('./games.json').catch(() => null);
        }
        if (res && res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            baseGames = json.map(g => {
              const match = DEFAULT_GAMES.find(d => d.id === g.id);
              return match ? { ...match, ...g, htmlContent: g.htmlContent || match.htmlContent } : g;
            });
          }
        }
      } catch (err) {
        console.warn('Using built-in games data fallback:', err);
      }

      setGames(baseGames);

      // Check query parameter ?game=id
      const params = new URLSearchParams(window.location.search);
      const gameParam = params.get('game');
      if (gameParam) {
        const found = baseGames.find(g => g.id === gameParam);
        if (found) {
          setActiveGame(found);
        }
      }
    };

    loadGames();

    // Load favorites
    const savedFavs = localStorage.getItem('nexus_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  // Update query param when active game changes & launch in separate tab
  const handleSelectGame = (game) => {
    // Open in separate tab strictly in about:blank
    openGameInNewTab(game.iframeUrl, game.title, game.htmlContent);

    setActiveGame(game);
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.id);
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLobby = () => {
    setActiveGame(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.toString());
  };

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('nexus_favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleResetProgress = (gameId) => {
    clearGameProgress(gameId);
    setProgressData(getAllProgress());
  };

  // Filter & Sort games
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Category filter
        if (selectedCategory === 'Featured' && !game.featured) return false;
        if (selectedCategory === 'Favorites' && !favorites.includes(game.id)) return false;
        if (selectedCategory === 'InProgress') {
          const p = progressData[game.id];
          if (!p || (!p.highScore && !p.gamesPlayed)) return false;
        }
        if (!['All', 'Featured', 'Favorites', 'InProgress'].includes(selectedCategory) && game.category !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = game.title?.toLowerCase().includes(q);
          const matchDesc = game.description?.toLowerCase().includes(q);
          const matchCat = game.category?.toLowerCase().includes(q);
          const matchTags = game.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.plays || 0) - (a.plays || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        return 0;
      });
  }, [games, selectedCategory, searchQuery, sortBy, favorites]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* Top Header & Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFavoritesClick={() => {
          setSelectedCategory('Favorites');
          if (activeGame) setActiveGame(null);
        }}
        onHomeClick={handleBackToLobby}
        favoritesCount={favorites.length}
        totalGamesCount={games.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeGame ? (
          /* Active Game Player View */
          <GamePlayer
            game={activeGame}
            isFavorite={favorites.includes(activeGame.id)}
            onToggleFavorite={handleToggleFavorite}
            onBack={handleBackToLobby}
            onSelectGame={handleSelectGame}
            allGames={games}
            progress={progressData[activeGame.id]}
            onResetProgress={handleResetProgress}
          />
        ) : (
          /* Games Catalog View */
          <>
            {/* Top Featured Hero Banner (shown on 'All' or when not actively searching) */}
            {selectedCategory === 'All' && !searchQuery && games.length > 0 && (
              <FeaturedBanner
                games={games}
                onPlayGame={handleSelectGame}
              />
            )}

            {/* Filter Pills & Sorting */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              favoritesCount={favorites.length}
              progressCount={Object.values(progressData).filter(p => p && (p.highScore > 0 || p.gamesPlayed > 0)).length}
            />

            {/* Games Grid Header / Results Count */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
              <span className="font-semibold">
                Showing <strong className="text-slate-100">{filteredGames.length}</strong> {selectedCategory === 'All' ? 'unblocked' : (selectedCategory === 'InProgress' ? 'in-progress' : selectedCategory)} games
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onPlay={handleSelectGame}
                    progress={progressData[game.id]}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
                <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-200 mb-1">No games found</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
                  {selectedCategory === 'Favorites'
                    ? "You haven't added any games to your favorites yet. Click the heart icon on any game to bookmark it!"
                    : (searchQuery
                      ? "No games matched your search criteria."
                      : "There are currently no games in the library.")}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      Show All Games
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-200 tracking-wider">
                  NOVA ARCADE
                </span>
                <p className="text-[11px] text-slate-500">
                  Unblocked Web Games Portal
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Ad-Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Tab Cloak & Panic Key</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>No AI / Pure HTML5</span>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
            Nova Arcade operates entirely client-side. Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">]</kbd> anytime for emergency panic redirect to google.com.
          </div>
        </div>
      </footer>

    </div>
  );
}
