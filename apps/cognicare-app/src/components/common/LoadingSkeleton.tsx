import React from 'react';

interface Props {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<Props> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`animate-pulse space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-ner-earth/15 rounded-xl w-full"
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
};
