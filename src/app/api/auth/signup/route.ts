import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { hashPassword, createToken } from '@/lib/auth';
import {
  verifyCSRF,
  isRateLimited,
  isValidPassword,
  logActivity
} from '@/lib/security';

import { readDB, writeDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Public registration is closed. Please contact the administrator.' },
    { status: 403 }
  );
}

export async function POST_disabled(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // 3. Password Complexity Check
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        },
        { status: 400 }
      );
    }

    const db = await readDB();
    if (!db.users) {
      db.users = [];
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = db.users.some((u: any) => u.email.toLowerCase().trim() === normalizedEmail);

    if (userExists) {
      await logActivity('auth', 'anonymous', 'Failed signup (duplicate email)', { email: normalizedEmail, ip });
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 400 });
    }

    // Determine role (first user or specific emails are admin, default is 'user')
    const role: 'admin' | 'user' = normalizedEmail.includes('admin') || db.users.length === 0 ? 'admin' : 'user';
    const passwordHash = await hashPassword(password);
    const newUserId = `usr-${Math.floor(Math.random() * 900000) + 100000}`;

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    const payload = {
      userId: newUserId,
      email: normalizedEmail,
      role,
      name: newUser.name
    };

    const token = await createToken(payload);

    await logActivity('auth', newUserId, 'User signed up', { email: normalizedEmail, role, ip });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        name: newUser.name,
        email: normalizedEmail,
        role
      }
    }, { status: 201 });

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
    return NextResponse.json({ error: err?.message || 'Server error during signup.' }, { status: 500 });
  }
}
