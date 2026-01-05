import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-6">
                            <AlertTriangle className="w-16 h-16 mx-auto text-error" />
                        </div>

                        <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>

                        <p className="mb-6 text-base-content/70">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="btn btn-primary btn-block"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-outline btn-block"
                            >
                                Refresh Page
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-error">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 p-4 text-xs bg-base-200 rounded overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;