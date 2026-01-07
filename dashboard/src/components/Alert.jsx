import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Alert({ type = 'info', title, message, onDismiss }) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} mb-4 flex items-start gap-3`}>
      {type === 'success' && <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[type]}`} />}
      {type === 'error' && <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[type]}`} />}
      {type === 'warning' && <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[type]}`} />}
      {type === 'info' && <Loader className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[type]} animate-spin`} />}

      <div className="flex-grow">
        {title && <h3 className="font-semibold text-sm">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>

      <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        ✕
      </button>
    </div>
  );
}
