import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';
import { put } from '@vercel/blob';

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
      console.log('Local write failed (e.g. read-only filesystem on Vercel), falling back to remote upload hosts:', localError.message);
      
      const bytes = await file.arrayBuffer();

      // OPTION 1: Vercel Blob Storage (Best standard option for Vercel deployments, free, zero-config if enabled in dashboard)
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          console.log('Attempting Vercel Blob upload...');
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = path.extname(file.name) || '.png';
          const filename = `${uniqueSuffix}${fileExt}`;
          
          const blob = await put(filename, file, {
            access: 'public',
          });
          console.log('Upload to Vercel Blob succeeded:', blob.url);
          return NextResponse.json({ url: blob.url }, { status: 200 });
        } catch (blobError: any) {
          console.error('Vercel Blob upload failed:', blobError.message);
        }
      }

      // OPTION 2: ImgBB (Excellent secondary option, requires free IMGBB_API_KEY in environment)
      if (process.env.IMGBB_API_KEY) {
        try {
          console.log('Attempting ImgBB upload...');
          const imgbbFormData = new FormData();
          const blob = new Blob([bytes], { type: file.type });
          imgbbFormData.append('image', blob, file.name || 'image.png');

          const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: imgbbFormData
          });

          if (imgbbRes.ok) {
            const result = await imgbbRes.json();
            if (result?.data?.url) {
              console.log('Upload to ImgBB succeeded:', result.data.url);
              return NextResponse.json({ url: result.data.url }, { status: 200 });
            } else {
              console.warn('Unexpected ImgBB response format:', result);
            }
          } else {
            console.warn(`ImgBB upload failed with status ${imgbbRes.status}`);
          }
        } catch (imgbbError: any) {
          console.error('ImgBB upload error:', imgbbError.message);
        }
      }
      
      // FALLBACK 1: telegra.ph (highly reliable, CORS enabled, no key required, does not block cloud IPs)
      try {
        console.log('Attempting telegra.ph upload...');
        const telegraFormData = new FormData();
        const blob = new Blob([bytes], { type: file.type });
        telegraFormData.append('file', blob, file.name || 'image.png');

        const telegraRes = await fetch('https://telegra.ph/upload', {
          method: 'POST',
          body: telegraFormData
        });

        if (telegraRes.ok) {
          const result = await telegraRes.json();
          if (Array.isArray(result) && result[0]?.src) {
            const fileUrl = `https://telegra.ph${result[0].src}`;
            console.log('Upload to telegra.ph succeeded:', fileUrl);
            return NextResponse.json({ url: fileUrl }, { status: 200 });
          } else {
            console.warn('Unexpected telegra.ph response format:', result);
          }
        } else {
          console.warn(`Telegra.ph upload failed with status ${telegraRes.status}`);
        }
      } catch (telegraError: any) {
        console.error('Telegra.ph upload error:', telegraError.message);
      }

      // FALLBACK 2: Catbox.moe
      console.log('Falling back to Catbox.moe upload...');
      const externalFormData = new FormData();
      externalFormData.append('reqtype', 'fileupload');

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
