/**
 * Upload social-post-factory.zip to Firebase Storage and write a Firestore pointer doc.
 * Run in CI with GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_MANNYDOORS SA JSON.
 */
import { readFileSync, existsSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const ZIP_PATH = process.argv[2] || 'downloads/social-post-factory.zip';
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'property-managment-a5ed3.firebasestorage.app';
const DB_ID = process.env.FIRESTORE_DATABASE_ID || 'property-managment';
const STORAGE_PATH = 'exports/social-post-factory.zip';

if (!existsSync(ZIP_PATH)) {
  console.error('Zip not found:', ZIP_PATH);
  process.exit(1);
}

const saJson = process.env.FIREBASE_SA_JSON;
if (saJson) {
  initializeApp({
    credential: cert(JSON.parse(saJson)),
    storageBucket: BUCKET,
  });
} else {
  initializeApp({ storageBucket: BUCKET });
}

const buffer = readFileSync(ZIP_PATH);
const bucket = getStorage().bucket();
const file = bucket.file(STORAGE_PATH);

await file.save(buffer, {
  metadata: {
    contentType: 'application/zip',
    cacheControl: 'public, max-age=3600',
  },
  resumable: false,
});

try {
  await file.makePublic();
} catch (e) {
  console.warn('makePublic failed, using signed URL:', e.message);
}

const publicUrl = `https://storage.googleapis.com/${BUCKET}/${STORAGE_PATH}`;
let downloadUrl = publicUrl;

try {
  const [signed] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  downloadUrl = signed;
} catch {
  /* use public URL */
}

const db = getFirestore(DB_ID);
await db.doc('exports/socialPostFactory').set({
  fileName: 'social-post-factory.zip',
  storagePath: STORAGE_PATH,
  downloadUrl,
  publicUrl,
  sizeBytes: buffer.length,
  uploadedAt: Timestamp.now(),
  version: '1.0.0',
  instructions:
    'Download the zip, unzip, and copy the social-post-factory folder into your AiBhive repo.',
});

console.log('Uploaded to Firebase Storage:', publicUrl);
console.log('Firestore doc: exports/socialPostFactory');
console.log('Download URL:', downloadUrl);
