// Dashboard Components
export { default as Dashboard } from './Dashboard';
export { default as StatsCards } from './StatsCards';
export { default as ProductivityChart } from './ProductivityChart';
export { default as InsightsPanel } from './InsightsPanel';
export { default as ProgressOverview } from './ProgressOverview';

// Re-export context for convenience
export { StatisticsProvider, useStatistics } from '../../contexts/StatisticsContext';
