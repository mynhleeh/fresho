const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG encoder for a solid-color square image.
function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let cc = n;
      for (let k = 0; k < 8; k++) {
        cc = cc & 1 ? (0xedb88320 ^ (cc >>> 1)) : (cc >>> 1);
      }
      t[n] = cc;
    }
    return t;
  })());
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makeSolidPng(size, [r, g, b]) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  // raw scanlines: each row = filter byte (0) + size*3 bytes RGB
  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLen;
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.join(__dirname, 'public');

// icon-192.png: 192x192, FRESH O! green (#2e7d32)
const icon192 = makeSolidPng(192, [0x2e, 0x7d, 0x32]);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('Created public/icon-192.png', icon192.length, 'bytes');

// icon-512.png: 512x512, slightly different shade to keep visually distinct while on-brand
const icon512 = makeSolidPng(512, [0x1b, 0x5e, 0x20]);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('Created public/icon-512.png', icon512.length, 'bytes');
