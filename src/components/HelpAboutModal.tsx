import React from 'react';
import { X, HelpCircle, Info, CheckCircle2, Clock, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { SchoolSettings } from '../types/bell';

interface HelpAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'help' | 'about';
  settings: SchoolSettings;
}

export const HelpAboutModal: React.FC<HelpAboutModalProps> = ({
  isOpen,
  onClose,
  type,
  settings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm">
            {type === 'help' ? (
              <>
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Petunjuk Penggunaan Bel Sekolah Otomatis</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-amber-400" />
                <span>Tentang Program Bel Sekolah (Otomatis)</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs text-slate-800 max-h-[460px] overflow-y-auto">
          {type === 'help' ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900">
                <h4 className="font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Cara Kerja Otomatis 24 Jam:</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Program ini mendeteksi waktu jam sistem secara real-time setiap detik. Saat waktu jam dan menit cocok dengan jadwal dan status <strong>"Bel Otomatis ON"</strong>, bel akan berbunyi secara otomatis tanpa perlu ditekan manual.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900">Langkah Penggunaan Cepat:</h5>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 leading-normal">
                  <li>
                    <strong>Pilih Hari</strong> (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu) pada tab jadwal di bagian atas.
                  </li>
                  <li>
                    <strong>Tambah / Edit Jadwal</strong> menggunakan tombol di menu sebelah kiri. Tentukan jam berbunyi, nama jadwal, nada bel (+), dan pengumuman suara.
                  </li>
                  <li>
                    <strong>Salin Jadwal</strong>: Gunakan fitur "Salin Jadwal yg di pilih ke Hari lain" untuk menduplikasi jadwal ke hari lainnya atau ke seluruh hari kerja sekaligus.
                  </li>
                  <li>
                    <strong>Tes Bel Manual</strong>: Klik salah satu baris jadwal di tabel, lalu tekan tombol <strong>"Play (manual)"</strong> untuk menguji suara bel.
                  </li>
                  <li>
                    <strong>Pengaturan Suara</strong>: Masuk ke menu "Sound (Mp3/Mp4/Wav)" untuk mengatur volume, mengunggah audio rekaman sekolah, atau mengatur pengumuman suara TTS.
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Catatan Browser:</strong> Agar audio dapat berbunyi otomatis tanpa terblokir oleh kebijakan browser, pastikan Anda telah berinteraksi (mengklik salah satu tombol di layar) saat pertama kali membuka aplikasi.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-red-700 text-white font-black text-lg rounded-lg mx-auto flex items-center justify-center shadow-md mb-2">
                  BEL
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  {settings.schoolName}
                </h3>
                <p className="text-slate-500 text-xs">Bel Sekolah (Otomatis) - {settings.version}</p>
                <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sistem Siap Digunakan</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2 text-slate-700 leading-relaxed">
                <p>
                  Perangkat lunak Bel Sekolah Otomatis dirancang untuk mempermudah tata kelola waktu pembelajaran di sekolah (SD, SMP, SMA, SMK, Madrasah, dan Pesantren).
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1 text-[11px]">
                  <div><strong>Pengembang:</strong> AI Studio Software Engine</div>
                  <div><strong>Fitur Utama:</strong> Sintesis Nada Bel Westminster, Bel Elektrik, Suara Pengumuman Bahasa Indonesia, Kalender Hari Lengkap, Ekspor/Impor Jadwal.</div>
                  <div><strong>Kompatibilitas:</strong> Semua Browser Desktop Modern & Sistem Operasi.</div>
                </div>
              </div>
            </>
          )}
        </div>

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
