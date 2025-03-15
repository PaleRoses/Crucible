// components/ErrorBoundary.tsx
'use client'

import React from 'react';

export default function ErrorBoundary({
  children
}: {
  children: React.ReactNode
}) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = () => setHasError(true);
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <div>Something went wrong. Please refresh the page.</div>;
  }

  return <>{children}</>;
}