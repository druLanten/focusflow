import React, { useState, useEffect } from 'react';
import { detectBrowser, isEdge, browserSupport } from '../../utils/browserCompat';

const BrowserInfo = () => {
  const [browser, setBrowser] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const detectedBrowser = detectBrowser();
    setBrowser(detectedBrowser);
    
    // Show info for Edge users or if there are compatibility issues
    if (isEdge() || !browserSupport.localStorage) {
      setShowInfo(true);
    }
  }, []);

  if (!showInfo) return null;

  const getBrowserIcon = () => {
    switch (browser) {
      case 'edge': return '🌐';
      case 'chrome': return '🟢';
      case 'firefox': return '🦊';
      case 'safari': return '🧭';
      default: return '🌐';
    }
  };

  const getBrowserName = () => {
    switch (browser) {
      case 'edge': return 'Microsoft Edge';
      case 'chrome': return 'Google Chrome';
      case 'firefox': return 'Mozilla Firefox';
      case 'safari': return 'Safari';
      default: return 'Unknown Browser';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getBrowserIcon()}</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Browser Detected: {getBrowserName()}
            </h3>
            
            {isEdge() && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  FocusFlow is optimized for your browser with enhanced compatibility features.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    ✓ Timer Optimized
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    ✓ Storage Enhanced
                  </span>
                </div>
              </div>
            )}

            {!browserSupport.localStorage && (
              <div className="mt-2">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Limited storage support detected. Some features may not persist between sessions.
                </p>
              </div>
            )}

            {!browserSupport.notifications && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Enable notifications for timer alerts.
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowInfo(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrowserInfo;
