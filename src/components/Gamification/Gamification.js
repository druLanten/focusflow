import React, { useState } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const Gamification = () => {
  const {
    level,
    points,
    totalPomodoros,
    totalTasks,
    currentStreak,
    recentAchievements,
    getProgressToNextLevel,
    getAvailableBadges,
    getUnlockedBadges
  } = useGamification();

  const [activeTab, setActiveTab] = useState('overview');
  const progressToNext = getProgressToNextLevel();
  const unlockedBadges = getUnlockedBadges();
  const availableBadges = getAvailableBadges();

  const BadgeCard = ({ badge, isUnlocked = false }) => (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 shadow-md'
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
    }`}>
      <div className="text-center">
        <div className="text-3xl mb-2">{badge.icon}</div>
        <h3 className={`font-semibold text-sm mb-1 ${
          isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {badge.name}
        </h3>
        <p className={`text-xs ${
          isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {badge.description}
        </p>
        {isUnlocked && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ Unlocked
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const StatCard = ({ icon, label, value, color = 'indigo' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{level.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Level {level.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {points} points • {totalPomodoros} Pomodoros completed
            </p>
          </div>
        </div>

        {/* Level Progress */}
        {progressToNext.nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress to {progressToNext.nextLevel.name}</span>
              <span>{progressToNext.pomodorosNeeded} Pomodoros to go</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressToNext.progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="🎯" label="Total Pomodoros" value={totalPomodoros} color="red" />
        <StatCard icon="✅" label="Tasks Completed" value={totalTasks} color="green" />
        <StatCard icon="🔥" label="Current Streak" value={`${currentStreak} days`} color="orange" />
        <StatCard icon="🏆" label="Badges Earned" value={unlockedBadges.length} color="yellow" />
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🎉</span>
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentAchievements.map((badge, index) => (
              <BadgeCard key={`recent-${badge.id}-${index}`} badge={badge} isUnlocked={true} />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'unlocked', name: 'Unlocked Badges', icon: '🏆' },
              { id: 'available', name: 'Available Badges', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Focus Journey</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You've completed {totalPomodoros} Pomodoro sessions, spending {Math.round(totalPomodoros * 25 / 60)} hours in focused work.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Task Mastery</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You've completed {totalTasks} tasks and maintained a {currentStreak}-day streak.
                    </p>
                  </div>
                </div>
              </div>

              {unlockedBadges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Latest Badges ({unlockedBadges.length} total)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {unlockedBadges.slice(0, 6).map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'unlocked' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unlocked Badges ({unlockedBadges.length})
              </h3>
              {unlockedBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {unlockedBadges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎯</span>
                  <p className="text-gray-500 dark:text-gray-400">
                    No badges unlocked yet. Complete your first Pomodoro to get started!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'available' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Available Badges ({availableBadges.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} isUnlocked={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
