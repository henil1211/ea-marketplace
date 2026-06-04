import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { SignJWT } from 'jose';
import { verifyToken } from '@/lib/auth';

import { readDB } from '@/lib/db';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ea-vault-jwt-secret-key-1234567890'
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eaId: string }> }
) {
  const { eaId } = await params;

  // 1. Authenticate user
  const sessionToken = request.cookies.get('auth_token')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  const verified = await verifyToken(sessionToken);
  if (!verified) {
    return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
  }

  // 2. Load DB records for the EA
  const db = await readDB();
  const ea = db.eas?.find((item: any) => item.id === eaId && item.deleted !== true);

  if (!ea) {
    return NextResponse.json({ error: 'Expert Advisor not found.' }, { status: 404 });
  }

  // 3. Check purchase ownership
  const isAdmin = verified.role === 'admin';
  let hasPurchased = false;

  if (isAdmin) {
    hasPurchased = true;
  } else {
    hasPurchased = db.orders?.some(
      (order: any) =>
        order.userId === verified.userId &&
        order.eaId === eaId &&
        order.status === 'completed' &&
        order.deleted !== true
    );
  }

  if (!hasPurchased) {
    return NextResponse.json({ error: 'Forbidden. Purchase required.' }, { status: 403 });
  }

  // 4. Generate a short-lived download JWT token (expires in 5 minutes)
  const downloadToken = await new SignJWT({
    userId: verified.userId,
    eaId: eaId,
    role: verified.role,
    email: verified.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET);

  const downloadUrl = `/api/download/${eaId}?token=${downloadToken}`;

  return NextResponse.json({ success: true, downloadUrl });
}
