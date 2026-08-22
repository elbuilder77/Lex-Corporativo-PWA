import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height = '1rem',
  className = '',
}) => {
  const baseStyles = `
    animate-pulse bg-slate-200 rounded
    ${variant === 'circle' ? 'rounded-full' : ''}
    ${variant === 'rect' ? 'rounded-lg' : ''}
  `;

  return (
    <div
      className={`${baseStyles} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export const SearchResultSkeleton: React.FC = () => (
  <div className="space-y-3" aria-hidden="true">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="rect" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height="1rem" />
            <Skeleton variant="text" width="40%" height="0.75rem" />
          </div>
        </div>
        <Skeleton variant="text" width="100%" height="0.75rem" />
        <Skeleton variant="text" width="80%" height="0.75rem" />
      </div>
    ))}
  </div>
);

export const ArticleSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3" aria-hidden="true">
    <div className="flex items-center gap-3">
      <Skeleton variant="rect" width="50px" height="30px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" height="1rem" />
        <Skeleton variant="text" width="50%" height="0.75rem" />
      </div>
    </div>
    <Skeleton variant="text" width="100%" height="0.75rem" />
    <Skeleton variant="text" width="90%" height="0.75rem" />
  </div>
);

export const HistorySkeleton: React.FC = () => (
  <div className="space-y-2" aria-hidden="true">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3">
        <Skeleton variant="circle" width="36px" height="36px" />
        <div className="flex-1 space-y-1">
          <Skeleton variant="text" width="80%" height="1rem" />
          <Skeleton variant="text" width="50%" height="0.75rem" />
        </div>
        <Skeleton variant="text" width="80px" height="0.75rem" />
      </div>
    ))}
  </div>
);

export const CaseSkeleton: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
    {[1, 2].map((i) => (
      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" width="32px" height="32px" />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" width="70%" height="1rem" />
            <Skeleton variant="text" width="40%" height="0.75rem" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <Skeleton variant="text" width="100px" height="0.75rem" />
          <Skeleton variant="text" width="60px" height="0.75rem" />
        </div>
      </div>
    ))}
  </div>
);