// Vercel Serverless Function: Vercel Blob Storage Engine
// Supports uploading images (base64 data URL or binary) and streaming private blobs for Notion/web embedding

import { put, get, head } from '@vercel/blob';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,HEAD');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-blob-token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = req.headers['x-blob-token'] || req.body?.token || process.env.BLOB_READ_WRITE_TOKEN;

  // 1. GET / HEAD: Stream / serve a private blob so Notion or browsers can render it directly
  if (req.method === 'GET' || req.method === 'HEAD') {
    const rawPath = req.query?.pathname || req.query?.url;
    if (!rawPath) {
      return res.status(400).json({ error: 'Missing pathname query parameter' });
    }

    const pathname = decodeURIComponent(rawPath).replace(/^\/+/, '');

    try {
      const result = await get(pathname, {
        access: 'private',
        token: token || undefined
      });

      if (!result || result.statusCode !== 200) {
        return res.status(404).send('Blob not found');
      }

      const contentType = result.blob?.contentType || 'image/png';
      res.setHeader('Content-Type', contentType);
      if (result.blob?.size) {
        res.setHeader('Content-Length', result.blob.size);
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      if (req.method === 'HEAD') {
        return res.status(200).end();
      }

      if (!result.stream) {
        return res.status(404).send('Blob stream unavailable');
      }

      return Readable.fromWeb(result.stream).pipe(res);
    } catch (err) {
      console.error('Error fetching blob:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. POST: Upload an image to Vercel Blob
  if (req.method === 'POST') {
    try {
      const {
        filename = `brother-visual-${Date.now()}.png`,
        imageBase64,
        fileBase64,
        access = 'public'
      } = req.body || {};

      const rawBase64 = fileBase64 || imageBase64;
      if (!rawBase64) {
        return res.status(400).json({ error: 'Missing imageBase64 or fileBase64 data in request body' });
      }

      // Strip Data URL prefix if present
      const cleanBase64 = rawBase64.replace(/^data:[a-zA-Z0-9\/\+\-]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      let contentType = 'image/png';
      if (rawBase64.startsWith('data:application/pdf') || filename.endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (rawBase64.startsWith('data:image/jpeg') || rawBase64.startsWith('data:image/jpg')) {
        contentType = 'image/jpeg';
      } else if (rawBase64.startsWith('data:image/webp')) {
        contentType = 'image/webp';
      }

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType,
        addRandomSuffix: true,
        token: token || undefined
      });

      // Construct clean proxy URL or public direct URL
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['host'] || 'linkedin.bro-x.org';
      const proxyUrl = `${protocol}://${host}/api/blob?pathname=${encodeURIComponent(blob.pathname)}`;

      return res.status(200).json({
        success: true,
        pathname: blob.pathname,
        url: blob.url,
        downloadUrl: blob.downloadUrl || blob.url,
        publicUrl: blob.url || proxyUrl,
        contentType: blob.contentType
      });
    } catch (err) {
      console.error('Error uploading to Vercel Blob:', err);
      return res.status(500).json({
        success: false,
        error: err.message,
        hint: 'Check that BLOB_READ_WRITE_TOKEN is connected in Vercel project environment variables.'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
