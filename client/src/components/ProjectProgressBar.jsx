import React from 'react';

const ProjectProgressBar = ({ progress = 0, showLabel = true, size = 'md', className = '' }) => {
  let raw = progress;
  if (typeof raw === 'string') {
    const match = raw.match(/(\d+)/);
    raw = match ? match[1] : 0;
  }
  const percentage = Math.min(100, Math.max(0, parseInt(raw, 10) || 0));

  // Determine bar height based on size
  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
          <span>Project Progress: <strong className="text-primary dark:text-primary-light">{percentage}%</strong></span>
          <span className="text-gray-500 dark:text-slate-400 font-medium">
            {percentage >= 100 ? '100% Completed' : `${percentage}% Completed`}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200/80 dark:bg-slate-700 rounded-full overflow-hidden ${heightClass}`}>
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProjectProgressBar;
