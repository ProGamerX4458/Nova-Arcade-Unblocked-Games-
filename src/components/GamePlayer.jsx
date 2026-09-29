import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  Share2, 
  Heart, 
  Star, 
  Code, 
  Copy, 
  Check, 
  Gamepad2, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { openGameInNewTab } from '../utils/cloak.js';

export const GamePlayer = ({
  game,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectGame,
  allGames
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [inlineHtml, setInlineHtml] = useState(game.htmlContent || null);

  useEffect(() => {
    setInlineHtml(game.htmlContent || null);
    if (!game.htmlContent && game.iframeUrl && game.iframeUrl.startsWith('/')) {
      fetch(game.iframeUrl)
        .then(res => res.text())
        .then(text => {
          if (text && text.includes('<html')) {
            setInlineHtml(text);
          }
        })
        .catch(err => console.warn('Could not prefetch game HTML:', err));
    }
  }, [game]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
    }
  };

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    const embedCode = game.embedHtml || `<iframe src="${game.iframeUrl}" width="100%" height="600" frameborder="0" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleAboutBlank = () => {
    openGameInNewTab(game.iframeUrl, game.title, inlineHtml || game.htmlContent);
  };

  const relatedGames = allGames
    .filter(g => g.id !== game.id && (g.category === game.category || g.featured))
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-cyan-400 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Games</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Cloaked Separate Tab Button */}
          <button
            onClick={handleAboutBlank}
            title="Load this game on a separate tab (about:blank cloaked)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
            <span>Open in Separate Tab</span>
          </button>

          {/* Share Link */}
          <button
            onClick={handleShareLink}
            title="Copy share link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Favorite toggle */}
          <button
            onClick={(e) => onToggleFavorite(game.id, e)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Game Player Frame Container */}
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all ${
          isTheater ? 'max-w-none' : 'max-w-5xl mx-auto'
        }`}
      >
        {/* Frame Top Toolbar */}
        <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">{game.icon || '🎮'}</span>
            <span className="font-extrabold text-slate-100">{game.title}</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-cyan-400 uppercase">
              {game.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in Separate Tab button */}
            <button
              onClick={handleAboutBlank}
              title="Pop out game into a separate stealth tab (about:blank)"
              className="p-1.5 rounded-md hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline text-[11px] font-semibold">Separate Tab</span>
            </button>

            {/* Reload button */}
            <button
              onClick={handleReload}
              title="Reload game frame"
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Theater Mode toggle */}
            {!isFullscreen && (
              <button
                onClick={() => setIsTheater(!isTheater)}
                title={isTheater ? 'Exit theater mode' : 'Theater mode'}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors hidden sm:block cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* The Game Iframe */}
        <div 
          className={`w-full relative bg-slate-950 ${
            isFullscreen ? 'h-[calc(100vh-45px)]' : 'h-[550px] sm:h-[620px] lg:h-[700px]'
          }`}
        >
          <iframe
            key={reloadKey}
            id={game.frameId || "sandboxFrame"}
            ref={iframeRef}
            src={inlineHtml ? undefined : game.iframeUrl}
            srcDoc={inlineHtml || undefined}
            title={game.title}
            className="w-full h-full border-0 select-none"
            allow={game.allow || "accelerometer *; autoplay *; camera *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *; geolocation *; gyroscope *; local-network-access *; magnetometer *; microphone *; midi *; payment *; picture-in-picture *; screen-wake-lock *; sync-xhr *; usb *; web-share *"}
            sandbox={game.sandbox || undefined}
          />
        </div>

        {/* Frame Footer Controls Hint */}
        <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Running in Sandboxed Iframe (Unblocked)</span>
          </div>

          <button
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Code className="w-3 h-3 text-cyan-400" />
            <span>{showEmbedCode ? 'Hide Embed Code' : 'Get Embed Code'}</span>
          </button>
        </div>
      </div>

      {/* Embed Code Snippet Drawer */}
      {showEmbedCode && (
        <div className="max-w-5xl mx-auto p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              Iframe Embed Code (as stored in games.json)
            </span>
            <button
              onClick={handleCopyEmbed}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold cursor-pointer"
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmbed ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
            {game.embedHtml || `<iframe src="${game.iframeUrl}" width="100%" height="600" frameborder="0" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe>`}
          </pre>
        </div>
      )}

      {/* Game Details & Controls Cards Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Controls Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-100 font-extrabold text-sm">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>How to Play / Controls</span>
          </div>

          <div className="space-y-2">
            {game.controls.map((ctrl, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>{ctrl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Info Panel */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-black text-slate-100">{game.title}</h2>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-800">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{game.rating}</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              {game.description}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {game.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span>Game ID: <code className="text-cyan-400">{game.id}</code></span>
              <span className="truncate max-w-[280px]">Loaded via: <code className="text-slate-400 truncate">{game.iframeUrl}</code></span>
            </div>
          </div>
        </div>

      </div>

      {/* More Like This / Related Games */}
      {relatedGames.length > 0 && (
        <div className="max-w-5xl mx-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-cyan-400" />
            <h3 className="font-extrabold text-slate-100 text-base">You Might Also Like</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedGames.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectGame(rel)}
                className="group p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
              >
                <div 
                  className="h-20 rounded-lg flex items-center justify-center text-3xl mb-2"
                  style={{ background: rel.bgGradient || 'linear-gradient(135deg, #1e293b, #0f172a)' }}
                >
                  <span className="group-hover:scale-110 transition-transform">{rel.icon || '🎮'}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                  {rel.title}
                </h4>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  {rel.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
