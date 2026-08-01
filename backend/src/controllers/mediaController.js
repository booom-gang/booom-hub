import { v4 as uuidv4 } from 'uuid';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import GalleryItem from '../models/GalleryItem.js';
import generatePresignedUrl from '../utils/generatePresignedUrl.js';
import r2Client from '../config/r2Client.js';

const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
};

export const createPresignedUrl = async (req, res, next) => {
  try {
    const { fileName, fileType, mediaKind } = req.body;

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'File name is required' });
    }
    if (!fileType || typeof fileType !== 'string') {
      return res.status(400).json({ error: 'File type is required' });
    }
    if (!mediaKind || !['gallery-image', 'gallery-video', 'gallery-video-thumb', 'profile-picture'].includes(mediaKind)) {
      return res.status(400).json({ error: 'Invalid media kind' });
    }

    const sanitized = sanitizeFileName(fileName);
    const fileKey = `${mediaKind}/${req.user.userId}/${uuidv4()}-${sanitized}`;

    const result = await generatePresignedUrl({ fileKey, fileType });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    const { media_type, file_key, thumbnail_key, file_size_bytes } = req.body;

    if (!media_type || !['image', 'video'].includes(media_type)) {
      return res.status(400).json({ error: 'Valid media type is required' });
    }
    if (!file_key || typeof file_key !== 'string') {
      return res.status(400).json({ error: 'File key is required' });
    }
    if (!file_size_bytes || typeof file_size_bytes !== 'number' || file_size_bytes <= 0) {
      return res.status(400).json({ error: 'Valid file size is required' });
    }

    const item = await GalleryItem.create({
      user_id: req.user.userId,
      media_type,
      file_key,
      thumbnail_key: thumbnail_key || null,
      file_size_bytes,
    });

    const populated = await GalleryItem.findById(item._id).populate('user_id', 'username profile_picture');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getGallery = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 24));
    const skip = (page - 1) * limit;

    const total = await GalleryItem.countDocuments();
    const items = await GalleryItem.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'username profile_picture');

    const itemsWithUrls = items.map((item) => {
      const obj = item.toObject();
      const baseUrl = `${process.env.R2_PUBLIC_BASE_URL}/${obj.file_key}`;
      obj.proxy_url = `https://wsrv.nl/?url=${encodeURIComponent(baseUrl)}&output=webp&q=80`;
      if (obj.thumbnail_key) {
        const thumbUrl = `${process.env.R2_PUBLIC_BASE_URL}/${obj.thumbnail_key}`;
        obj.thumbnail_proxy_url = `https://wsrv.nl/?url=${encodeURIComponent(thumbUrl)}&w=400&output=webp&q=80`;
      }
      return obj;
    });

    res.json({
      items: itemsWithUrls,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own items' });
    }

    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: item.file_key,
    }));

    if (item.thumbnail_key) {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: item.thumbnail_key,
      }));
    }

    await GalleryItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
