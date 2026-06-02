import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
      });
    }

    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({
        error: 'Missing filename or content',
      });
    }

    // Converter base64 para buffer
    const base64Data = content.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload para Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
    });

  } catch (error) {
    console.error('[Upload Image]', error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
