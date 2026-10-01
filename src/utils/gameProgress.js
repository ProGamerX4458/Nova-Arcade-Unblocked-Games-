/**
 * Nova Arcade Game Progress & Save System
 * Manages persistent save states, high scores, levels, and playtime for all games in localStorage.
 */

const STORAGE_KEY = 'nova_game_progress';

// Helper to get raw progress dictionary
export function getAllProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading game progress:', err);
    return {};
  }
}

// Get progress for a specific game
export function getGameProgress(gameId) {
  if (!gameId) return null;
  const all = getAllProgress();
  return all[gameId] || {
    highScore: 0,
    highestLevel: 1,
    gamesPlayed: 0,
    lastScore: 0,
    lastPlayed: null,
    customStats: {}
  };
}

// Save or update progress for a specific game
export function saveGameProgress(gameId, updates = {}) {
  if (!gameId) return;
  try {
    const all = getAllProgress();
    const existing = all[gameId] || {
      highScore: 0,
      highestLevel: 1,
      gamesPlayed: 0,
      lastScore: 0,
      lastPlayed: null,
      customStats: {}
    };

    const newHighScore = Math.max(
      existing.highScore || 0,
      typeof updates.highScore === 'number' ? updates.highScore : 0,
      typeof updates.score === 'number' ? updates.score : 0
    );

    const newHighestLevel = Math.max(
      existing.highestLevel || 1,
      typeof updates.highestLevel === 'number' ? updates.highestLevel : 1,
      typeof updates.level === 'number' ? updates.level : 1,
      typeof updates.wave === 'number' ? updates.wave : 1
    );

    const newGamesPlayed = (existing.gamesPlayed || 0) + (updates.gameFinished ? 1 : 0);

    const merged = {
      ...existing,
      highScore: newHighScore,
      highestLevel: newHighestLevel,
      gamesPlayed: newGamesPlayed > 0 ? newGamesPlayed : (existing.gamesPlayed || 1),
      lastScore: typeof updates.lastScore === 'number' ? updates.lastScore : (typeof updates.score === 'number' ? updates.score : existing.lastScore),
      lastPlayed: Date.now(),
      customStats: {
        ...(existing.customStats || {}),
        ...(updates.customStats || {})
      }
    };

    all[gameId] = merged;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Also sync legacy keys for backward compatibility
    syncLegacyKeys(gameId, merged);

    // Notify all components in the app
    window.dispatchEvent(new CustomEvent('nova_progress_updated', {
      detail: { gameId, progress: merged }
    }));

    return merged;
  } catch (err) {
    console.error('Error saving game progress:', err);
  }
}

// Reset progress for one game
export function clearGameProgress(gameId) {
  if (!gameId) return;
  try {
    const all = getAllProgress();
    delete all[gameId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Clear legacy keys
    clearLegacyKeys(gameId);

    window.dispatchEvent(new CustomEvent('nova_progress_updated', {
      detail: { gameId, progress: null }
    }));
  } catch (err) {
    console.error('Error clearing game progress:', err);
  }
}

// Reset progress for all games
export function clearAllGameProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('nova_progress_updated', { detail: { allCleared: true } }));
  } catch (err) {}
}

// Sync with individual game localStorage keys
function syncLegacyKeys(gameId, progress) {
  try {
    if (gameId === 't-rex-runner' && progress.highScore) {
      localStorage.setItem('nova_trex_high_score', progress.highScore.toString());
    } else if (gameId === 'pacman' && progress.highScore) {
      localStorage.setItem('nova_pacman_high', progress.highScore.toString());
    } else if (gameId === 'retro-snake' && progress.highScore) {
      localStorage.setItem('nexus_snake_best', progress.highScore.toString());
    } else if (gameId === 'clumsy-bird' && progress.highScore) {
      localStorage.setItem('nova_clumsy_bird_best', progress.highScore.toString());
    } else if (gameId === 'neon-breakout' && progress.highScore) {
      localStorage.setItem('nova_breakout_high', progress.highScore.toString());
      localStorage.setItem('nova_breakout_max_level', (progress.highestLevel || 1).toString());
    } else if (gameId === 'retro-asteroids' && progress.highScore) {
      localStorage.setItem('nova_asteroids_high', progress.highScore.toString());
    } else if (gameId === 'neon-pong' && progress.highScore) {
      localStorage.setItem('nova_pong_streak', progress.highScore.toString());
    }
  } catch (e) {}
}

function clearLegacyKeys(gameId) {
  try {
    if (gameId === 't-rex-runner') localStorage.removeItem('nova_trex_high_score');
    if (gameId === 'pacman') localStorage.removeItem('nova_pacman_high');
    if (gameId === 'retro-snake') localStorage.removeItem('nexus_snake_best');
    if (gameId === 'clumsy-bird') localStorage.removeItem('nova_clumsy_bird_best');
    if (gameId === 'neon-breakout') {
      localStorage.removeItem('nova_breakout_high');
      localStorage.removeItem('nova_breakout_max_level');
    }
    if (gameId === 'retro-asteroids') localStorage.removeItem('nova_asteroids_high');
    if (gameId === 'neon-pong') localStorage.removeItem('nova_pong_streak');
  } catch (e) {}
}

// Global message listener for iframe postMessage
let listenerInitialized = false;
export function initProgressMessageListener() {
  if (listenerInitialized || typeof window === 'undefined') return;
  listenerInitialized = true;

  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;

    if (event.data.type === 'NOVA_SAVE_PROGRESS') {
      const { gameId, ...data } = event.data;
      if (gameId) {
        saveGameProgress(gameId, data);
      }
    }
  });
}
