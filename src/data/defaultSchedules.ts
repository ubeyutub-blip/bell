import { DayOfWeek, ScheduleItem, SoundItem, SchoolSettings } from '../types/bell';

export const DEFAULT_SOUNDS: SoundItem[] = [
  {
    id: 'sound-masuk',
    name: 'Bel Masuk Kelas (Jam Ke-1)',
    path: 'c:\\bellvoice\\sound\\jam masuk kelas.mp3',
    category: 'pelajaran',
    voiceText: 'Perhatian, bel tanda masuk sekolah telah berbunyi. Seluruh siswa diharapkan segera memasuki ruang kelas masing-masing.',
    defaultChime: 3
  },
  {
    id: 'sound-jam-01',
    name: 'Jam Pelajaran Ke-01',
    path: 'c:\\bellvoice\\sound\\jam ke 01.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke satu dimulai.',
    defaultChime: 3
  },
  {
    id: 'sound-jam-02',
    name: 'Jam Pelajaran Ke-02',
    path: 'c:\\bellvoice\\sound\\jam ke 02.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke dua dimulai.',
    defaultChime: 3
  },
  {
    id: 'sound-jam-03',
    name: 'Jam Pelajaran Ke-03',
    path: 'c:\\bellvoice\\sound\\jam ke 03.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke tiga dimulai.',
    defaultChime: 2
  },
  {
    id: 'sound-jam-04',
    name: 'Jam Pelajaran Ke-04',
    path: 'c:\\bellvoice\\sound\\jam ke 04.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke empat dimulai.',
    defaultChime: 2
  },
  {
    id: 'sound-jam-05',
    name: 'Jam Pelajaran Ke-05',
    path: 'c:\\bellvoice\\sound\\jam ke 05.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke lima dimulai.',
    defaultChime: 3
  },
  {
    id: 'sound-jam-06',
    name: 'Jam Pelajaran Ke-06',
    path: 'c:\\bellvoice\\sound\\jam ke 06.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke enam dimulai.',
    defaultChime: 2
  },
  {
    id: 'sound-jam-07',
    name: 'Jam Pelajaran Ke-07',
    path: 'c:\\bellvoice\\sound\\jam ke 07.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke tujuh dimulai.',
    defaultChime: 2
  },
  {
    id: 'sound-jam-08',
    name: 'Jam Pelajaran Ke-08',
    path: 'c:\\bellvoice\\sound\\jam ke 08.mp3',
    category: 'pelajaran',
    voiceText: 'Saatnya jam pelajaran ke delapan dimulai.',
    defaultChime: 2
  },
  {
    id: 'sound-selesai',
    name: 'Jam Pembelajaran Selesai (Pulang)',
    path: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
    category: 'pelajaran',
    voiceText: 'Perhatian, seluruh kegiatan belajar mengajar hari ini telah selesai. Selamat jalan dan hati-hati di perjalanan pulang.',
    defaultChime: 3
  },
  {
    id: 'sound-istirahat',
    name: 'Jam Istirahat',
    path: 'c:\\bellvoice\\sound\\jam istirahat.mp3',
    category: 'istirahat',
    voiceText: 'Waktu istirahat telah tiba. Selamat beristirahat dan tetap menjaga ketertiban serta kebersihan lingkungan sekolah.',
    defaultChime: 2
  },
  {
    id: 'sound-istirahat-5',
    name: 'Istirahat Tinggal 5 Menit Lagi',
    path: 'c:\\bellvoice\\sound\\istirahat tinggal 5 menit lagi.mp3',
    category: 'istirahat',
    voiceText: 'Perhatian, waktu istirahat tinggal lima menit lagi. Silakan segera mempersiapkan diri kembali ke ruang kelas.',
    defaultChime: 3
  },
  {
    id: 'sound-kegiatan-5',
    name: 'Kegiatan Belajar 5 Menit Lagi',
    path: 'c:\\bellvoice\\sound\\kegiatan belajar 5 menit lagi.mp3',
    category: 'pelajaran',
    voiceText: 'Perhatian, kegiatan belajar mengajar akan dimulai lima menit lagi. Bapak dan Ibu guru dipersilakan menuju ruang kelas.',
    defaultChime: 3
  },
  {
    id: 'sound-upacara',
    name: 'Upacara Bendera',
    path: 'c:\\bellvoice\\sound\\upacara bendera.mp3',
    category: 'upacara',
    voiceText: 'Perhatian, saatnya bersiap-siap menuju lapangan upacara untuk mengikuti Upacara Bendera.',
    defaultChime: 4
  },
  {
    id: 'sound-sholat',
    name: 'Sholat Dzuhur Berjamaah',
    path: 'c:\\bellvoice\\sound\\sholat dzuhur.mp3',
    category: 'ibadah',
    voiceText: 'Waktu sholat Dzuhur telah tiba. Dipersilakan kepada seluruh siswa dan guru Muslim menuju musholla atau masjid sekolah.',
    defaultChime: 3
  },
  {
    id: 'sound-senam',
    name: 'Senam Pagi / Kebugaran',
    path: 'c:\\bellvoice\\sound\\senam pagi.mp3',
    category: 'upacara',
    voiceText: 'Perhatian, seluruh warga sekolah diharapkan berkumpul di lapangan untuk kegiatan senam pagi bersama.',
    defaultChime: 3
  },
  {
    id: 'sound-darurat-gempa',
    name: 'Peringatan Darurat Gempa / Evakuasi',
    path: 'c:\\bellvoice\\sound\\bel darurat gempa.mp3',
    category: 'darurat',
    voiceText: 'Perhatian! Peringatan darurat! Segera lindungi kepala dan lakukan evakuasi menuju titik kumpul dengan tertib.',
    defaultChime: 4
  }
];

export const INITIAL_SCHEDULE: Record<DayOfWeek, ScheduleItem[]> = {
  Senin: [
    {
      id: 'sen-01',
      day: 'Senin',
      time: '06:45',
      title: 'upacara bendera hari senin',
      soundPath: 'c:\\bellvoice\\sound\\upacara bendera.mp3',
      chimeType: 4,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, seluruh siswa, dewan guru dan staf dipersilakan berkumpul di lapangan untuk pelaksanaan upacara bendera.'
    },
    {
      id: 'sen-02',
      day: 'Senin',
      time: '07:30',
      title: 'jam ke 01',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 01.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke satu dimulai.'
    },
    {
      id: 'sen-03',
      day: 'Senin',
      time: '08:15',
      title: 'jam ke 02',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 02.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke dua dimulai.'
    },
    {
      id: 'sen-04',
      day: 'Senin',
      time: '09:00',
      title: 'jam ke 03',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 03.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke tiga dimulai.'
    },
    {
      id: 'sen-05',
      day: 'Senin',
      time: '09:45',
      title: 'jam istirahat',
      soundPath: 'c:\\bellvoice\\sound\\jam istirahat.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu istirahat pertama telah tiba. Selamat beristirahat.'
    },
    {
      id: 'sen-06',
      day: 'Senin',
      time: '10:10',
      title: 'istirahat tinggal 5 menit lagi',
      soundPath: 'c:\\bellvoice\\sound\\istirahat tinggal 5 menit lagi.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu istirahat tinggal lima menit lagi. Silakan kembali ke kelas.'
    },
    {
      id: 'sen-07',
      day: 'Senin',
      time: '10:15',
      title: 'jam ke 04',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 04.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke empat dimulai.'
    },
    {
      id: 'sen-08',
      day: 'Senin',
      time: '11:00',
      title: 'jam ke 05',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 05.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke lima dimulai.'
    },
    {
      id: 'sen-09',
      day: 'Senin',
      time: '11:45',
      title: 'sholat dzuhur dan istirahat ke 2',
      soundPath: 'c:\\bellvoice\\sound\\sholat dzuhur.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu sholat Dzuhur berjamaah dan istirahat kedua telah tiba.'
    },
    {
      id: 'sen-10',
      day: 'Senin',
      time: '12:30',
      title: 'jam ke 06',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 06.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke enam dimulai.'
    },
    {
      id: 'sen-11',
      day: 'Senin',
      time: '13:15',
      title: 'jam ke 07',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 07.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke tujuh dimulai.'
    },
    {
      id: 'sen-12',
      day: 'Senin',
      time: '14:00',
      title: 'jam pembelajaran selesai',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, seluruh jam pelajaran hari ini telah selesai. Selamat beristirahat dan sampai jumpa besok.'
    }
  ],
  Selasa: [
    {
      id: 'sel-01',
      day: 'Selasa',
      time: '07:00',
      title: 'kegiatan literasi dan doa pagi',
      soundPath: 'c:\\bellvoice\\sound\\jam masuk kelas.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya kegiatan doa bersama dan literasi pagi dimulai.'
    },
    {
      id: 'sel-02',
      day: 'Selasa',
      time: '07:15',
      title: 'jam ke 01',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 01.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke satu dimulai.'
    },
    {
      id: 'sel-03',
      day: 'Selasa',
      time: '08:00',
      title: 'jam ke 02',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 02.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke dua dimulai.'
    },
    {
      id: 'sel-04',
      day: 'Selasa',
      time: '08:45',
      title: 'jam ke 03',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 03.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke tiga dimulai.'
    },
    {
      id: 'sel-05',
      day: 'Selasa',
      time: '09:30',
      title: 'jam istirahat',
      soundPath: 'c:\\bellvoice\\sound\\jam istirahat.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu istirahat telah tiba.'
    },
    {
      id: 'sel-06',
      day: 'Selasa',
      time: '09:55',
      title: 'istirahat tinggal 5 menit lagi',
      soundPath: 'c:\\bellvoice\\sound\\istirahat tinggal 5 menit lagi.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu istirahat tinggal lima menit lagi.'
    },
    {
      id: 'sel-07',
      day: 'Selasa',
      time: '10:00',
      title: 'jam ke 04',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 04.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke empat dimulai.'
    },
    {
      id: 'sel-08',
      day: 'Selasa',
      time: '14:00',
      title: 'jam pembelajaran selesai',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Jam pembelajaran selesai. Selamat siang.'
    }
  ],
  Rabu: [
    {
      id: 'rab-01',
      day: 'Rabu',
      time: '07:00',
      title: 'jam masuk kelas',
      soundPath: 'c:\\bellvoice\\sound\\jam masuk kelas.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Bel masuk telah berbunyi. Silakan masuk kelas.'
    },
    {
      id: 'rab-02',
      day: 'Rabu',
      time: '07:15',
      title: 'jam ke 01',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 01.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam ke satu dimulai.'
    },
    {
      id: 'rab-03',
      day: 'Rabu',
      time: '08:00',
      title: 'jam ke 02',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 02.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam ke dua dimulai.'
    },
    {
      id: 'rab-04',
      day: 'Rabu',
      time: '09:30',
      title: 'jam istirahat',
      soundPath: 'c:\\bellvoice\\sound\\jam istirahat.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu istirahat telah tiba.'
    },
    {
      id: 'rab-05',
      day: 'Rabu',
      time: '14:00',
      title: 'jam pembelajaran selesai',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Jam pembelajaran telah selesai.'
    }
  ],
  // EXACT SCHEDULE AS SHOWN IN USER PHOTO FOR KAMIS!
  Kamis: [
    {
      id: 'kam-01',
      day: 'Kamis',
      time: '06:38',
      title: 'jam pembelajaran selesai',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, jam pembelajaran telah selesai.'
    },
    {
      id: 'kam-02',
      day: 'Kamis',
      time: '06:39',
      title: 'jam ke 02',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 02.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, saatnya jam ke nol dua dimulai.'
    },
    {
      id: 'kam-03',
      day: 'Kamis',
      time: '06:40',
      title: 'jam pembelajaran selesai',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, jam pembelajaran telah selesai.'
    },
    {
      id: 'kam-04',
      day: 'Kamis',
      time: '06:42',
      title: 'jam ke 03',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 03.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, saatnya jam ke nol tiga dimulai.'
    },
    {
      id: 'kam-05',
      day: 'Kamis',
      time: '06:43',
      title: 'jam istirahat',
      soundPath: 'c:\\bellvoice\\sound\\jam istirahat.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, saatnya waktu istirahat.'
    },
    {
      id: 'kam-06',
      day: 'Kamis',
      time: '06:44',
      title: 'istirahat tinggal 5 menit lagi',
      soundPath: 'c:\\bellvoice\\sound\\istirahat tinggal 5 menit lagi.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, waktu istirahat tinggal lima menit lagi.'
    },
    {
      id: 'kam-07',
      day: 'Kamis',
      time: '06:45',
      title: 'kegiatan belajar 5 menit lagi',
      soundPath: 'c:\\bellvoice\\sound\\kegiatan belajar 5 menit lagi.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, kegiatan belajar mengajar dimulai lima menit lagi.'
    },
    {
      id: 'kam-08',
      day: 'Kamis',
      time: '06:46',
      title: 'jam ke 04',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 04.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, saatnya jam ke nol empat dimulai.'
    }
  ],
  Jumat: [
    {
      id: 'jum-01',
      day: 'Jumat',
      time: '06:45',
      title: 'senam pagi kebugaran jasmani',
      soundPath: 'c:\\bellvoice\\sound\\senam pagi.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, kegiatan senam pagi segera dimulai. Seluruh siswa diharapkan berkumpul di lapangan.'
    },
    {
      id: 'jum-02',
      day: 'Jumat',
      time: '07:15',
      title: 'jam ke 01',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 01.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke satu dimulai.'
    },
    {
      id: 'jum-03',
      day: 'Jumat',
      time: '08:00',
      title: 'jam ke 02',
      soundPath: 'c:\\bellvoice\\sound\\jam ke 02.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Saatnya jam pelajaran ke dua dimulai.'
    },
    {
      id: 'jum-04',
      day: 'Jumat',
      time: '09:00',
      title: 'jam istirahat',
      soundPath: 'c:\\bellvoice\\sound\\jam istirahat.mp3',
      chimeType: 2,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Waktu istirahat telah tiba.'
    },
    {
      id: 'jum-05',
      day: 'Jumat',
      time: '11:15',
      title: 'persiapan sholat jumat berjamaah',
      soundPath: 'c:\\bellvoice\\sound\\sholat dzuhur.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, persiapan ibadah sholat Jumat. Seluruh siswa dan dewan guru muslim dipersilakan menuju masjid.'
    },
    {
      id: 'jum-06',
      day: 'Jumat',
      time: '11:30',
      title: 'jam pembelajaran selesai (kepulangan jumat)',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Kegiatan belajar hari Jumat telah selesai. Selamat pulang.'
    }
  ],
  Sabtu: [
    {
      id: 'sab-01',
      day: 'Sabtu',
      time: '07:30',
      title: 'kegiatan ekstrakurikuler & pramuka',
      soundPath: 'c:\\bellvoice\\sound\\jam masuk kelas.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Perhatian, kegiatan pengembangan diri dan ekstrakurikuler pramuka segera dimulai.'
    },
    {
      id: 'sab-02',
      day: 'Sabtu',
      time: '11:30',
      title: 'kegiatan ekstrakurikuler selesai',
      soundPath: 'c:\\bellvoice\\sound\\jam pembelajaran selesai.mp3',
      chimeType: 3,
      repeatCount: 1,
      enabled: true,
      voiceText: 'Kegiatan hari Sabtu telah selesai. Selamat berlibur akhir pekan.'
    }
  ],
  Minggu: []
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'SD/SMP/SMA UNGGULAN',
  schoolSubtext: 'SISTEM BEL SEKOLAH OTOMATIS TERPADU',
  schoolLogoText: 'LOGO',
  version: 'Versi 1.02',
  isTrial: true,
  beepEnabled: true,
  autoBellEnabled: true,
  volume: 0.9,
  chimeVolume: 0.85,
  voiceVolume: 0.95,
  speechRate: 0.95,
  speechPitch: 1.0,
  voiceLang: 'id-ID',
  backgroundTheme: 'marine_classic'
};
