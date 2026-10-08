import React, { useState, useRef } from 'react';
import { X, Music, Play, Square, Upload, Mic, Sliders, Check, Volume2 } from 'lucide-react';
import { SchoolSettings, SoundItem } from '../types/bell';

interface SoundManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundLibrary: SoundItem[];
  onAddCustomSound: (sound: SoundItem) => void;
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => void;
  onPreviewSound: (sound: SoundItem) => void;
  onStopPreview: () => void;
  isPlaying: boolean;
  playingSoundTitle: string;
}

export const SoundManagerModal: React.FC<SoundManagerModalProps> = ({
  isOpen,
  onClose,
  soundLibrary,
  onAddCustomSound,
  settings,
  onUpdateSettings,
  onPreviewSound,
  onStopPreview,
  isPlaying,
  playingSoundTitle
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'audio_settings'>('presets');
  const [newSoundName, setNewSoundName] = useState<string>('');
  const [newSoundVoice, setNewSoundVoice] = useState<string>('');
  const [customSoundError, setCustomSoundError] = useState<string>('');
  const [uploadedAudioData, setUploadedAudioData] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!newSoundName) {
      setNewSoundName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedAudioData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCustomSound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoundName.trim()) {
      setCustomSoundError('Masukkan nama sound pengumuman.');
      return;
    }
    setCustomSoundError('');

    const customSound: SoundItem = {
      id: `custom-${Date.now()}`,
      name: newSoundName.trim(),
      path: `c:\\bellvoice\\sound\\${uploadedFileName || newSoundName.toLowerCase().trim() + '.mp3'}`,
      category: 'kustom',
      voiceText: newSoundVoice || `Perhatian, ${newSoundName}`,
      defaultChime: 3,
      customAudioData: uploadedAudioData || undefined
    };

    onAddCustomSound(customSound);
    setNewSoundName('');
    setNewSoundVoice('');
    setUploadedAudioData('');
    setUploadedFileName('');
    setActiveTab('presets');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Music className="w-4 h-4 text-indigo-400" />
            <span>Pengelola Suara & Nada Bel (Mp3 / Wav)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-200 border-b border-slate-300 px-4 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 font-bold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar File Suara ({soundLibrary.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-3 font-bold border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload / Tambah Suara Baru
          </button>
          <button
            onClick={() => setActiveTab('audio_settings')}
            className={`py-2 px-3 font-bold border-b-2 transition-colors ${
              activeTab === 'audio_settings'
                ? 'border-blue-600 text-blue-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengaturan Volume & Nada
          </button>
        </div>

        {/* Content */}
        <div className="p-4 text-xs text-slate-800 max-h-[460px] overflow-y-auto">
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <p className="text-slate-600 mb-2">
                Daftar file suara bel standar dan kustom yang tersimpan di sistem. Klik tombol putar untuk mendengarkan pratinjau.
              </p>
              <div className="border border-slate-300 rounded overflow-hidden divide-y divide-slate-200 bg-white shadow-xs">
                {soundLibrary.map((sound) => {
                  const isCurrent = isPlaying && playingSoundTitle.toLowerCase() === sound.name.toLowerCase();
                  return (
                    <div
                      key={sound.id}
                      className={`p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{sound.name}</span>
                          {sound.category === 'kustom' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                              Kustom
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          {sound.path}
                        </div>
                        <div className="text-[10px] text-slate-600 italic mt-0.5 truncate">
                          "{sound.voiceText}"
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (isCurrent) {
                              onStopPreview();
                            } else {
                              onPreviewSound(sound);
                            }
                          }}
                          className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 text-xs transition-colors ${
                            isCurrent
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Putar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCreateCustomSound} className="space-y-3">
              {customSoundError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-xs font-semibold">
                  {customSoundError}
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900">
                <h4 className="font-bold mb-1">Unggah File Audio Sekolah</h4>
                <p className="text-[11px]">
                  Anda dapat mengunggah file audio MP3 atau WAV pengumuman rekaman sendiri, atau membuat pengumuman dengan teks otomatis (TTS Bahasa Indonesia).
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Suara / Pengumuman:
                </label>
                <input
                  type="text"
                  value={newSoundName}
                  onChange={(e) => setNewSoundName(e.target.value)}
                  placeholder="Contoh: Bel Masuk Ujian Semester, Jam Senam Pagi, dll."
                  required
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Unggah File Audio (MP3 / WAV) [Opsional]:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/mp3,audio/wav,audio/ogg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-200 hover:bg-slate-300 border border-slate-300 px-3 py-1.5 rounded font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File dari Komputer</span>
                  </button>
                  {uploadedFileName && (
                    <span className="text-emerald-700 font-mono text-[11px] truncate font-semibold">
                      ✓ {uploadedFileName}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  *Jika tidak mengunggah file MP3, suara pengumuman akan dibacakan menggunakan teks otomatis di bawah ini.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teks Pengumuman Bahasa Indonesia (TTS):
                </label>
                <textarea
                  value={newSoundVoice}
                  onChange={(e) => setNewSoundVoice(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Perhatian, waktu istirahat telah selesai. Seluruh siswa segera masuk kelas."
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan ke Daftar Suara</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'audio_settings' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Volume Master Bel:</label>
                  <span className="font-mono font-bold text-blue-700">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Volume Nada Bel (Chime / Ding-Dong):</label>
                  <span className="font-mono font-bold text-blue-700">
                    {Math.round(settings.chimeVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.chimeVolume}
                  onChange={(e) => onUpdateSettings({ chimeVolume: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Volume Suara Pengumuman (Voice):</label>
                  <span className="font-mono font-bold text-blue-700">
                    {Math.round(settings.voiceVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.voiceVolume}
                  onChange={(e) => onUpdateSettings({ voiceVolume: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Kecepatan Bicara Suara (Speech Rate):</label>
                  <span className="font-mono font-bold text-blue-700">
                    {settings.speechRate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={settings.speechRate}
                  onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-200 border-t border-slate-300 px-4 py-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
