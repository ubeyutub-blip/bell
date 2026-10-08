/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TopHeader } from './components/TopHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { ScheduleTable } from './components/ScheduleTable';
import { MediaPlayerBox } from './components/MediaPlayerBox';
import { EditScheduleModal } from './components/EditScheduleModal';
import { SoundManagerModal } from './components/SoundManagerModal';
import { BannerSettingsModal } from './components/BannerSettingsModal';
import { BackgroundSettingsModal } from './components/BackgroundSettingsModal';
import { HelpAboutModal } from './components/HelpAboutModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { WindowsInstallerModal } from './components/WindowsInstallerModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { soundEngine } from './audio/soundEngine';
import { DayOfWeek, ScheduleItem, SoundItem, SchoolSettings } from './types/bell';
import { INITIAL_SCHEDULE, DEFAULT_SOUNDS, DEFAULT_SETTINGS } from './data/defaultSchedules';

const DAY_MAP: DayOfWeek[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function App() {
  // State from LocalStorage or Defaults
  const [schedules, setSchedules] = useState<Record<DayOfWeek, ScheduleItem[]>>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_schedules');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SCHEDULE;
  });

  const [soundLibrary, setSoundLibrary] = useState<SoundItem[]>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_sounds');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SOUNDS;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Current Day & Active Selection
  const todayIndex = new Date().getDay();
  const currentRealDay = DAY_MAP[todayIndex];

  // Default to today or 'Kamis' (as displayed in the photo)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Kamis');
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingTitle, setPlayingTitle] = useState<string>('');

  // Modals state
  const [activeView, setActiveView] = useState<'jadwal' | 'sound' | 'edit'>('jadwal');
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isSoundManagerOpen, setIsSoundManagerOpen] = useState<boolean>(false);
  const [isBannerSettingsOpen, setIsBannerSettingsOpen] = useState<boolean>(false);
  const [isBgSettingsOpen, setIsBgSettingsOpen] = useState<boolean>(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);
  const [isWindowsInstallerOpen, setIsWindowsInstallerOpen] = useState<boolean>(false);
  const [helpModalType, setHelpModalType] = useState<'help' | 'about' | null>(null);

  // In-app Toasts & Confirmations (Strictly avoiding window.alert / window.confirm)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const addToast = (type: 'success' | 'warning' | 'info' | 'error', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Last triggered minute to avoid duplicate auto-rings
  const lastTriggeredMinuteRef = useRef<string>('');
  const fileImportInputRef = useRef<HTMLInputElement | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bel_sekolah_schedules', JSON.stringify(schedules));
    } catch {
      // ignore
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem('bel_sekolah_sounds', JSON.stringify(soundLibrary));
    } catch {
      // ignore
    }
  }, [soundLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem('bel_sekolah_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
    soundEngine.setMasterVolume(settings.volume);
  }, [settings]);

  // Subscribe to Sound Engine State
  useEffect(() => {
    const unsub = soundEngine.subscribe((playing, title) => {
      setIsPlaying(playing);
      setPlayingTitle(title);
    });
    return () => {
      unsub();
    };
  }, []);

  // Update selectedItem when day changes
  useEffect(() => {
    const dayItems = schedules[selectedDay] || [];
    if (dayItems.length > 0) {
      if (!selectedItem || !dayItems.some((x) => x.id === selectedItem.id)) {
        setSelectedItem(dayItems[0]);
      }
    } else {
      setSelectedItem(null);
    }
  }, [selectedDay, schedules]);

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // AUTOMATIC BELL SCHEDULER LOOP (Every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!settings.autoBellEnabled) return;

      const now = new Date();
      const currentDayName = DAY_MAP[now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = now.getSeconds();
      const timeHHmm = `${hours}:${minutes}`;

      // Only trigger on the first second of the minute (0 or 1)
      if (seconds <= 1 && lastTriggeredMinuteRef.current !== `${currentDayName}-${timeHHmm}`) {
        const todaySchedules = schedules[currentDayName] || [];
        const matchedItem = todaySchedules.find(
          (item) => item.enabled && item.time === timeHHmm
        );

        if (matchedItem) {
          lastTriggeredMinuteRef.current = `${currentDayName}-${timeHHmm}`;

          // Play automatic bell sequence
          soundEngine.triggerBellSequence(
            {
              title: matchedItem.title,
              soundPath: matchedItem.soundPath,
              chimeType: matchedItem.chimeType,
              repeatCount: matchedItem.repeatCount,
              voiceText: matchedItem.voiceText,
              customAudioData: matchedItem.customAudioData
            },
            {
              beepEnabled: settings.beepEnabled,
              volume: settings.volume,
              chimeVolume: settings.chimeVolume,
              voiceVolume: settings.voiceVolume,
              rate: settings.speechRate
            }
          );

          addToast('info', `Bel otomatis "${matchedItem.title}" (${matchedItem.time}) sedang berbunyi.`, 'Bel Berbunyi');

          // Browser Notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Bel Sekolah: ${matchedItem.title.toUpperCase()}`, {
                body: `Waktu: ${matchedItem.time} - ${settings.schoolName}`,
                icon: '/favicon.ico'
              });
            } catch {
              // ignore
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedules, settings]);

  // Compute Next Bell for Today
  const nextScheduleInfo = useMemo(() => {
    const now = new Date();
    const todayName = DAY_MAP[now.getDay()];
    const todayItems = (schedules[todayName] || []).filter((x) => x.enabled);

    if (todayItems.length === 0) return null;

    const currentTotalSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    for (const item of todayItems) {
      const [h, m] = item.time.split(':').map(Number);
      const itemSecs = h * 3600 + m * 60;
      if (itemSecs > currentTotalSecs) {
        return {
          item,
          timeDiffSeconds: itemSecs - currentTotalSecs
        };
      }
    }

    return null;
  }, [schedules]);

  // Handlers
  const handleUpdateSettings = (partial: Partial<SchoolSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handlePlayManual = (item: ScheduleItem) => {
    soundEngine.triggerBellSequence(
      {
        title: item.title,
        soundPath: item.soundPath,
        chimeType: item.chimeType,
        repeatCount: item.repeatCount,
        voiceText: item.voiceText,
        customAudioData: item.customAudioData
      },
      {
        beepEnabled: settings.beepEnabled,
        volume: settings.volume,
        chimeVolume: settings.chimeVolume,
        voiceVolume: settings.voiceVolume,
        rate: settings.speechRate
      }
    );
  };

  const handleStopPlay = () => {
    soundEngine.stopAll();
  };

  const handleTestSpeaker = () => {
    if (isPlaying) {
      soundEngine.stopAll();
    } else {
      soundEngine.triggerBellSequence(
        {
          title: 'Tes Suara Speaker Bel Sekolah',
          chimeType: 3,
          repeatCount: 1,
          voiceText: 'Tes sistem audio bel sekolah. Suara speaker berfungsi dengan baik.'
        },
        {
          beepEnabled: settings.beepEnabled,
          volume: settings.volume,
          chimeVolume: settings.chimeVolume,
          voiceVolume: settings.voiceVolume
        }
      );
    }
  };

  const handleTriggerQuickBell = async (type: 'short1' | 'chime2' | 'chime3' | 'electric') => {
    soundEngine.stopAll();
    if (type === 'short1') {
      await soundEngine.playWestminsterChime(1, settings.chimeVolume * settings.volume);
    } else if (type === 'chime2') {
      await soundEngine.playWestminsterChime(2, settings.chimeVolume * settings.volume);
    } else if (type === 'chime3') {
      await soundEngine.playWestminsterChime(3, settings.chimeVolume * settings.volume);
    } else if (type === 'electric') {
      await soundEngine.playElectricBell(3.0, settings.volume);
    }
  };

  const handleRequestEmergencyAlarm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'SIRENE ALARM DARURAT',
      message: 'PERINGATAN: Apakah Anda yakin ingin membunyikan Sirene Darurat / Alarm Bahaya evakuasi sekarang ke seluruh speaker sekolah?',
      confirmLabel: 'Bunyikan Alarm Sekarang',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        soundEngine.triggerBellSequence(
          {
            title: 'PERINGATAN DARURAT SEKOLAH',
            chimeType: 4,
            repeatCount: 2,
            voiceText: 'Perhatian! Keadaan darurat, seluruh siswa dan staf diharapkan segera berkumpul di titik evakuasi.'
          },
          {
            beepEnabled: true,
            volume: settings.volume,
            chimeVolume: 1.0,
            voiceVolume: 1.0
          }
        );
      }
    });
  };

  const handleRequestExit = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset / Tutup Bel Sekolah',
      message: 'Apakah Anda yakin ingin me-reset atau memuat ulang sistem Bel Sekolah Otomatis?',
      confirmLabel: 'Muat Ulang',
      cancelLabel: 'Batal',
      isDestructive: false,
      onConfirm: () => {
        window.location.reload();
      }
    });
  };

  // Schedule CRUD
  const handleSaveSchedule = (
    itemData: Partial<ScheduleItem>,
    applyToDays?: DayOfWeek[]
  ) => {
    setSchedules((prev) => {
      const updated = { ...prev };
      const targetDays = applyToDays && applyToDays.length > 0 ? applyToDays : [itemData.day as DayOfWeek];

      targetDays.forEach((d) => {
        const dayList = [...(updated[d] || [])];
        if (itemData.id && !applyToDays) {
          const index = dayList.findIndex((x) => x.id === itemData.id);
          if (index >= 0) {
            dayList[index] = { ...dayList[index], ...itemData } as ScheduleItem;
          }
        } else {
          const newItem: ScheduleItem = {
            id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            day: d,
            time: itemData.time || '07:00',
            title: itemData.title || 'jam baru',
            soundPath: itemData.soundPath || 'c:\\bellvoice\\sound\\jam ke 01.mp3',
            chimeType: itemData.chimeType !== undefined ? itemData.chimeType : 3,
            repeatCount: itemData.repeatCount || 1,
            enabled: true,
            voiceText: itemData.voiceText,
            customAudioData: itemData.customAudioData
          };
          dayList.push(newItem);
        }

        dayList.sort((a, b) => a.time.localeCompare(b.time));
        updated[d] = dayList;
      });

      return updated;
    });

    addToast('success', `Jadwal "${itemData.title}" berhasil disimpan.`);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => {
      const updated = { ...prev };
      const dayList = (updated[selectedDay] || []).filter((x) => x.id !== id);
      updated[selectedDay] = dayList;
      return updated;
    });
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleRequestDelete = (item: ScheduleItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Jadwal Bel',
      message: `Apakah Anda yakin ingin menghapus jadwal "${item.title}" (${item.time}) dari hari ${selectedDay}?`,
      confirmLabel: 'Hapus Jadwal',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        handleDeleteSchedule(item.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast('info', `Jadwal "${item.title}" telah dihapus.`);
      }
    });
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules((prev) => {
      const updated = { ...prev };
      const dayList = (updated[selectedDay] || []).map((x) =>
        x.id === id ? { ...x, enabled: !x.enabled } : x
      );
      updated[selectedDay] = dayList;
      return updated;
    });
  };

  // Copy selected row to other day(s)
  const handleCopySelectedToDay = (target: DayOfWeek | 'all_weekdays') => {
    if (!selectedItem) return;

    setSchedules((prev) => {
      const updated = { ...prev };
      const targetDays: DayOfWeek[] =
        target === 'all_weekdays'
          ? ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
          : [target];

      targetDays.forEach((d) => {
        if (d === selectedDay && target !== 'all_weekdays') return;
        const list = [...(updated[d] || [])];
        const copyItem: ScheduleItem = {
          ...selectedItem,
          id: `sch-copy-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          day: d
        };
        list.push(copyItem);
        list.sort((a, b) => a.time.localeCompare(b.time));
        updated[d] = list;
      });

      return updated;
    });

    addToast(
      'success',
      `Jadwal "${selectedItem.title}" (${selectedItem.time}) berhasil disalin ke hari ${
        target === 'all_weekdays' ? 'Senin - Jumat' : target
      }!`,
      'Jadwal Disalin'
    );
  };

  // Copy all day's schedules
  const handleCopyAllDayToTarget = (target: DayOfWeek | 'all_weekdays') => {
    const sourceItems = schedules[selectedDay] || [];
    if (sourceItems.length === 0) {
      addToast('warning', `Jadwal hari ${selectedDay} masih kosong.`, 'Salin Gagal');
      return;
    }

    setSchedules((prev) => {
      const updated = { ...prev };
      const targetDays: DayOfWeek[] =
        target === 'all_weekdays'
          ? (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as DayOfWeek[]).filter((d) => d !== selectedDay)
          : [target];

      targetDays.forEach((d) => {
        const cloned = sourceItems.map((item) => ({
          ...item,
          id: `sch-copyall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          day: d
        }));
        cloned.sort((a, b) => a.time.localeCompare(b.time));
        updated[d] = cloned;
      });

      return updated;
    });

    addToast('success', `Semua jadwal hari ${selectedDay} berhasil disalin!`, 'Salin Sukses');
  };

  // Export / Import
  const handleExportSchedules = () => {
    const dataStr = JSON.stringify(
      {
        schedules,
        settings,
        soundLibrary,
        exportDate: new Date().toISOString()
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jadwal_bel_sekolah_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'File cadangan JSON berhasil diunduh.', 'Ekspor Jadwal');
  };

  const handleImportSchedules = () => {
    fileImportInputRef.current?.click();
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.schedules) {
          setSchedules(json.schedules);
        }
        if (json.settings) {
          setSettings(json.settings);
        }
        if (json.soundLibrary) {
          setSoundLibrary(json.soundLibrary);
        }
        addToast('success', 'Data jadwal dan konfigurasi suara berhasil diimpor!', 'Impor Berhasil');
      } catch {
        addToast('error', 'Gagal membaca file JSON cadangan. Format tidak sesuai.', 'Impor Gagal');
      }
    };
    reader.readAsText(file);
  };

  // Background style selection matching photo
  const getBackgroundStyle = (): React.CSSProperties => {
    if (settings.customBgUrl) {
      return {
        backgroundImage: `url(${settings.customBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }

    if (settings.backgroundTheme === 'marine_classic') {
      return {
        background: 'linear-gradient(135deg, #0e3065 0%, #17488f 40%, #1f5cae 70%, #0d2c5e 100%)',
        backgroundImage: `
          radial-gradient(ellipse at 85% 90%, rgba(56, 189, 248, 0.25) 0%, transparent 50%),
          radial-gradient(circle at 15% 20%, rgba(29, 78, 216, 0.4) 0%, transparent 60%),
          linear-gradient(135deg, #0e3065 0%, #17488f 45%, #18529d 75%, #0d2c5e 100%)
        `
      };
    }

    if (settings.backgroundTheme === 'navy_grid') {
      return {
        backgroundColor: '#0a192f',
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      };
    }

    if (settings.backgroundTheme === 'royal_blue') {
      return {
        background: 'linear-gradient(to bottom, #1e3a8a, #172554)'
      };
    }

    return {
      backgroundColor: '#0f172a'
    };
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col font-sans select-none overflow-x-hidden text-slate-100 relative"
      style={getBackgroundStyle()}
    >
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileImportInputRef}
        accept=".json"
        onChange={handleFileImportChange}
        className="hidden"
      />

      {/* Top Header Bar (Red Banner with Digital Clock) */}
      <TopHeader
        settings={settings}
        onOpenBannerSettings={() => setIsBannerSettingsOpen(true)}
        onOpenHelp={() => setHelpModalType('help')}
        isPlaying={isPlaying}
        onRequestExit={handleRequestExit}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onOpenWindowsInstaller={() => setIsWindowsInstallerOpen(true)}
      />

      {/* Main Workspace Layout (Sidebar + Schedule Table + Media Monitor) */}
      <main className="flex-1 flex flex-col md:flex-row p-3 gap-3 overflow-hidden">
        {/* Left Control Panel */}
        <LeftSidebar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAddSchedule={() => {
            setEditingItem(null);
            setIsAddEditOpen(true);
          }}
          onOpenSoundManager={() => setIsSoundManagerOpen(true)}
          onOpenBannerSettings={() => setIsBannerSettingsOpen(true)}
          onOpenBgSettings={() => setIsBgSettingsOpen(true)}
          onOpenHelp={() => setHelpModalType('help')}
          onOpenAbout={() => setHelpModalType('about')}
          onExportSchedules={handleExportSchedules}
          onImportSchedules={handleImportSchedules}
          isPlaying={isPlaying}
          onTestSpeaker={handleTestSpeaker}
          onRequestExit={handleRequestExit}
          onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          onOpenWindowsInstaller={() => setIsWindowsInstallerOpen(true)}
        />

        {/* Center Schedule Grid Table */}
        <ScheduleTable
          currentDay={currentRealDay}
          selectedDay={selectedDay}
          onSelectDay={(day) => setSelectedDay(day)}
          schedules={schedules[selectedDay] || []}
          selectedItem={selectedItem}
          onSelectItem={(item) => setSelectedItem(item)}
          onPlayManual={handlePlayManual}
          onStopPlay={handleStopPlay}
          isPlaying={isPlaying}
          playingItemTitle={playingTitle}
          onEditItem={(item) => {
            setEditingItem(item);
            setIsAddEditOpen(true);
          }}
          onRequestDelete={handleRequestDelete}
          onToggleItem={handleToggleSchedule}
          onCopySelectedToDay={handleCopySelectedToDay}
          onCopyAllDayToTarget={handleCopyAllDayToTarget}
          onShowToast={addToast}
        />

        {/* Right Media Player Monitor & Countdown */}
        <MediaPlayerBox
          isPlaying={isPlaying}
          currentSoundName={playingTitle}
          onStop={handleStopPlay}
          nextSchedule={nextScheduleInfo}
          onTriggerQuickBell={handleTriggerQuickBell}
          onRequestEmergencyAlarm={handleRequestEmergencyAlarm}
          volume={settings.volume}
          onChangeVolume={(vol) => handleUpdateSettings({ volume: vol })}
        />
      </main>

      {/* Add / Edit Schedule Modal */}
      <EditScheduleModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveSchedule}
        editingItem={editingItem}
        defaultDay={selectedDay}
        soundLibrary={soundLibrary}
        onTestSound={(item) => {
          soundEngine.triggerBellSequence(item, {
            beepEnabled: settings.beepEnabled,
            volume: settings.volume,
            chimeVolume: settings.chimeVolume,
            voiceVolume: settings.voiceVolume,
            rate: settings.speechRate
          });
        }}
        onStopTest={handleStopPlay}
        isPlaying={isPlaying}
      />

      {/* Sound Manager Modal */}
      <SoundManagerModal
        isOpen={isSoundManagerOpen}
        onClose={() => setIsSoundManagerOpen(false)}
        soundLibrary={soundLibrary}
        onAddCustomSound={(newSound) => {
          setSoundLibrary((prev) => [...prev, newSound]);
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onPreviewSound={(sound) => {
          soundEngine.triggerBellSequence(
            {
              title: sound.name,
              soundPath: sound.path,
              chimeType: sound.defaultChime,
              repeatCount: 1,
              voiceText: sound.voiceText,
              customAudioData: sound.customAudioData
            },
            {
              beepEnabled: settings.beepEnabled,
              volume: settings.volume,
              chimeVolume: settings.chimeVolume,
              voiceVolume: settings.voiceVolume,
              rate: settings.speechRate
            }
          );
        }}
        onStopPreview={handleStopPlay}
        isPlaying={isPlaying}
        playingSoundTitle={playingTitle}
      />

      {/* Banner & School Name Settings Modal */}
      <BannerSettingsModal
        isOpen={isBannerSettingsOpen}
        onClose={() => setIsBannerSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Background Wallpaper Settings Modal */}
      <BackgroundSettingsModal
        isOpen={isBgSettingsOpen}
        onClose={() => setIsBgSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Help & About Modal */}
      <HelpAboutModal
        isOpen={helpModalType !== null}
        onClose={() => setHelpModalType(null)}
        type={helpModalType || 'help'}
        settings={settings}
      />

      {/* Google Drive Sync & Backup Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        schedules={schedules}
        settings={settings}
        soundLibrary={soundLibrary}
        onRestoreBackup={(backup) => {
          if (backup.schedules) setSchedules(backup.schedules);
          if (backup.settings) setSettings(backup.settings);
          if (backup.soundLibrary) setSoundLibrary(backup.soundLibrary);
        }}
        onAddImportedSound={(newSound) => {
          setSoundLibrary((prev) => [...prev, newSound]);
        }}
        onShowToast={addToast}
        onRequestConfirm={(dialog) => {
          setConfirmDialog({
            isOpen: true,
            title: dialog.title,
            message: dialog.message,
            confirmLabel: dialog.confirmLabel,
            cancelLabel: dialog.cancelLabel,
            isDestructive: dialog.isDestructive,
            onConfirm: dialog.onConfirm
          });
        }}
      />

      {/* Windows Desktop Installer Modal */}
      <WindowsInstallerModal
        isOpen={isWindowsInstallerOpen}
        onClose={() => setIsWindowsInstallerOpen(false)}
        onShowToast={addToast}
      />

      {/* In-App Toasts (Non-blocking) */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      {/* In-App Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
