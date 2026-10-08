import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generateBellPNG(size, isMaskable = false) {
  // Create RGBA buffer
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((width * 4 + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.40 : 0.45);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: deep red/crimson
      let r = 185;
      let g = 28;
      let b = 28;
      let a = 255;

      // Bell shape logic
      // Bell body: centered, width around 0.5 size, height around 0.5 size
      const bellTopY = cy - radius * 0.55;
      const bellBottomY = cy + radius * 0.35;
      const rimBottomY = cy + radius * 0.45;
      const clapperY = cy + radius * 0.60;

      // Check clapper
      const distClapper = Math.sqrt((x - cx) ** 2 + (y - clapperY) ** 2);
      if (distClapper < radius * 0.18) {
        // Gold clapper
        r = 234; g = 179; b = 8;
      }

      // Check bell rim
      if (y >= bellBottomY && y <= rimBottomY && Math.abs(x - cx) <= radius * 0.65) {
        // Gold rim
        r = 254; g = 240; b = 138;
      }

      // Check bell body
      if (y >= bellTopY && y < bellBottomY) {
        const progress = (y - bellTopY) / (bellBottomY - bellTopY);
        // flared bell profile
        const halfWidth = radius * (0.15 + 0.45 * (progress ** 2));
        if (Math.abs(x - cx) <= halfWidth) {
          // Bell gradient
          r = Math.floor(234 + 20 * progress);
          g = Math.floor(179 + 40 * (1 - progress));
          b = 8;
        }
      }

      // Top hanger loop
      const distHanger = Math.sqrt((x - cx) ** 2 + (y - (bellTopY - radius * 0.12)) ** 2);
      if (distHanger <= radius * 0.14 && distHanger >= radius * 0.05) {
        r = 202; g = 138; b = 4;
      }

      // Rounded icon corners if not maskable
      if (!isMaskable) {
        // rounded rectangle border
        const cornerR = width * 0.2;
        const qx = Math.max(cornerR - x, 0, x - (width - cornerR));
        const qy = Math.max(cornerR - y, 0, y - (height - cornerR));
        if (Math.sqrt(qx * qx + qy * qy) > cornerR) {
          a = 0; // transparent outside rounded rect
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT
  const idat = makeChunk('IDAT', compressed);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generateBellPNG(192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generateBellPNG(512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), generateBellPNG(512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generateBellPNG(180, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), generateBellPNG(64, false));

console.log('Successfully generated all PWA icons in /public!');
