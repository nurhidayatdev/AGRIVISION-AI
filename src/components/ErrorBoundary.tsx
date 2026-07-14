import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public props!: Props;
  public state!: State;
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F7F5] flex flex-col items-center justify-center p-6 text-center font-sans">
          <AlertTriangle size={64} className="text-red-500 mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Ups, Terjadi Kesalahan!</h1>
          <p className="text-gray-600 mb-2 max-w-md">
            Sistem mendeteksi adanya kendala saat memuat halaman ini. Jangan khawatir, data Anda tetap aman.
          </p>
          <p className="text-xs text-gray-400 mb-8 max-w-md font-mono bg-gray-100 p-2 rounded">
            {this.state.error?.message || 'Unknown Error'}
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-[#006B4D] hover:bg-[#00573E] text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <RefreshCcw size={18} />
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
