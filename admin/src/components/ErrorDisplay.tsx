import React from 'react';
import { XCircle, AlertTriangle, Info } from 'lucide-react';

interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found';
  message: string;
  details?: string;
  suggestion?: string;
}

interface ErrorDisplayProps {
  error: ApiError | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className={`border rounded-lg p-4 mb-4 ${
      error.type === 'auth' ? 'bg-red-50 border-red-200' :
      error.type === 'server' ? 'bg-orange-50 border-orange-200' :
      'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {error.type === 'auth' && <XCircle className="h-5 w-5 text-red-400" />}
          {error.type === 'server' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
          {error.type === 'validation' && <Info className="h-5 w-5 text-yellow-400" />}
          {error.type === 'network' && <XCircle className="h-5 w-5 text-red-400" />}
          {error.type === 'not_found' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${
            error.type === 'auth' ? 'text-red-800' :
            error.type === 'server' ? 'text-orange-800' :
            'text-yellow-800'
          }`}>
            {error.message}
          </h3>
          <div className={`mt-2 text-sm ${
            error.type === 'auth' ? 'text-red-700' :
            error.type === 'server' ? 'text-orange-700' :
            'text-yellow-700'
          }`}>
            {error.details && error.details.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
            {error.suggestion && (
              <div className="mt-1 font-medium">{error.suggestion}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
