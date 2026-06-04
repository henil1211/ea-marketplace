export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';
import { verifyCSRF, isRateLimited, logActivity } from '@/lib/security';

import { readDB, writeDB } from '@/lib/db';

async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  const db = await readDB();
  
  if (!db[collection]) {
    return NextResponse.json([], { status: 200 });
  }

  // 1. Authorization checks for private collections
  const user = await getRequestUser(request);
  const isAdmin = user?.role === 'admin';

  if (['users', 'activityLogs', 'downloadLogs', 'leads', 'visitorAnalytics', 'whatsappClicks'].includes(collection)) {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }
  }

  let items = [...db[collection]];

  // 2. Filter out soft deleted records (unless requesting deleted: true)
  const searchParams = request.nextUrl.searchParams;
  const showDeleted = searchParams.get('showDeleted') === 'true';
  if (!showDeleted) {
    items = items.filter((item: any) => item.deleted !== true);
  }

  // Filter based on query parameters
  searchParams.forEach((val, key) => {
    if (key === 'search') {
      const q = val.toLowerCase();
      items = items.filter(
        (item: any) =>
          item.name?.toLowerCase().includes(q) ||
          item.shortDesc?.toLowerCase().includes(q) ||
          (Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    } else if (key === 'featured') {
      const isFeatured = val === 'true';
      items = items.filter((item: any) => item.featured === isFeatured);
    } else if (key === 'platform' && val) {
      items = items.filter((item: any) => item.platform === val || item.platform === 'both');
    } else if (key === 'category' && val) {
      items = items.filter((item: any) => item.category === val);
    } else if (key === 'status' && val) {
      items = items.filter((item: any) => item.status === val);
    } else if (key === 'slug' && val) {
      items = items.filter((item: any) => item.slug === val);
    } else if (key === 'userId' && val) {
      items = items.filter((item: any) => item.userId === val);
    } else if (key === 'email' && val) {
      items = items.filter((item: any) => item.email === val);
    } else if (key === 'eaId' && val) {
      items = items.filter((item: any) => item.eaId === val);
    }
  });

  return NextResponse.json(items, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. CSRF Verification
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF validation failed.' }, { status: 403 });
  }

  // 2. Collection-based Rate Limiting
  if (collection === 'reviews' && isRateLimited(ip, 'create-review', 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Review submission rate limit exceeded (5 per hour).' }, { status: 429 });
  }
  if (collection === 'customRequests' && isRateLimited(ip, 'create-request', 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Custom EA request rate limit exceeded (5 per hour).' }, { status: 429 });
  }
  if (collection === 'contactMessages' && isRateLimited(ip, 'create-contact', 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Contact message rate limit exceeded (5 per hour).' }, { status: 429 });
  }
  if (collection === 'subscribers' && isRateLimited(ip, 'create-subscriber', 5, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many subscription attempts. Try again later.' }, { status: 429 });
  }

  // 3. Authorization validation
  const user = await getRequestUser(request);
  const isAdmin = user?.role === 'admin';

  // Admin-only collections for creation
  if (['eas', 'settings', 'users'].includes(collection)) {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }
  }

  const db = await readDB();
  if (!db[collection]) {
    db[collection] = [];
  }

  const body = await request.json();

  // 4. Data Validation: Unique slug check for EAs
  if (collection === 'eas' && body.slug) {
    const slugExists = db.eas.some(
      (item: any) => item.slug === body.slug && item.deleted !== true
    );
    if (slugExists) {
      return NextResponse.json({ error: 'An Expert Advisor with this slug already exists.' }, { status: 400 });
    }
  }

  const newId = `${collection.slice(0, 3)}-${Math.floor(Math.random() * 900000) + 100000}`;
  const newDoc = {
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...body
  };

  db[collection].push(newDoc);
  await writeDB(db);

  // 5. Log Activity for mutations
  if (user) {
    if (['eas', 'settings', 'orders'].includes(collection)) {
      await logActivity(
        collection === 'settings' ? 'settings' : (collection === 'eas' ? 'admin' : 'purchase'),
        user.userId,
        `Created new document in ${collection}`,
        { id: newId, name: body.name || body.orderId || body.siteName }
      );
    }
  }

  return NextResponse.json(newDoc, { status: 201 });
}
