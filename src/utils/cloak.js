export const CLOAK_PRESETS = [
  {
    id: 'default',
    name: 'Default (Nova Arcade)',
    title: 'Nova Arcade - Unblocked Games Portal',
    icon: '/favicon.ico'
  },
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes',
    icon: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    title: 'Dashboard',
    icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    title: 'Wikipedia, the free encyclopedia',
    icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
  },
  {
    id: 'desmos',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    icon: 'https://www.desmos.com/favicon.ico'
  }
];

export function applyTabCloak(presetId) {
  const preset = CLOAK_PRESETS.find(p => p.id === presetId) || CLOAK_PRESETS[0];
  document.title = preset.title;

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = preset.icon;

  localStorage.setItem('nexus_tab_cloak', presetId);
}

/**
 * Resolves game URLs cleanly relative to the current application base path
 * Prevents dropping repository sub-path on GitHub Pages (e.g. user.github.io/my-arcade/games/...)
 */
export function resolveGameUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Remove leading './' or '/'
  let cleanPath = url;
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.slice(2);
  } else if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }

  const loc = window.location;
  let basePath = loc.pathname || '/';
  if (!basePath.endsWith('/')) {
    const lastSegment = basePath.substring(basePath.lastIndexOf('/') + 1);
    if (lastSegment.includes('.')) {
      // Filename like index.html or play.html
      basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
    } else {
      // Subdirectory like /my-arcade
      basePath = basePath + '/';
    }
  }

  try {
    return new URL(cleanPath, loc.origin + basePath).href;
  } catch {
    return loc.origin + '/' + cleanPath;
  }
}

/**
 * Loads a game on a separate tab strictly using about:blank with an injected full-screen iframe
 * Keeps the URL bar permanently as about:blank and applies active tab cloaking
 */
export function openGameInNewTab(url, title = 'Nova Arcade', htmlContent = null) {
  try {
    const gameUrl = resolveGameUrl(url);

    // Open clean about:blank window
    let win = null;
    try {
      win = window.open('about:blank', '_blank');
    } catch (e) {
      console.warn("window.open('about:blank') direct call failed:", e);
    }

    if (!win) {
      // Fallback popup trigger via anchor tag
      try {
        const a = document.createElement('a');
        a.href = gameUrl || 'about:blank';
        a.target = '_blank';
        a.rel = 'noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (anchorErr) {
        console.warn("Anchor fallback failed:", anchorErr);
      }
      return false;
    }

    const savedCloak = localStorage.getItem('nexus_tab_cloak') || 'default';
    const preset = CLOAK_PRESETS.find(p => p.id === savedCloak) || CLOAK_PRESETS[0];
    const tabTitle = savedCloak !== 'default' ? preset.title : (title || preset.title);
    const tabIcon = preset.icon || '/favicon.ico';

    let activeHtml = htmlContent;

    const setupDoc = () => {
      try {
        if (!win || win.closed || !win.document) return false;
        const doc = win.document;

        // Set title
        doc.title = tabTitle;

        // Set or update favicon
        if (tabIcon) {
          let link = doc.querySelector("link[rel*='icon']");
          if (!link) {
            link = doc.createElement('link');
            link.rel = 'shortcut icon';
            link.type = 'image/x-icon';
            if (doc.head) doc.head.appendChild(link);
          }
          link.href = tabIcon;
        }

        // Configure body
        if (doc.body) {
          doc.body.style.margin = '0';
          doc.body.style.padding = '0';
          doc.body.style.width = '100vw';
          doc.body.style.height = '100vh';
          doc.body.style.overflow = 'hidden';
          doc.body.style.backgroundColor = '#000';

          let iframe = doc.getElementById('stealth-game-frame');
          if (!iframe) {
            iframe = doc.createElement('iframe');
            iframe.id = 'stealth-game-frame';
            iframe.style.position = 'fixed';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100vw';
            iframe.style.height = '100vh';
            iframe.style.border = 'none';
            iframe.style.outline = 'none';
            iframe.style.margin = '0';
            iframe.style.padding = '0';
            iframe.style.zIndex = '999999';
            iframe.style.backgroundColor = '#000';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('allow', 'accelerometer *; autoplay *; camera *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *; geolocation *; gyroscope *; local-network-access *; magnetometer *; microphone *; midi *; payment *; picture-in-picture *; screen-wake-lock *; sync-xhr *; usb *; web-share *');

            if (activeHtml) {
              iframe.srcdoc = activeHtml;
            } else if (gameUrl) {
              iframe.src = gameUrl;
            }

            doc.body.appendChild(iframe);
          } else {
            if (activeHtml && !iframe.srcdoc) {
              iframe.srcdoc = activeHtml;
            } else if (gameUrl && !iframe.src && !iframe.srcdoc) {
              iframe.src = gameUrl;
            }
          }
          return true;
        }
      } catch (err) {
        console.error("about:blank DOM injection error:", err);
      }
      return false;
    };

    // If local game HTML content wasn't passed directly, pre-fetch it so we can inject via srcdoc
    if (!activeHtml && gameUrl && (gameUrl.includes('/games/') || gameUrl.endsWith('.html'))) {
      fetch(gameUrl)
        .then(res => {
          if (res.ok) return res.text();
          throw new Error('HTTP ' + res.status);
        })
        .then(text => {
          if (text && text.includes('<html')) {
            activeHtml = text;
            try {
              if (win && !win.closed && win.document) {
                const iframe = win.document.getElementById('stealth-game-frame');
                if (iframe) {
                  iframe.srcdoc = text;
                }
              }
            } catch (e) {
              console.warn('Could not inject fetched HTML to stealth frame:', e);
            }
          }
        })
        .catch(err => {
          console.warn('Could not prefetch game HTML:', err);
        });
    }

    // Try immediately and retry for popup creation delay
    if (!setupDoc()) {
      [10, 30, 80, 200, 500].forEach(delay => {
        setTimeout(setupDoc, delay);
      });
    }

    return true;
  } catch (err) {
    console.error("Failed to open about:blank window:", err);
    return false;
  }
}

export const openAboutBlankCloak = openGameInNewTab;
