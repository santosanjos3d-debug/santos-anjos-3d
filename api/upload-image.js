// Vercel Serverless Function - Upload de imagem para S3
import { cors } from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET || '';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ok = await requireAdmin(req, res);
  if (!ok) return;

  try {
    // Aceitar tanto fileName/fileData quanto filename/base64Data (compatibilidade)
    const fileName = req.body?.fileName || req.body?.filename;
    const fileData = req.body?.fileData || req.body?.base64Data;
    const contentType = req.body?.contentType;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'fileName/filename e fileData/base64Data são obrigatórios' });
    }

    // fileData deve ser base64
    const buffer = Buffer.from(fileData, 'base64');
    const suffix = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split('.').pop() || 'jpg';
    const key = `products/${Date.now()}-${suffix}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
    }));

    const endpoint = process.env.S3_ENDPOINT || `https://${BUCKET}.s3.amazonaws.com`;
    const url = `${endpoint}/${key}`;

    return res.status(200).json({ url, key });
  } catch (err) {
    console.error('[Upload Image]', err);
    return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
}
