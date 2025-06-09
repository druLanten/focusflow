import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useStatistics } from '../../contexts/StatisticsContext';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductivityChart = () => {
  const { getChartData, currentPeriod, setCurrentPeriod, TIME_PERIODS, state: statsState } = useStatistics();
  const { dailyStats } = useTimer();
  const { allTasks } = useTasks();
  const [selectedMetric, setSelectedMetric] = useState('pomodorosCompleted');
  const [chartType, setChartType] = useState('line');
  const [chartKey, setChartKey] = useState(0);

  const metrics = [
    { value: 'pomodorosCompleted', label: 'Pomodoros', icon: '🍅', color: '#ef4444' },
    { value: 'focusTime', label: 'Focus Time', icon: '⏱️', color: '#3b82f6' },
    { value: 'tasksCompleted', label: 'Tasks', icon: '✅', color: '#10b981' },
    { value: 'sessionsCompleted', label: 'Sessions', icon: '📊', color: '#8b5cf6' }
  ];

  const periods = [
    { value: TIME_PERIODS.DAILY, label: 'Last 7 Days' },
    { value: TIME_PERIODS.WEEKLY, label: 'Last 4 Weeks' },
    { value: TIME_PERIODS.MONTHLY, label: 'Last 6 Months' }
  ];

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    console.log('📊 Recalculating chart data for:', selectedMetric, currentPeriod);
    return getChartData(currentPeriod, selectedMetric);
  }, [getChartData, currentPeriod, selectedMetric]);

  // Force chart re-render when data changes
  useEffect(() => {
    setChartKey(prev => prev + 1);
    console.log('📈 Chart data updated, forcing re-render');
  }, [chartData, selectedMetric, chartType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return `${context[0].label}`;
          },
          label: (context) => {
            const metric = metrics.find(m => m.value === selectedMetric);
            const value = context.parsed.y;
            if (selectedMetric === 'focusTime') {
              return `${metric.label}: ${value}h`;
            }
            return `${metric.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            if (selectedMetric === 'focusTime') {
              return `${value}h`;
            }
            return value;
          }
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: chartData.datasets[0]?.borderColor || '#ef4444',
        borderColor: '#ffffff',
        borderWidth: 2
      },
      line: {
        tension: 0.4
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const selectedMetricData = metrics.find(m => m.value === selectedMetric);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            📈 Productivity Trends
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your progress over time
          </p>
        </div>

        {/* Controls */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Refresh Button */}
          <button
            onClick={() => setChartKey(prev => prev + 1)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Refresh Chart"
          >
            🔄
          </button>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Bar
            </button>
          </div>

          {/* Period Selection */}
          <select
            value={currentPeriod}
            onChange={(e) => setCurrentPeriod(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.value}
              onClick={() => setSelectedMetric(metric.value)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedMetric === metric.value
                  ? 'border-current bg-opacity-10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{
                color: selectedMetric === metric.value ? metric.color : undefined,
                backgroundColor: selectedMetric === metric.value ? `${metric.color}10` : undefined
              }}
            >
              <span className="text-lg">{metric.icon}</span>
              <span className="text-sm font-medium">{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.datasets[0]?.data.length > 0 ? (
          chartType === 'line' ? (
            <Line key={`line-${chartKey}`} data={chartData} options={chartOptions} />
          ) : (
            <Bar key={`bar-${chartKey}`} data={chartData} options={chartOptions} />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No data yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Start using FocusFlow to see your productivity trends!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Summary */}
      {chartData.datasets[0]?.data.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedMetricData.icon}</span>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedMetricData.label} Summary
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {periods.find(p => p.value === currentPeriod)?.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: selectedMetricData.color }}>
                {chartData.datasets[0].data.reduce((sum, value) => sum + value, 0)}
                {selectedMetric === 'focusTime' ? 'h' : ''}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;
