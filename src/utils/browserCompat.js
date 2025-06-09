// Browser compatibility utilities for FocusFlow

/**
 * Detect the current browser
 */
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Edg/')) {
    return 'edge';
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg/')) {
    return 'chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'safari';
  }
  
  return 'unknown';
};

/**
 * Check if the browser is Microsoft Edge
 */
export const isEdge = () => {
  return detectBrowser() === 'edge';
};

/**
 * Safe localStorage operations with Edge compatibility
 */
export const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      // For Edge, add a small delay to prevent rapid writes
      if (isEdge()) {
        setTimeout(() => {
          localStorage.setItem(key, value);
        }, 10);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
    }
  }
};

/**
 * Safe timer operations with Edge compatibility
 */
export const safeTimer = {
  setInterval: (callback, delay) => {
    // Edge sometimes has issues with very frequent intervals
    const adjustedDelay = isEdge() ? Math.max(delay, 100) : delay;
    return setInterval(callback, adjustedDelay);
  },
  
  setTimeout: (callback, delay) => {
    const adjustedDelay = isEdge() ? Math.max(delay, 10) : delay;
    return setTimeout(callback, adjustedDelay);
  },
  
  clearInterval: (id) => {
    clearInterval(id);
  },
  
  clearTimeout: (id) => {
    clearTimeout(id);
  }
};

/**
 * Debounce function for Edge compatibility
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if the browser supports modern features
 */
export const browserSupport = {
  localStorage: (() => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  })(),
  
  webAudio: (() => {
    return !!(window.AudioContext || window.webkitAudioContext);
  })(),
  
  notifications: (() => {
    return 'Notification' in window;
  })(),
  
  serviceWorker: (() => {
    return 'serviceWorker' in navigator;
  })()
};

/**
 * Get browser-specific configuration
 */
export const getBrowserConfig = () => {
  const browser = detectBrowser();
  
  const configs = {
    edge: {
      timerInterval: 1000, // Standard 1 second for Edge
      storageDelay: 50,    // Small delay for storage operations
      animationDuration: 300, // Slightly longer animations
      debounceDelay: 100   // Debounce rapid updates
    },
    chrome: {
      timerInterval: 1000,
      storageDelay: 0,
      animationDuration: 200,
      debounceDelay: 50
    },
    firefox: {
      timerInterval: 1000,
      storageDelay: 0,
      animationDuration: 200,
      debounceDelay: 50
    },
    safari: {
      timerInterval: 1000,
      storageDelay: 10,
      animationDuration: 250,
      debounceDelay: 75
    },
    unknown: {
      timerInterval: 1000,
      storageDelay: 50,
      animationDuration: 300,
      debounceDelay: 100
    }
  };
  
  return configs[browser] || configs.unknown;
};

/**
 * Log browser information for debugging
 */
export const logBrowserInfo = () => {
  const browser = detectBrowser();
  const config = getBrowserConfig();
  
  console.log('🌐 FocusFlow Browser Info:', {
    browser,
    userAgent: navigator.userAgent,
    config,
    support: browserSupport
  });
};
