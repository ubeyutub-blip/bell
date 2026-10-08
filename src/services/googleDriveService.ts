export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * List school bell backup files from Google Drive
 */
export async function listDriveBackups(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("name contains 'Bel_Sekolah' and trashed = false");
  const url = `${DRIVE_API_URL}?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengambil daftar file dari Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * List audio files (mp3, wav, ogg) from Google Drive
 */
export async function listDriveAudioFiles(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("(mimeType contains 'audio/' or name contains '.mp3' or name contains '.wav') and trashed = false");
  const url = `${DRIVE_API_URL}?q=${query}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=30&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengambil audio dari Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload school bell backup JSON to Google Drive
 */
export async function uploadBackupToDrive(
  accessToken: string,
  backupData: any,
  fileName: string
): Promise<DriveFileItem> {
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Cadangan Sistem Bel Sekolah Otomatis'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(backupData, null, 2) +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengunggah cadangan ke Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Download backup JSON content from Google Drive
 */
export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<any> {
  const url = `${DRIVE_API_URL}/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh file cadangan dari Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Download audio file as base64 data URL for web playback
 */
export async function downloadDriveAudioAsDataUrl(
  accessToken: string,
  fileId: string
): Promise<string> {
  const url = `${DRIVE_API_URL}/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh audio dari Google Drive (${res.status})`);
  }

  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Delete a file from Google Drive
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const url = `${DRIVE_API_URL}/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal menghapus file dari Google Drive (${res.status})`);
  }
}
