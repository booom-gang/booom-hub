import mongoose from 'mongoose';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const deleteR2File = async (key) => {
  try {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (err) {
    console.error(`  Failed to delete ${key}: ${err.message}`);
    return false;
  }
};

const run = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const gallery = db.collection('gallery');

  const prefixes = ['gallery-image', 'gallery-video', 'gallery-video-thumb', 'profile-picture'];
  const allR2Keys = [];

  console.log('Scanning R2 bucket...');
  for (const prefix of prefixes) {
    let continuationToken;
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: `${prefix}/`,
        ContinuationToken: continuationToken,
      });
      const response = await r2Client.send(command);
      if (response.Contents) {
        allR2Keys.push(...response.Contents.map((obj) => obj.Key));
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  }

  console.log(`Found ${allR2Keys.length} files in R2`);

  console.log('Fetching DB records...');
  const dbItems = await gallery.find({}, { projection: { file_key: 1, thumbnail_key: 1 } }).toArray();
  const dbKeys = new Set();
  for (const item of dbItems) {
    dbKeys.add(item.file_key);
    if (item.thumbnail_key) dbKeys.add(item.thumbnail_key);
  }
  console.log(`Found ${dbItems.length} records in DB (${dbKeys.size} unique keys)`);

  const orphaned = allR2Keys.filter((key) => !dbKeys.has(key));
  console.log(`Found ${orphaned.length} orphaned files in R2`);

  if (orphaned.length === 0) {
    console.log('Nothing to clean up.');
    await mongoose.disconnect();
    return;
  }

  console.log('\nOrphaned files:');
  orphaned.forEach((key) => console.log(`  ${key}`));

  console.log('\nDeleting orphaned files...');
  let deleted = 0;
  for (const key of orphaned) {
    const ok = await deleteR2File(key);
    if (ok) deleted++;
  }

  console.log(`\nDone. Deleted ${deleted}/${orphaned.length} orphaned files.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
