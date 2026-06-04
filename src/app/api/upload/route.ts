import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Authorization check
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = await verifyToken(token);
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Try local upload first (mostly for local development)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = path.extname(file.name) || '.png';
      const filename = `${uniqueSuffix}${fileExt}`;
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: publicUrl }, { status: 200 });
    } catch (localError: any) {
      // Local write failed (e.g., read-only filesystem on Vercel). Fallback to Catbox.moe
      console.log('Local write failed, falling back to Catbox.moe upload:', localError.message);
      
      const externalFormData = new FormData();
      externalFormData.append('reqtype', 'fileupload');

      // Convert File to Blob and specify file name explicitly to fix Node.js/Vercel FormData serialization issues
      const bytes = await file.arrayBuffer();
      const blob = new Blob([bytes], { type: file.type });
      externalFormData.append('fileToUpload', blob, file.name || 'image.png');

      const catboxRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: externalFormData
      });

      if (!catboxRes.ok) {
        throw new Error(`Catbox API returned status ${catboxRes.status}`);
      }

      const fileUrl = await catboxRes.text();
      if (!fileUrl || !fileUrl.startsWith('http')) {
        throw new Error(`Catbox upload failed: ${fileUrl}`);
      }

      return NextResponse.json({ url: fileUrl.trim() }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed.' }, { status: 500 });
  }
}
