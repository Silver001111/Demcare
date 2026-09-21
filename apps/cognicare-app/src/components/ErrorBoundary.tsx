import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CogniCare Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ner-cream flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-3xl border-2 border-ner-earth/20 p-8 max-w-lg shadow-card-warm">
            <div className="text-6xl mb-4 animate-bounce">🌿</div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ner-bark mb-2">
              Something went wrong
            </h2>
            <p className="text-ner-earth mb-6 text-base leading-relaxed">
              CogniCare has encountered an unexpected condition. Your cognitive data remains safe in local storage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-tactile btn-tactile-green px-8 py-3.5 text-lg font-bold"
              >
                Restart App
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="btn-tactile bg-ner-cream text-ner-bark px-6 py-3.5 text-base border-2 border-ner-earth/30"
              >
                Try To Recover
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left text-xs text-ner-earth/70 bg-ner-cream/50 p-3 rounded-xl overflow-x-auto">
                <summary className="cursor-pointer font-bold">Technical Details</summary>
                <pre className="mt-2">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
