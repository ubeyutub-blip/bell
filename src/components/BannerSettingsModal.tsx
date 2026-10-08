import React, { useState, useRef } from 'react';
import { X, Save, Image as ImageIcon, School, Sparkles, Upload } from 'lucide-react';
import { SchoolSettings } from '../types/bell';

interface BannerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => void;
}

export const BannerSettingsModal: React.FC<BannerSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [schoolName, setSchoolName] = useState<string>(settings.schoolName);
  const [schoolSubtext, setSchoolSubtext] = useState<string>(settings.schoolSubtext);
  const [logoText, setLogoText] = useState<string>(settings.schoolLogoText);
  const [logoImage, setLogoImage] = useState<string>(settings.schoolLogoImage || '');
  const [version, setVersion] = useState<string>(settings.version);
  const [isTrial, setIsTrial] = useState<boolean>(settings.isTrial);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      schoolName: schoolName.trim() || 'SD/SMP/SMA UNGGULAN',
      schoolSubtext: schoolSubtext.trim(),
      schoolLogoText: logoText.trim() || 'LOGO',
      schoolLogoImage: logoImage || undefined,
      version: version.trim() || 'Versi 1.02',
      isTrial
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm">
            <School className="w-4 h-4 text-red-400" />
            <span>Pengaturan Banner & Identitas Sekolah</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3.5 text-xs text-slate-800">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Sekolah (Tampil di Banner Merah Atas):
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Contoh: SD/SMP/SMA UNGGULAN"
              required
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm font-bold text-slate-900 uppercase tracking-wide"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Keterangan / Sub-judul Sekolah:
            </label>
            <input
              type="text"
              value={schoolSubtext}
              onChange={(e) => setSchoolSubtext(e.target.value)}
              placeholder="Contoh: SISTEM BEL SEKOLAH OTOMATIS TERPADU"
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teks Kotak Logo:</label>
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                maxLength={8}
                placeholder="LOGO"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Label Versi:</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Versi 1.02"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
              />
            </div>
          </div>

          {/* Upload Logo File */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Logo Sekolah (Gambar PNG/JPG) [Opsional]:
            </label>
            <div className="flex items-center gap-3">
              {logoImage ? (
                <div className="relative w-12 h-12 bg-white border rounded p-1 flex items-center justify-center">
                  <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setLogoImage('')}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                    title="Hapus Logo"
                  >
                    ×
                  </button>
                </div>
              ) : null}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-200 hover:bg-slate-300 border border-slate-300 px-3 py-1.5 rounded font-bold text-slate-800 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Gambar Logo Sekolah</span>
              </button>
            </div>
          </div>

          {/* Status Lisensi */}
          <div className="bg-slate-200/80 rounded p-2.5 border border-slate-300 flex items-center justify-between">
            <label className="font-bold text-slate-800">Status Lisensi:</label>
            <div className="flex items-center gap-3 font-semibold">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="license_type"
                  checked={isTrial}
                  onChange={() => setIsTrial(true)}
                  className="accent-red-600"
                />
                <span>Trial</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="license_type"
                  checked={!isTrial}
                  onChange={() => setIsTrial(false)}
                  className="accent-green-600"
                />
                <span>Full Version (Aktif)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-300 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
