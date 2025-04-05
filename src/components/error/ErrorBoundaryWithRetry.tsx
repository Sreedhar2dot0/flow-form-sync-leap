
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryWithRetry extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      // Default fallback UI
      return (
        <Card className="border-destructive/50 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive text-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleRetry}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}
