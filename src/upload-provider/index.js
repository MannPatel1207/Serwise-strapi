'use strict';

const fs = require('fs');
const path = require('path');
const cloudinaryProvider = require('@strapi/provider-upload-cloudinary');

function getUploadsDir() {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Streams or writes an APK directly to public/uploads/ without buffering
 * in memory. Sets file.url to the relative path Strapi serves via strapi::public.
 */
async function saveApkLocally(file) {
  const uploadsDir = getUploadsDir();
  const filename = `${file.hash}${file.ext}`;
  const filepath = path.join(uploadsDir, filename);

  if (file.stream) {
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(filepath);
      file.stream.pipe(ws);
      ws.on('finish', resolve);
      ws.on('error', reject);
      file.stream.on('error', reject);
    });
  } else if (file.buffer) {
    fs.writeFileSync(filepath, file.buffer);
  } else {
    throw new Error('Missing file stream or buffer');
  }

  file.url = `/uploads/${filename}`;
  file.provider_metadata = { local: true };
}

function deleteLocally(file) {
  try {
    const filepath = path.join(process.cwd(), 'public', file.url);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch {
    // already gone — ignore
  }
}

module.exports = {
  init(options) {
    const cloudinary = cloudinaryProvider.init(options);

    return {
      async upload(file, customConfig = {}) {
        if (file.ext?.toLowerCase() === '.apk') return saveApkLocally(file);
        return cloudinary.upload(file, customConfig);
      },
      async uploadStream(file, customConfig = {}) {
        if (file.ext?.toLowerCase() === '.apk') return saveApkLocally(file);
        return cloudinary.uploadStream(file, customConfig);
      },
      async delete(file, customConfig = {}) {
        if (file.provider_metadata?.local) return deleteLocally(file);
        return cloudinary.delete(file, customConfig);
      },
    };
  },
};
