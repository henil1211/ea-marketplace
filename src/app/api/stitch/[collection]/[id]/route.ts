export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';
import { verifyCSRF, logActivity } from '@/lib/security';

import { readDB, writeDB } from '@/lib/db';

async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;
  const db = await readDB();
  
  if (!db[collection]) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  // Auth check for reading single private records
  const user = await getRequestUser(request);
  const isAdmin = user?.role === 'admin';

  if (['users', 'activityLogs', 'downloadLogs', 'visitorAnalytics', 'whatsappClicks'].includes(collection)) {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }
  }

  const item = db[collection].find((x: any) => x.id === id || x.slug === id);
  if (!item || item.deleted === true) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  return NextResponse.json(item, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;

  // 1. CSRF Verification
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF validation failed.' }, { status: 403 });
  }

  const user = await getRequestUser(request);
  const isAdmin = user?.role === 'admin';

  // 2. Authorization check
  if (['eas', 'settings', 'users', 'leads'].includes(collection)) {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }
  }

  const db = await readDB();
  const body = await request.json();

  if (!db[collection]) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  const idx = db[collection].findIndex((x: any) => x.id === id);
  if (idx === -1 || db[collection][idx].deleted === true) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const existingDoc = db[collection][idx];

  // 3. User Ownership Validation (for reviews, custom requests, wishlists, etc.)
  if (!isAdmin && ['reviews', 'customRequests', 'wishlists'].includes(collection)) {
    // If not admin, the item's userId or email must match the current user
    const ownerUserId = existingDoc.userId || existingDoc.userIdRef;
    const ownerEmail = existingDoc.email || existingDoc.userEmail;
    if (
      (ownerUserId && ownerUserId !== user?.userId) ||
      (ownerEmail && ownerEmail !== user?.email)
    ) {
      return NextResponse.json({ error: 'Forbidden. You do not own this document.' }, { status: 403 });
    }
  }

  // Prevent slug collision on edit
  if (collection === 'eas' && body.slug && body.slug !== existingDoc.slug) {
    const slugExists = db.eas.some(
      (item: any) => item.slug === body.slug && item.id !== id && item.deleted !== true
    );
    if (slugExists) {
      return NextResponse.json({ error: 'An Expert Advisor with this slug already exists.' }, { status: 400 });
    }
  }

  const updatedDoc = {
    ...existingDoc,
    ...body,
    updatedAt: new Date().toISOString(),
    id // ensure ID cannot be mutated
  };

  db[collection][idx] = updatedDoc;
  await writeDB(db);

  // 4. Log Admin or User update action
  if (user) {
    await logActivity(
      collection === 'settings' ? 'settings' : (collection === 'eas' ? 'admin' : 'auth'),
      user.userId,
      `Updated document in ${collection}`,
      { id, key: body.name || body.status || body.featured }
    );
  }

  return NextResponse.json(updatedDoc, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  return PATCH(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;

  // 1. CSRF Verification
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF validation failed.' }, { status: 403 });
  }

  const user = await getRequestUser(request);
  const isAdmin = user?.role === 'admin';

  // 2. Authorization check
  if (['eas', 'settings', 'users', 'leads', 'visitorAnalytics', 'whatsappClicks'].includes(collection)) {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }
  }

  const db = await readDB();

  if (!db[collection]) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  const idx = db[collection].findIndex((x: any) => x.id === id);
  if (idx === -1 || db[collection][idx].deleted === true) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const existingDoc = db[collection][idx];

  // 3. User Ownership Validation (for reviews, custom requests, wishlists, etc.)
  if (!isAdmin && ['reviews', 'customRequests', 'wishlists'].includes(collection)) {
    const ownerUserId = existingDoc.userId || existingDoc.userIdRef;
    const ownerEmail = existingDoc.email || existingDoc.userEmail;
    if (
      (ownerUserId && ownerUserId !== user?.userId) ||
      (ownerEmail && ownerEmail !== user?.email)
    ) {
      return NextResponse.json({ error: 'Forbidden. You do not own this document.' }, { status: 403 });
    }
  }

  // 4. Soft Delete Support (flag deleted: true instead of removing from DB)
  if (['eas', 'users', 'customRequests', 'orders', 'leads'].includes(collection)) {
    db[collection][idx] = {
      ...existingDoc,
      deleted: true,
      deletedAt: new Date().toISOString()
    };
  } else {
    // Hard delete simple items like wishlists
    db[collection].splice(idx, 1);
  }

  await writeDB(db);

  // 5. Log Activity
  if (user) {
    await logActivity(
      'admin',
      user.userId,
      `Deleted document from ${collection}`,
      { id, name: existingDoc.name || existingDoc.orderId }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
