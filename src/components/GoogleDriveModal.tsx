import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  RefreshCw,
  Trash2,
  Download,
  Music,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  initAuth
} from '../services/googleAuth';
import {
  listDriveBackups,
  listDriveAudioFiles,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  downloadDriveAudioAsDataUrl,
  deleteDriveFile,
  DriveFileItem
} from '../services/googleDriveService';
import { SchoolSettings, ScheduleItem, SoundItem, DayOfWeek } from '../types/bell';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: Record<DayOfWeek, ScheduleItem[]>;
  settings: SchoolSettings;
  soundLibrary: SoundItem[];
  onRestoreBackup: (backup: {
    schedules?: Record<DayOfWeek, ScheduleItem[]>;
    settings?: SchoolSettings;
    soundLibrary?: SoundItem[];
  }) => void;
  onAddImportedSound: (sound: SoundItem) => void;
  onShowToast: (type: 'success' | 'warning' | 'info' | 'error', message: string, title?: string) => void;
  onRequestConfirm: (dialog: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  schedules,
  settings,
  soundLibrary,
  onRestoreBackup,
  onAddImportedSound,
  onShowToast,
  onRequestConfirm
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'audio'>('backups');

  // Backups state
  const [backups, setBackups] = useState<DriveFileItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Audio files state
  const [driveAudios, setDriveAudios] = useState<DriveFileItem[]>([]);
  const [isLoadingAudios, setIsLoadingAudios] = useState<boolean>(false);
  const [importingAudioId, setImportingAudioId] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch backups and audio when token is available and modal is opened
  useEffect(() => {
    if (isOpen && token) {
      loadBackups(token);
      loadAudioFiles(token);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        onShowToast('success', `Berhasil terhubung ke Google Drive sebagai ${result.user.displayName || result.user.email}`, 'Google Drive Terhubung');
        loadBackups(result.accessToken);
        loadAudioFiles(result.accessToken);
      }
    } catch (err: any) {
      onShowToast('error', err?.message || 'Gagal masuk dengan Google.', 'Koneksi Gagal');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await googleLogout();
      setUser(null);
      setToken(null);
      setBackups([]);
      setDriveAudios([]);
      onShowToast('info', 'Anda telah keluar dari Google Drive.');
    } catch {
      // ignore
    }
  };

  const loadBackups = async (accessToken: string) => {
    setIsLoadingBackups(true);
    try {
      const files = await listDriveBackups(accessToken);
      setBackups(files);
    } catch (err: any) {
      onShowToast('error', err?.message || 'Gagal memuat daftar cadangan dari Google Drive.');
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const loadAudioFiles = async (accessToken: string) => {
    setIsLoadingAudios(true);
    try {
      const files = await listDriveAudioFiles(accessToken);
      setDriveAudios(files);
    } catch (err: any) {
      // ignore non-critical audio listing failure
    } finally {
      setIsLoadingAudios(false);
    }
  };

  const handleUploadBackup = async () => {
    if (!token) {
      onShowToast('warning', 'Silakan masuk ke Google Drive terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    try {
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `Bel_Sekolah_Jadwal_Backup_${timestamp}.json`;

      const payload = {
        app: 'Bel Sekolah Otomatis',
        version: settings.version,
        schoolName: settings.schoolName,
        exportDate: now.toISOString(),
        schedules,
        settings,
        soundLibrary
      };

      await uploadBackupToDrive(token, payload, fileName);
      onShowToast('success', `Cadangan "${fileName}" berhasil disimpan di Google Drive Anda!`, 'Cadangan Tersimpan');
      loadBackups(token);
    } catch (err: any) {
      onShowToast('error', err?.message || 'Gagal mengunggah cadangan ke Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreClick = (file: DriveFileItem) => {
    onRequestConfirm({
      title: 'Pulihkan Jadwal dari Google Drive',
      message: `Apakah Anda yakin ingin memulihkan dan menimpa jadwal bel saat ini dengan cadangan "${file.name}"? Semua perubahan yang belum disimpan akan digantikan dengan data cadangan ini.`,
      confirmLabel: 'Ya, Pulihkan Sekarang',
      cancelLabel: 'Batal',
      isDestructive: false,
      onConfirm: async () => {
        if (!token) return;
        try {
          const data = await downloadBackupFromDrive(token, file.id);
          onRestoreBackup(data);
          onShowToast('success', `Jadwal berhasil dipulihkan dari "${file.name}"!`, 'Pemulihan Berhasil');
          onClose();
        } catch (err: any) {
          onShowToast('error', err?.message || 'Gagal mengunduh atau membaca data cadangan.');
        }
      }
    });
  };

  const handleDeleteClick = (file: DriveFileItem) => {
    onRequestConfirm({
      title: 'Hapus File dari Google Drive',
      message: `PERINGATAN: Apakah Anda yakin ingin menghapus file cadangan "${file.name}" secara permanen dari Google Drive Anda?`,
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        if (!token) return;
        try {
          await deleteDriveFile(token, file.id);
          onShowToast('info', `File "${file.name}" berhasil dihapus dari Google Drive.`);
          setBackups((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err: any) {
          onShowToast('error', err?.message || 'Gagal menghapus file dari Google Drive.');
        }
      }
    });
  };

  const handleImportAudioFromDrive = async (audioFile: DriveFileItem) => {
    if (!token) return;
    setImportingAudioId(audioFile.id);
    try {
      const dataUrl = await downloadDriveAudioAsDataUrl(token, audioFile.id);
      const cleanName = audioFile.name.replace(/\.[^/.]+$/, '');

      const newSound: SoundItem = {
        id: `gdrive-audio-${Date.now()}`,
        name: cleanName,
        path: `gdrive:\\${audioFile.name}`,
        category: 'kustom',
        voiceText: `Perhatian, ${cleanName}`,
        defaultChime: 3,
        customAudioData: dataUrl
      };

      onAddImportedSound(newSound);
      onShowToast('success', `Audio "${audioFile.name}" berhasil diimpor dari Google Drive ke daftar suara!`, 'Audio Diimpor');
    } catch (err: any) {
      onShowToast('error', err?.message || 'Gagal mengunduh audio dari Google Drive.');
    } finally {
      setImportingAudioId(null);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 border-2 border-slate-400 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Window Header */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>Sinkronisasi Google Drive Bel Sekolah</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account / Sign In Status Header */}
        <div className="bg-white border-b border-slate-300 p-3.5 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-10 h-10 rounded-full border border-slate-300 object-cover shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>{user.displayName || 'Akun Google Terhubung'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Terhubung" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-xs text-slate-800">Hubungkan Akun Google Drive</div>
              <div className="text-[11px] text-slate-500">
                Simpan cadangan jadwal sekolah secara aman di cloud Google Drive Anda.
              </div>
            </div>
          )}

          <div>
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            ) : (
              /* Official Sign in with Google Button as prescribed by workspace-integration skill */
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-semibold px-4 py-2 rounded-md shadow-xs text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher if logged in */}
        {user && (
          <div className="bg-slate-200 border-b border-slate-300 px-4 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('backups')}
                className={`py-2 px-3 font-bold border-b-2 transition-colors ${
                  activeTab === 'backups'
                    ? 'border-blue-600 text-blue-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Cadangan Jadwal di Drive ({backups.length})
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`py-2 px-3 font-bold border-b-2 transition-colors ${
                  activeTab === 'audio'
                    ? 'border-blue-600 text-blue-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                File Audio Bel di Drive ({driveAudios.length})
              </button>
            </div>

            <button
              onClick={() => {
                if (token) {
                  loadBackups(token);
                  loadAudioFiles(token);
                }
              }}
              title="Segarkan data dari Google Drive"
              className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="p-4 text-xs text-slate-800 overflow-y-auto flex-1 space-y-4">
          {!user ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Penyimpanan Awan Google Drive untuk Jadwal Sekolah
              </h3>
              <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
                Hubungkan akun Google Anda untuk mencadangkan seluruh jadwal harian, konfigurasi nama sekolah, dan suara bel ke Google Drive secara aman. Anda dapat memulihkannya kapan saja di komputer sekolah mana pun.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded shadow transition-all cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Hubungkan ke Google Drive</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'backups' ? (
            <div className="space-y-3">
              {/* Action Banner: Cadangkan Sekarang */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <CloudUpload className="w-4 h-4 text-blue-600" />
                    <span>Cadangkan Jadwal Bel Saat Ini</span>
                  </h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Menyimpan semua jadwal hari Senin–Minggu dan konfigurasi {settings.schoolName} ke Google Drive.
                  </p>
                </div>
                <button
                  onClick={handleUploadBackup}
                  disabled={isUploading}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Menyimpan...' : 'Cadangkan ke Drive'}</span>
                </button>
              </div>

              {/* List of Backups */}
              <div>
                <div className="font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Daftar Cadangan di Google Drive:</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {backups.length} file ditemukan
                  </span>
                </div>

                {isLoadingBackups ? (
                  <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Memuat file dari Google Drive...</span>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="p-6 text-center bg-white border border-slate-200 rounded text-slate-500">
                    <FolderOpen className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">Belum ada file cadangan di Google Drive.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klik tombol "Cadangkan ke Drive" di atas untuk membuat salinan pertama.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded overflow-hidden divide-y divide-slate-200 bg-white shadow-xs">
                    {backups.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="text-blue-600 font-mono text-xs">📄</span>
                            <span>{file.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                            <span>Dimodifikasi: {formatDate(file.modifiedTime)}</span>
                            <span>•</span>
                            <span>Ukuran: {formatFileSize(file.size)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleRestoreClick(file)}
                            title="Pulihkan jadwal dari file cadangan ini"
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Pulihkan</span>
                          </button>

                          <button
                            onClick={() => handleDeleteClick(file)}
                            title="Hapus file ini dari Google Drive"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Audio Tab */
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-900">
                <h4 className="font-bold mb-0.5 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-600" />
                  <span>File Audio Bel Sekolah dari Google Drive</span>
                </h4>
                <p className="text-[11px]">
                  Daftar file audio MP3/WAV yang ada di akun Google Drive Anda. Anda dapat mengimpornya langsung ke daftar suara bel di aplikasi ini.
                </p>
              </div>

              {isLoadingAudios ? (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Mencari file audio di Google Drive...</span>
                </div>
              ) : driveAudios.length === 0 ? (
                <div className="p-6 text-center bg-white border border-slate-200 rounded text-slate-500">
                  <Music className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-700">Tidak ada file audio (.mp3 / .wav) ditemukan di Google Drive.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Unggah file audio MP3 bel sekolah ke Google Drive Anda, lalu klik tombol segarkan.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-300 rounded overflow-hidden divide-y divide-slate-200 bg-white shadow-xs">
                  {driveAudios.map((audio) => {
                    const isImporting = importingAudioId === audio.id;
                    return (
                      <div
                        key={audio.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="text-indigo-600">🎵</span>
                            <span>{audio.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Ukuran: {formatFileSize(audio.size)} • {formatDate(audio.modifiedTime)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleImportAudioFromDrive(audio)}
                          disabled={isImporting}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3 h-3" />
                          <span>{isImporting ? 'Mengimpor...' : 'Impor ke Bel'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-200 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
          <div className="text-slate-500 text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Drive API Terintegrasi</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
