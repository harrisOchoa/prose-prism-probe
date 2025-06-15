
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssessmentError } from '@/types/optimized';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AssessmentError) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
}

class OptimizedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: '', 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OptimizedErrorBoundary caught an error:', error, errorInfo);
    
    const assessmentError: AssessmentError = {
      code: 'COMPONENT_ERROR',
      message: error.message,
      details: {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      },
      timestamp: new Date()
    };

    this.props.onError?.(assessmentError);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReport = () => {
    // In a real app, this would send error details to monitoring service
    console.log('Error reported:', {
      errorId: this.state.errorId,
      error: this.state.error,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            {this.props.showDetails && (
              <details className="text-sm text-red-500">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
              
              <Button onClick={this.handleReport} variant="outline" size="sm">
                <Bug className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </div>
            
            {!canRetry && (
              <p className="text-sm text-red-500">
                Maximum retry attempts reached. Please refresh the page.
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default OptimizedErrorBoundary;
