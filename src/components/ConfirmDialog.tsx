import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm">
            {isDestructive ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <HelpCircle className="w-4 h-4 text-blue-400" />
            )}
            <span>{title}</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 text-xs text-slate-800 leading-relaxed">
          {message}
        </div>

        <div className="bg-slate-200 border-t border-slate-300 px-4 py-2 flex justify-end gap-2 text-xs">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded font-bold text-white shadow-xs transition-colors ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
