import React from 'react';
import { Button } from './Button';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      case 'success':
        return 'success';
      default:
        return 'warning';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
