import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StoryList } from '@/components/hackernews/StoryList';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-4">
      <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <Alert>
        <AlertDescription>
          {error.message || 'An unexpected error occurred while loading Hacker News content.'}
        </AlertDescription>
      </Alert>
      <Button onClick={resetErrorBoundary} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  </div>
);

const HackerNews: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <StoryList />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HackerNews;