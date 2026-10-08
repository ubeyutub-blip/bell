import React, { useState, useEffect } from 'react';
import { X, Play, Square, Save, Clock, Volume2, Plus } from 'lucide-react';
import { DayOfWeek, ScheduleItem, SoundItem } from '../types/bell';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ScheduleItem>, applyToDays?: DayOfWeek[]) => void;
  editingItem: ScheduleItem | null;
  defaultDay: DayOfWeek;
  soundLibrary: SoundItem[];
  onTestSound: (item: { title: string; soundPath: string; chimeType: number; repeatCount: number; voiceText?: string; customAudioData?: string }) => void;
  onStopTest: () => void;
  isPlaying: boolean;
}

const ALL_DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  defaultDay,
  soundLibrary,
  onTestSound,
  onStopTest,
  isPlaying
}) => {
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [time, setTime] = useState<string>('07:00');
  const [title, setTitle] = useState<string>('');
  const [soundPath, setSoundPath] = useState<string>('c:\\bellvoice\\sound\\jam ke 01.mp3');
  const [chimeType, setChimeType] = useState<number>(3);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [voiceText, setVoiceText] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [applyToOtherDays, setApplyToOtherDays] = useState<boolean>(false);
  const [selectedTargetDays, setSelectedTargetDays] = useState<DayOfWeek[]>([
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat'
  ]);

  useEffect(() => {
    if (editingItem) {
      setDay(editingItem.day);
      setTime(editingItem.time);
      setTitle(editingItem.title);
      setSoundPath(editingItem.soundPath);
      setChimeType(editingItem.chimeType);
      setRepeatCount(editingItem.repeatCount);
      setVoiceText(editingItem.voiceText || '');
      setApplyToOtherDays(false);
    } else {
      setDay(defaultDay);
      setTime('07:00');
      setTitle('jam ke 01');
      setSoundPath('c:\\bellvoice\\sound\\jam ke 01.mp3');
      setChimeType(3);
      setRepeatCount(1);
      setVoiceText('Saatnya jam pelajaran ke satu dimulai.');
      setApplyToOtherDays(false);
    }
  }, [editingItem, defaultDay, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (sound: SoundItem) => {
    setSoundPath(sound.path);
    setTitle(sound.name.toLowerCase());
    setChimeType(sound.defaultChime);
    setVoiceText(sound.voiceText);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !title.trim()) {
      setFormError('Mohon isi jam dan nama jadwal terlebih dahulu.');
      return;
    }
    setFormError('');

    const payload: Partial<ScheduleItem> = {
      id: editingItem?.id,
      day,
      time,
      title: title.toLowerCase().trim(),
      soundPath,
      chimeType,
      repeatCount,
      voiceText: voiceText.trim(),
      enabled: editingItem ? editingItem.enabled : true
    };

    onSave(payload, applyToOtherDays ? selectedTargetDays : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Window Header */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{editingItem ? 'Edit Jadwal Bel' : 'Tambah Jadwal Bel Baru'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-slate-800">
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-xs font-semibold">
              {formError}
            </div>
          )}
          {/* Quick Sound Presets */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Pilih Template Suara Cepat:</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {soundLibrary.slice(0, 8).map((sound) => (
                <button
                  type="button"
                  key={sound.id}
                  onClick={() => handleSelectPreset(sound)}
                  className={`px-2.5 py-1 text-[11px] rounded border whitespace-nowrap transition-colors ${
                    soundPath === sound.path
                      ? 'bg-blue-600 text-white border-blue-700 font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                >
                  {sound.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Day Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hari:</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800"
              >
                {ALL_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jam (HH:mm):</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-sm text-slate-900"
              />
            </div>

            {/* Chime Type */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">(+) Nada Bel:</label>
              <select
                value={chimeType}
                onChange={(e) => setChimeType(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800"
              >
                <option value={1}>1 Nada (Pendek)</option>
                <option value={2}>2 Nada (Sedang)</option>
                <option value={3}>3 Nada (Standar)</option>
                <option value={4}>4 Nada (Westminster Panjang)</option>
              </select>
            </div>
          </div>

          {/* Schedule Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Jadwal / Keterangan:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: jam ke 01, jam istirahat, jam pembelajaran selesai"
              required
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          {/* Sound File Path */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              File Sound / Path:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={soundPath}
                onChange={(e) => setSoundPath(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    onStopTest();
                  } else {
                    onTestSound({
                      title,
                      soundPath,
                      chimeType,
                      repeatCount,
                      voiceText
                    });
                  }
                }}
                className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 transition-colors ${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                }`}
              >
                {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Stop' : 'Tes'}</span>
              </button>
            </div>
          </div>

          {/* Voice Speech Announcement */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Teks Suara Pengumuman Otomatis (TTS Bahasa Indonesia):
            </label>
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={2}
              placeholder="Contoh: Perhatian, saatnya jam ke satu dimulai."
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
            />
            <span className="text-[10px] text-slate-500">
              *Setelah nada bel berbunyi, suara pengumuman ini akan diucapkan secara otomatis.
            </span>
          </div>

          {/* (n) Kali Repeat */}
          <div className="flex items-center gap-3">
            <label className="font-bold text-slate-700">Ulangi Bunyi Bel ((n) Kali):</label>
            <select
              value={repeatCount}
              onChange={(e) => setRepeatCount(parseInt(e.target.value, 10))}
              className="bg-white border border-slate-300 rounded px-3 py-1 font-bold text-slate-800"
            >
              <option value={1}>1 Kali</option>
              <option value={2}>2 Kali</option>
              <option value={3}>3 Kali</option>
            </select>
          </div>

          {/* Apply to other days toggle (especially useful when adding standard school hours) */}
          {!editingItem && (
            <div className="bg-slate-200/80 rounded p-3 space-y-2 border border-slate-300">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToOtherDays}
                  onChange={(e) => setApplyToOtherDays(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-500"
                />
                <span>Terapkan jam ini juga ke hari lain sekaligus</span>
              </label>

              {applyToOtherDays && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALL_DAYS.map((d) => (
                    <label key={d} className="flex items-center gap-1 text-[11px] font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTargetDays.includes(d)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargetDays([...selectedTargetDays, d]);
                          } else {
                            setSelectedTargetDays(selectedTargetDays.filter((x) => x !== d));
                          }
                        }}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-300 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
