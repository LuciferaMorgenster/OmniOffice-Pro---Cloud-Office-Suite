import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createCrcTable() {
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

const crcTable = createCrcTable();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crc]);
}

function generatePng(width, height, isMaskable = false) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw scanlines
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * 0.45;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle or Circle badge gradient background
      let r = 15, g = 23, b = 42, a = 255; // #0f172a deep navy

      if (!isMaskable) {
        // Rounded corner container
        const cornerR = width * 0.22;
        const cornerDx = Math.max(0, Math.abs(dx) - (cx - cornerR));
        const cornerDy = Math.max(0, Math.abs(dy) - (cy - cornerR));
        const cDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
        if (cDist > cornerR) {
          a = 0; // transparent outside rounded squircle
        }
      }

      // If inside logo shape
      if (a > 0) {
        // Gradient color for background
        const gradY = y / height;
        r = Math.round(15 + gradY * 15);
        g = Math.round(23 + gradY * 30);
        b = Math.round(42 + gradY * 60);

        // Center glowing circle
        if (dist < width * 0.35 && dist > width * 0.28) {
          // outer ring
          r = 56; g = 189; b = 248; // sky-400
        } else if (dist < width * 0.24 && dist > width * 0.18) {
          // inner ring
          r = 59; g = 130; b = 246; // blue-500
        } else if (dist < width * 0.1) {
          // center emerald lock
          r = 16; g = 185; b = 129; // emerald-500
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Compress
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate files
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));

console.log('PWA icons successfully generated in /public!');
