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
    

    
    const { filename, contentType, base64Data, content } = req.body || {};
    
    const imageBase64 = base64Data || content;
    

    
    if (!filename || !imageBase64) {
      
      return res.status(400).json({
        
        error: 'Missing filename or base64Data',
        
      });
      
    }
    

    
    const normalizedBase64 = imageBase64.includes(',')
    
      ? imageBase64.split(',')[1]
      
      : imageBase64;
    

    
    const buffer = Buffer.from(normalizedBase64, 'base64');
    

    
    const blob = await put(filename, buffer, {
      
      access: 'public',
      
      contentType: contentType || 'application/octet-stream',
      
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














































