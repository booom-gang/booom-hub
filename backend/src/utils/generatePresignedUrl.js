import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import r2Client from '../config/r2Client.js';

const generatePresignedUrl = async ({ fileKey, fileType }) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

  const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${fileKey}`;

  return { uploadUrl, fileKey, publicUrl };
};

export default generatePresignedUrl;
