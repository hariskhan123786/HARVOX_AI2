import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * ChatErrorBoundary — React Error Boundary for chat message rendering.
 * Catches rendering crashes (e.g. malformed markdown, SyntaxHighlighter errors)
 * and displays a styled error card instead of crashing the entire page.
 */
export default class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ChatErrorBoundary] Render crash caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Compact variant for wrapping individual message bubbles
      if (this.props.compact) {
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="flex-1 min-w-0">Failed to render message</span>
            <button
              onClick={this.handleRetry}
              className="p-1 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
              title="Retry rendering"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        );
      }

      // Full error card for wrapping larger sections
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-sm max-w-md mx-auto my-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-white">Something went wrong</p>
          <p className="text-xs text-gray-400 text-center">
            A rendering error occurred. Your conversation is safe.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400 transition-all"
          >
            <RotateCcw size={12} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
