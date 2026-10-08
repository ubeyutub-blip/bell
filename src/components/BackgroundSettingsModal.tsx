import React, { useRef } from 'react';
import { X, Palette, Upload, Check } from 'lucide-react';
import { SchoolSettings } from '../types/bell';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => void;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const themes = [
    {
      id: 'marine_classic',
      name: 'Biru Laut Classic (Sesuai Foto)',
      description: 'Latar biru laut bergelombang khas software bel sekolah desktop'
    },
    {
      id: 'navy_grid',
      name: 'Navy Blue Grid Modern',
      description: 'Gradien biru gelap dengan tekstur grid minimalis rapi'
    },
    {
      id: 'royal_blue',
      name: 'Royal Blue Solid',
      description: 'Nuansa biru elegan resmi institusi sekolah'
    },
    {
      id: 'dark_slate',
      name: 'Dark Slate Premium',
      description: 'Nuansa gelap hemat energi dengan kontras tinggi'
    }
  ] as const;

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateSettings({ customBgUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-md overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Palette className="w-4 h-4 text-yellow-400" />
            <span>Pilihan Tema Wallpaper Latar Belakang</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs text-slate-800">
          <p className="text-slate-600">
            Pilih tampilan wallpaper latar belakang aplikasi Bel Sekolah Otomatis Anda:
          </p>

          <div className="space-y-2">
            {themes.map((theme) => {
              const isSelected = settings.backgroundTheme === theme.id && !settings.customBgUrl;
              return (
                <div
                  key={theme.id}
                  onClick={() => onUpdateSettings({ backgroundTheme: theme.id, customBgUrl: undefined })}
                  className={`p-3 rounded border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-400 font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-slate-900">{theme.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {theme.description}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Upload Custom Wallpaper */}
          <div className="pt-2 border-t border-slate-300">
            <label className="font-bold text-slate-700 block mb-1">
              Gunakan Wallpaper Gambar Sendiri:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-200 hover:bg-slate-300 border border-slate-300 px-3 py-1.5 rounded font-bold text-slate-800 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto dari Komputer</span>
              </button>
              {settings.customBgUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ customBgUrl: undefined })}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Hapus Custom
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-200 border-t border-slate-300 px-4 py-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
