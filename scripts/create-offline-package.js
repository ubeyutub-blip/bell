import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { execSync } from 'child_process';

console.log('1. Building dist first...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error('Dist directory does not exist!');
  process.exit(1);
}

// Ensure download directories exist
const publicDownloadsDir = path.resolve('public/downloads');
const distDownloadsDir = path.resolve('dist/downloads');
fs.mkdirSync(publicDownloadsDir, { recursive: true });
fs.mkdirSync(distDownloadsDir, { recursive: true });

// 2. Prepare Staging directory for installer content
const stagingDir = path.resolve('/tmp/bel_offline_staging');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Copy all dist files to stagingDir
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDirSync(distDir, stagingDir);

// 3. Add Windows Scripts to staging
const installBat = `@echo off
chcp 65001 >nul
title Installer Bel Sekolah Otomatis - Offline Windows
color 1F

echo =======================================================================
echo          INSTALLER BEL SEKOLAH OTOMATIS (OFFLINE WINDOWS)
echo =======================================================================
echo.
echo [1/4] Memeriksa file aplikasi...
set "SOURCE_DIR=%~dp0"
set "TARGET_DIR=%LOCALAPPDATA%\\BelSekolahOtomatis"
set "DESKTOP_PATH=%USERPROFILE%\\Desktop"
set "STARTUP_PATH=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"

if not exist "%SOURCE_DIR%index.html" (
    echo [ERROR] File index.html tidak ditemukan!
    echo Pastikan file instalasi lengkap.
    echo.
    pause
    exit /b 1
)

echo [2/4] Memasang file aplikasi ke: %TARGET_DIR% ...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /E /Y /I "%SOURCE_DIR%*" "%TARGET_DIR%\\" >nul

echo [3/4] Membuat Pintasan Desktop...
set "VBS_SCRIPT=%TEMP%\\create_bel_shortcut.vbs"
(
echo Set oWS = WScript.CreateObject("WScript.Shell"^)
echo sLinkFile = "%DESKTOP_PATH%\\Bel Sekolah Otomatis.lnk"
echo Set oLink = oWS.CreateShortcut(sLinkFile^)
echo oLink.TargetPath = "%TARGET_DIR%\\Buka_Bel_Sekolah.bat"
echo oLink.WorkingDirectory = "%TARGET_DIR%"
echo oLink.IconLocation = "%TARGET_DIR%\\favicon.ico, 0"
echo oLink.Description = "Aplikasi Bel Sekolah Otomatis (Offline)"
echo oLink.WindowStyle = 7
echo oLink.Save
) > "%VBS_SCRIPT%"

cscript //nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo [OK] Pintasan Desktop "Bel Sekolah Otomatis" berhasil dibuat!
echo.

echo [4/4] Konfigurasi Auto-Start saat Komputer Menyala
echo -----------------------------------------------------------------------
echo Apakah Anda ingin Bel Sekolah otomatis langsung menyala saat komputer
echo dinyalakan di pagi hari (Sangat cocok untuk PC Piket / Tata Usaha)?
set /p AUTOSTART="Aktifkan Auto-Start di pagi hari? [Y/T / Tekan Enter untuk Ya]: "

if /I not "%AUTOSTART%"=="T" (
    set "VBS_STARTUP=%TEMP%\\create_bel_startup.vbs"
    (
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo sLinkFile = "%STARTUP_PATH%\\Bel Sekolah Otomatis.lnk"
    echo Set oLink = oWS.CreateShortcut(sLinkFile^)
    echo oLink.TargetPath = "%TARGET_DIR%\\Buka_Bel_Sekolah.bat"
    echo oLink.WorkingDirectory = "%TARGET_DIR%"
    echo oLink.IconLocation = "%TARGET_DIR%\\favicon.ico, 0"
    echo oLink.Description = "Auto Start Bel Sekolah Otomatis"
    echo oLink.WindowStyle = 7
    echo oLink.Save
    ) > "%VBS_STARTUP%"

    cscript //nologo "%VBS_STARTUP%"
    del "%VBS_STARTUP%"
    echo [OK] Auto-Start aktif! Setiap PC dinyalakan, Bel Sekolah otomatis aktif.
)

echo.
echo =======================================================================
echo                 INSTALASI OFFLINE SELESAI DENGAN SUKSES!
echo =======================================================================
echo.
echo Pintasan telah dibuat di Desktop Windows Anda.
echo Aplikasi dapat beroperasi 100%% OFFLINE tanpa kuota atau kabel internet.
echo.
echo Tekan sembarang tombol untuk membuka Bel Sekolah Otomatis sekarang...
pause >nul

start "" "%TARGET_DIR%\\Buka_Bel_Sekolah.bat"
exit
`;
fs.writeFileSync(path.join(stagingDir, '1_Instal_Bel_Sekolah_Offline.bat'), installBat);

const launcherBat = `@echo off
chcp 65001 >nul
title Membuka Bel Sekolah Otomatis (Offline)...
cd /d "%~dp0"

if not exist "%~dp0index.html" (
    echo [ERROR] File index.html tidak ditemukan!
    pause
    exit /b 1
)

:: Jalankan server lokal offline mandiri via PowerShell di latar belakang
start /min "" powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0run_server_offline.ps1"

:: Beri jeda 1 detik untuk inisialisasi server lokal
timeout /t 1 /nobreak >nul

:: Buka Microsoft Edge dalam mode App Standalone
start "" msedge.exe --app="http://127.0.0.1:5858/" 2>nul
if %ERRORLEVEL% equ 0 exit

:: Buka Google Chrome dalam mode App Standalone
start "" chrome.exe --app="http://127.0.0.1:5858/" 2>nul
if %ERRORLEVEL% equ 0 exit

:: Browser default
start "" "http://127.0.0.1:5858/"
exit
`;
fs.writeFileSync(path.join(stagingDir, 'Buka_Bel_Sekolah.bat'), launcherBat);

const portableBat = `@echo off
chcp 65001 >nul
title Bel Sekolah Otomatis (Mode Portable Flashdisk)
cd /d "%~dp0"
call "%~dp0Buka_Bel_Sekolah.bat"
`;
fs.writeFileSync(path.join(stagingDir, '2_Buka_Langsung_Tanpa_Instal.bat'), portableBat);

const psScript = `$port = 5858
$root = $PSScriptRoot

# Periksa apakah port lokal sudah aktif
try {
    $test = New-Object System.Net.Sockets.TcpClient
    $test.Connect("127.0.0.1", $port)
    $test.Close()
    # Server lokal sudah berjalan
    exit 0
} catch {}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
try {
    $listener.Start()
} catch {
    exit 0
}

$mimeTypes = @{
    ".html"        = "text/html; charset=utf-8"
    ".js"          = "application/javascript; charset=utf-8"
    ".css"         = "text/css; charset=utf-8"
    ".json"        = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json"
    ".svg"         = "image/svg+xml"
    ".png"         = "image/png"
    ".ico"         = "image/x-icon"
    ".mp3"         = "audio/mpeg"
    ".wav"         = "audio/wav"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.RawUrl.Split('?')[0].TrimStart('/')
        if ([string]::IsNullOrEmpty($relPath)) {
            $relPath = "index.html"
        }

        $filePath = Join-Path $root $relPath
        if (!(Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $root "index.html"
        }

        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        if ($mimeTypes.ContainsKey($ext)) {
            $response.ContentType = $mimeTypes[$ext]
        } else {
            $response.ContentType = "application/octet-stream"
        }

        $response.AddHeader("Cache-Control", "no-cache")
        $response.AddHeader("Access-Control-Allow-Origin", "*")

        $buffer = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.OutputStream.Close()
    } catch {
        # Abaikan koneksi reset client
    }
}
`;
fs.writeFileSync(path.join(stagingDir, 'run_server_offline.ps1'), psScript);

const uninstallBat = `@echo off
chcp 65001 >nul
title Hapus Instalasi Bel Sekolah Otomatis
color 4F

echo =======================================================================
echo              HAPUS INSTALASI BEL SEKOLAH OTOMATIS
echo =======================================================================
echo.
echo Script ini akan menghapus pintasan Desktop dan file aplikasi lokal.
echo.
set /p CONFIRM="Yakin ingin menghapus? [Y/T]: "
if /I "%CONFIRM%"=="Y" (
    del "%USERPROFILE%\\Desktop\\Bel Sekolah Otomatis.lnk" 2>nul
    del "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\Bel Sekolah Otomatis.lnk" 2>nul
    rd /S /Q "%LOCALAPPDATA%\\BelSekolahOtomatis" 2>nul
    echo.
    echo [OK] Pintasan dan file aplikasi berhasil dihapus dari komputer ini.
) else (
    echo Pembatalan dilakukan.
)
echo.
pause
`;
fs.writeFileSync(path.join(stagingDir, 'Uninstall_Bel_Sekolah.bat'), uninstallBat);

const readme = `=======================================================================
   PANDUAN INSTALASI OFFLINE BEL SEKOLAH OTOMATIS (WINDOWS)
=======================================================================

Aplikasi Bel Sekolah Otomatis ini dapat beroperasi 100% OFFLINE tanpa
koneksi internet di sekolah Anda.

CARA MEMASANG DI KOMPUTER SEKOLAH:
----------------------------------
1. Klik ganda file "Setup_Bel_Sekolah_Offline.exe"
2. Program akan otomatis memasang dan membuat pintasan di Desktop.
3. Otomatis jalan setiap pagi saat komputer dinyalakan.

=======================================================================
Bel Sekolah Otomatis - Solusi Bel Terjadwal untuk Seluruh Sekolah Indonesia
`;
fs.writeFileSync(path.join(stagingDir, 'PANDUAN_INSTALASI_OFFLINE.txt'), readme);

// 4. Build Setup_Bel_Sekolah_Offline.exe using 7z SFX
console.log('2. Building Setup_Bel_Sekolah_Offline.exe with 7za and 7zsd_All.sfx...');
const sevenZa = path.resolve('tools/sfx/7za');
const sfxModule = path.resolve('tools/sfx/7zsd_All.sfx');
const tempArchive = '/tmp/bel_app.7z';
if (fs.existsSync(tempArchive)) fs.unlinkSync(tempArchive);

// Compress staging directory into 7z
execSync(`"${sevenZa}" a -t7z -mx=9 "${tempArchive}" "${stagingDir}/*"`, { stdio: 'inherit' });

// Create SFX config
const sfxConfig = `;!@Install@!UTF-8!
Title="Installer Bel Sekolah Otomatis"
BeginPrompt="Pasang Bel Sekolah Otomatis (Offline) di komputer Windows ini?"
Progress="yes"
ExecuteFile="1_Instal_Bel_Sekolah_Offline.bat"
;!@InstallEnd@!
`;
const configPath = '/tmp/sfx_config.txt';
fs.writeFileSync(configPath, sfxConfig, 'utf8');

// Concatenate SFX + Config + Archive into Setup_Bel_Sekolah_Offline.exe
const exePathPublic = path.join(publicDownloadsDir, 'Setup_Bel_Sekolah_Offline.exe');
const exePathDist = path.join(distDownloadsDir, 'Setup_Bel_Sekolah_Offline.exe');

const sfxBuf = fs.readFileSync(sfxModule);
const configBuf = fs.readFileSync(configPath);
const archiveBuf = fs.readFileSync(tempArchive);
const exeBuf = Buffer.concat([sfxBuf, configBuf, archiveBuf]);

fs.writeFileSync(exePathPublic, exeBuf);
fs.writeFileSync(exePathDist, exeBuf);

const exeSizeMB = (exeBuf.length / (1024 * 1024)).toFixed(2);
console.log(`Successfully built EXE installer: ${exePathPublic} (${exeSizeMB} MB)`);

// 5. Also build Bel_Sekolah_Offline_Windows.zip
console.log('3. Building Bel_Sekolah_Offline_Windows.zip...');
const zip = new JSZip();
function addFolderToZip(folderPath, zipFolder) {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subZip = zipFolder.folder(item);
      addFolderToZip(fullPath, subZip);
    } else {
      const fileData = fs.readFileSync(fullPath);
      zipFolder.file(item, fileData);
    }
  }
}
addFolderToZip(stagingDir, zip);

const zipPathPublic = path.join(publicDownloadsDir, 'Bel_Sekolah_Offline_Windows.zip');
const zipPathDist = path.join(distDownloadsDir, 'Bel_Sekolah_Offline_Windows.zip');

zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true, compression: 'DEFLATE' })
  .pipe(fs.createWriteStream(zipPathPublic))
  .on('finish', () => {
    fs.copyFileSync(zipPathPublic, zipPathDist);
    const zipSizeMB = (fs.statSync(zipPathPublic).size / (1024 * 1024)).toFixed(2);
    console.log(`Successfully built ZIP archive: ${zipPathPublic} (${zipSizeMB} MB)`);
    console.log('ALL INSTALLER ARTIFACTS BUILT SUCCESSFULLY!');
  });
