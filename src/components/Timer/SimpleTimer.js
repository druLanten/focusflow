import React, { useState, useEffect, useRef } from 'react';

const SimpleTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(25 * 60);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Simple Timer Test
      </h1>
      
      <div className="text-6xl font-mono font-bold text-red-600 dark:text-red-400">
        {formatTime(timeRemaining)}
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg"
        >
          Reset
        </button>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Status: {isRunning ? 'Running' : 'Paused'}
      </div>
    </div>
  );
};

export default SimpleTimer;
