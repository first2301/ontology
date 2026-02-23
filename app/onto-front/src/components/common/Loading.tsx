'use client';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  variant?: 'spinner' | 'skeleton';
  skeletonRows?: number;
}

export default function Loading({ 
  fullScreen = false, 
  message, 
  variant = 'spinner',
  skeletonRows = 3 
}: LoadingProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-r-blue-400 opacity-50" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
      {message && <p className="text-sm font-medium text-gray-600 animate-pulse">{message}</p>}
    </div>
  );

  const skeletonContent = (
    <div className="w-full space-y-3">
      {Array.from({ length: skeletonRows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );

  const content = variant === 'skeleton' ? skeletonContent : spinnerContent;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
}

