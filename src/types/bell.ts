export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export type ChimeType = 1 | 2 | 3 | 4 | 'electric' | 'dingdong' | 'triple' | 'alarm';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  time: string; // HH:mm format, e.g. "06:38"
  title: string; // e.g. "jam pembelajaran selesai"
  soundPath: string; // e.g. "c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3"
  chimeType: number; // 1, 2, 3, 4 chimes (nada bel)
  repeatCount: number; // (n) kali repeat
  enabled: boolean;
  voiceText?: string; // Optional custom speech announcement text
  customAudioData?: string; // Base64 or Blob URL for user uploaded custom sound
}

export interface SoundItem {
  id: string;
  name: string;
  path: string;
  category: 'pelajaran' | 'istirahat' | 'upacara' | 'ibadah' | 'darurat' | 'kustom';
  voiceText: string;
  defaultChime: number;
  customAudioData?: string;
  duration?: number;
}

export interface SchoolSettings {
  schoolName: string;
  schoolSubtext: string;
  schoolLogoText: string;
  schoolLogoImage?: string;
  version: string;
  isTrial: boolean;
  beepEnabled: boolean;
  autoBellEnabled: boolean;
  volume: number; // 0.0 to 1.0
  chimeVolume: number;
  voiceVolume: number;
  speechRate: number; // 0.8 - 1.2
  speechPitch: number;
  voiceLang: string;
  backgroundTheme: 'marine_classic' | 'navy_grid' | 'dark_slate' | 'royal_blue';
  customBgUrl?: string;
}
