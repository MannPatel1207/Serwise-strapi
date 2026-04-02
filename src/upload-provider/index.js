'use strict';

const fs = require('fs');
const path = require('path');
const cloudinaryProvider = require('@strapi/provider-upload-cloudinary');
const JSZip = require('jszip');

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Mutates the file object in-place: converts APK → ZIP (for Cloudinary compat),
 * and marks it so the upload handler can route it to local storage instead.
 */
async function zipApkFile(file) {
  if (file.ext?.toLowerCase() !== '.apk') return;

  const zip = new JSZip();
  const buffer = file.buffer || (await streamToBuffer(file.stream));
  zip.file('update.apk', buffer);

  const zippedBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  file.ext = '.zip';
  file.mime = 'application/zip';
  file.size = Math.round((zippedBuffer.length / 1024) * 100) / 100;
  file.buffer = zippedBuffer;
  file.stream = null;
  file._isApkZip = true; // flag to route to local storage
}

/**
 * Saves the file buffer to public/uploads/ and sets file.url to a relative path
 * that Strapi prepends the server URL to (same convention as the local provider).
 */
function saveLocally(file) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${file.hash}${file.ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, file.buffer);

  file.url = `/uploads/${filename}`;
  file.provider_metadata = { local: true };
}

function deleteLocally(file) {
  try {
    const filepath = path.join(process.cwd(), 'public', file.url);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch {
    // file already gone — ignore
  }
}

module.exports = {
  init(options) {
    const cloudinary = cloudinaryProvider.init(options);

    return {
      async upload(file, customConfig = {}) {
        await zipApkFile(file);
        if (file._isApkZip) return saveLocally(file);
        return cloudinary.upload(file, customConfig);
      },
      async uploadStream(file, customConfig = {}) {
        await zipApkFile(file);
        if (file._isApkZip) return saveLocally(file);
        return cloudinary.uploadStream(file, customConfig);
      },
      async delete(file, customConfig = {}) {
        if (file.provider_metadata?.local) return deleteLocally(file);
        return cloudinary.delete(file, customConfig);
      },
    };
  },
};
