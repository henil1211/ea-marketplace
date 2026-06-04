import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyPassword, createToken } from '@/lib/auth';
import {
  verifyCSRF,
  isRateLimited,
  checkLoginAttempts,
  registerFailedLogin,
  clearFailedLogins,
  logActivity
} from '@/lib/security';

import { readDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // 1. CSRF Verification
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF validation failed.' }, { status: 403 });
  }

  // 2. Global IP Rate Limiter (20 attempts per minute)
  if (isRateLimited(ip, 'login', 20, 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check Lockout Status for both IP and Email
    const emailLock = checkLoginAttempts(normalizedEmail);
    const ipLock = checkLoginAttempts(ip);

    if (!emailLock.allowed) {
      return NextResponse.json(
        { error: `Account locked. Try again in ${emailLock.cooldownMinutes} minutes.` },
        { status: 423 }
      );
    }
    if (!ipLock.allowed) {
      return NextResponse.json(
        { error: `Too many failures from this IP. Try again in ${ipLock.cooldownMinutes} minutes.` },
        { status: 423 }
      );
    }

    const db = await readDB();
    if (!db.users) {
      db.users = [];
    }

    const user = db.users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail);

    if (!user) {
      registerFailedLogin(normalizedEmail);
      registerFailedLogin(ip);
      await logActivity('auth', 'anonymous', 'Failed login (user not found)', { email: normalizedEmail, ip });
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      registerFailedLogin(normalizedEmail);
      registerFailedLogin(ip);
      await logActivity('auth', user.id || 'anonymous', 'Failed login (non-admin role)', { email: normalizedEmail, ip });
      return NextResponse.json({ error: 'Access denied. Admin authorization required.' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      registerFailedLogin(normalizedEmail);
      registerFailedLogin(ip);
      await logActivity('auth', user.id || 'anonymous', 'Failed login (incorrect password)', { email: normalizedEmail, ip });
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Success: Clear failed logs
    clearFailedLogins(normalizedEmail);
    clearFailedLogins(ip);

    const payload = {
      userId: user.id,
      email: normalizedEmail,
      role: user.role as 'admin' | 'user',
      name: user.name
    };

    const token = await createToken(payload);

    await logActivity('auth', user.id, 'Successful login', { email: normalizedEmail, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: normalizedEmail,
        role: user.role
      }
    }, { status: 200 });

    // Set secure HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error during login.' }, { status: 500 });
  }
}
