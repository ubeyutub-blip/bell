import React, { useState } from 'react';
import {
  X,
  Download,
  Laptop,
  CheckCircle2,
  HardDrive,
  Copy,
  Terminal,
  FolderDown,
  Sparkles,
  ShieldCheck,
  WifiOff,
  FileArchive,
  FileCode,
  PackageCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface WindowsInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info' | 'error', message: string, title?: string) => void;
}

export const WindowsInstallerModal: React.FC<WindowsInstallerModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'exe' | 'zip' | 'pwa'>('exe');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleDownloadOfflineExe = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/downloads/Setup_Bel_Sekolah_Offline.exe';
    link.download = 'Setup_Bel_Sekolah_Offline.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      onShowToast(
        'success',
        'File "Setup_Bel_Sekolah_Offline.exe" (0.78 MB) berhasil diunduh. Jalankan file ini di komputer sekolah!',
        'Unduhan File EXE Berhasil'
      );
    }, 800);
  };

  const handleDownloadOfflineZip = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/downloads/Bel_Sekolah_Offline_Windows.zip';
    link.download = 'Bel_Sekolah_Offline_Windows.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      onShowToast(
        'success',
        'Paket "Bel_Sekolah_Offline_Windows.zip" berhasil diunduh.',
        'Unduhan ZIP Berhasil'
      );
    }, 800);
  };

  const handleInstallPWA = async () => {
    const success = await install();
    if (success) {
      onShowToast('success', 'Aplikasi Bel Sekolah Otomatis berhasil dipasang di Windows!', 'Instalasi Berhasil');
      onClose();
    } else {
      onShowToast('info', 'Silakan klik ikon Pasang (Install) di bilah alamat browser Anda.');
    }
  };

  const handleCopyCmd = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
    onShowToast('info', 'Perintah berhasil disalin ke clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] text-slate-800">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Laptop className="w-4 h-4 text-emerald-400" />
            <span>Installer Windows Bel Sekolah Otomatis</span>
            <span className="bg-emerald-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 text-white">
              <WifiOff className="w-3 h-3" />
              100% Offline
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-200 border-b border-slate-300 px-4 flex items-center gap-2 text-xs flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('exe')}
            className={`py-2 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'exe'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. File Installer EXE (.EXE Offline) [Rekomendasi]</span>
          </button>

          <button
            onClick={() => setActiveTab('zip')}
            className={`py-2 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'zip'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Paket Arsip ZIP (.ZIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-blue-600 text-blue-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>3. Pasang via Browser (PWA)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'exe' && (
            <div className="space-y-4">
              {/* Highlight Box - File EXE Installer */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/80 border-2 border-emerald-400 rounded-lg p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-emerald-950">
                        Setup_Bel_Sekolah_Offline.exe
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        Standalone EXE
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed max-w-lg">
                      File installer biner Windows <code>.exe</code> mandiri (ukuran super ringan ~0.78 MB). Cukup klik ganda file ini di komputer Windows sekolah, program akan otomatis terpasang dan siap digunakan tanpa memerlukan koneksi internet sama sekali.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadOfflineExe}
                    disabled={isDownloading}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Mengunduh...' : 'Unduh File EXE (0.78 MB)'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step Installation Instructions */}
              <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  <span>Cara Memasang di Komputer Windows Sekolah:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">1</span>
                      <span>Unduh File .EXE</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Unduh <code>Setup_Bel_Sekolah_Offline.exe</code> lalu salin ke flashdisk/USB untuk dibawa ke komputer sekolah.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">2</span>
                      <span>Klik Ganda File EXE</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Di PC sekolah, klik ganda file <code>Setup_Bel_Sekolah_Offline.exe</code>. Konfirmasi pesan dialog instalasi.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">3</span>
                      <span>Selesai & Auto-Start</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Pintasan Desktop otomatis dibuat. Bel Sekolah siap otomatis aktif setiap pagi saat komputer dinyalakan.
                    </p>
                  </div>
                </div>

                {/* Technical details of the offline EXE */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded p-3 text-[11px] text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Fitur Installer EXE Offline:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-900 text-[10px] pl-1">
                    <li>
                      <strong>Format Biner Windows Native (.EXE):</strong> Dapat langsung dieksekusi di Windows tanpa butuh software unarchiver pihak ketiga seperti WinRAR atau 7-Zip.
                    </li>
                    <li>
                      <strong>Zero Dependency:</strong> Tidak perlu instal Node.js, Python, atau XAMPP di PC sekolah.
                    </li>
                    <li>
                      <strong>Audio Lengkap Tersedia Offline:</strong> Suara bel Westminster, kring lonceng sekolah, dan chimes tersimpan langsung di dalam file installer.
                    </li>
                    <li>
                      <strong>Pilihan Auto-Start:</strong> Otomatis berjalan di latar belakang saat komputer piket/tata usaha dihidupkan setiap pagi.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'zip' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4 text-amber-700" />
                    <span>Paket Arsip ZIP (Bel_Sekolah_Offline_Windows.zip)</span>
                  </h4>
                  <button
                    onClick={handleDownloadOfflineZip}
                    disabled={isDownloading}
                    className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>Unduh ZIP (0.72 MB)</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Jika kebijakan keamanan sekolah Anda memblokir unduhan file biner <code>.exe</code>, Anda dapat mengunduh paket arsip <code>.zip</code> ini.
                </p>
              </div>

              <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-2">
                <h5 className="font-bold text-slate-800 text-xs">Isi Berkas di Dalam Paket ZIP:</h5>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1">
                  <li><code>1_Instal_Bel_Sekolah_Offline.bat</code> - Script instalasi desktop & konfigurasi auto-start.</li>
                  <li><code>2_Buka_Langsung_Tanpa_Instal.bat</code> - Mode portable tanpa instal ke harddisk.</li>
                  <li><code>run_server_offline.ps1</code> - Server lokal mandiri bawaan Windows (PowerShell built-in).</li>
                  <li><code>Uninstall_Bel_Sekolah.bat</code> - Script penghapus instalasi jika diperlukan.</li>
                  <li><code>index.html & assets/</code> - Berkas tampilan dan audio nada bel sekolah.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-3">
              {isInstalled ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Aplikasi Sudah Terpasang di Komputer Anda!</div>
                    <div className="text-[11px] text-emerald-700">
                      Anda sedang menjalankan Bel Sekolah Otomatis dalam mode Aplikasi Mandiri (Standalone Desktop Windows).
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-blue-600" />
                      <span>Pasang ke Windows 10 / 11 dalam 1-Klik</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed max-w-md">
                      Jika komputer Anda saat ini sedang terhubung ke internet, Anda dapat memasang aplikasi langsung ke Desktop dan Menu Start Windows melalui fitur Web App resmi.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallPWA}
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Sekarang</span>
                  </button>
                </div>
              )}

              <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span>Petunjuk Pemasangan Manual di Microsoft Edge / Google Chrome:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed pl-1">
                  <li>
                    Buka aplikasi ini di <strong>Microsoft Edge</strong> atau <strong>Google Chrome</strong>.
                  </li>
                  <li>
                    Lihat ke ujung kanan <strong>Bilah Alamat (Address Bar)</strong> browser.
                  </li>
                  <li>
                    Klik ikon <strong>"Aplikasi Tersedia / Pasang Bel Sekolah Otomatis"</strong>.
                  </li>
                  <li>
                    Klik tombol <strong>"Instal / Pasang"</strong>.
                  </li>
                  <li>
                    Centang:
                    <span className="font-semibold text-slate-800 ml-1">
                      [✓] Sematkan ke Bilah Tugas (Taskbar) & [✓] Buat Pintasan Desktop
                    </span>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-200 border-t border-slate-300 px-4 py-2.5 flex items-center justify-between text-xs flex-shrink-0">
          <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mendukung Windows 7 SP1, Windows 8, Windows 10, dan Windows 11</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
