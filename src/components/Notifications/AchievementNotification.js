import React, { useState, useEffect } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const AchievementNotification = () => {
  const { recentAchievements } = useGamification();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (recentAchievements.length > 0) {
      const latestAchievement = recentAchievements[0];
      
      // Check if this achievement is already being shown
      const isAlreadyVisible = visibleNotifications.some(
        notification => notification.id === latestAchievement.id
      );
      
      if (!isAlreadyVisible) {
        const notification = {
          ...latestAchievement,
          timestamp: Date.now()
        };
        
        setVisibleNotifications(prev => [notification, ...prev.slice(0, 2)]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setVisibleNotifications(prev => 
            prev.filter(n => n.timestamp !== notification.timestamp)
          );
        }, 5000);
      }
    }
  }, [recentAchievements, visibleNotifications]);

  const removeNotification = (timestamp) => {
    setVisibleNotifications(prev => 
      prev.filter(n => n.timestamp !== timestamp)
    );
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.timestamp}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 animate-in slide-in-from-right"
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{notification.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">🎉 Badge Unlocked!</h3>
              <p className="font-medium text-sm">{notification.name}</p>
              <p className="text-xs opacity-90">{notification.description}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.timestamp)}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementNotification;
