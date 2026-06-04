import { NextRequest } from 'next/server';

// ─── Memory Storage for Rate Limiting & Lockouts ───
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const loginAttemptCache = new Map<string, { attempts: number; lockoutUntil: number }>();

// ─── 1. Password Complexity Validation ───
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

// ─── 2. In-Memory Sliding-Window Rate Limiter ───
export function isRateLimited(
  ip: string,
  action: string,
  limit: number,
  windowMs: number
): boolean {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const cached = rateLimitCache.get(key);

  if (!cached || now > cached.resetTime) {
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  cached.count += 1;
  if (cached.count > limit) {
    return true;
  }

  return false;
}

// ─── 3. Failed Login Lockout System ───
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginAttempts(emailOrIp: string): {
  allowed: boolean;
  remaining: number;
  cooldownMinutes: number;
} {
  const normalized = emailOrIp.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttemptCache.get(normalized);

  if (!record) {
    return { allowed: true, remaining: MAX_FAILED_ATTEMPTS, cooldownMinutes: 0 };
  }

  if (now < record.lockoutUntil) {
    const cooldown = Math.ceil((record.lockoutUntil - now) / 60000);
    return { allowed: false, remaining: 0, cooldownMinutes: cooldown };
  }

  // If lockout duration has passed, reset the attempts
  if (now >= record.lockoutUntil && record.lockoutUntil > 0) {
    loginAttemptCache.delete(normalized);
    return { allowed: true, remaining: MAX_FAILED_ATTEMPTS, cooldownMinutes: 0 };
  }

  return {
    allowed: true,
    remaining: Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts),
    cooldownMinutes: 0,
  };
}

export function registerFailedLogin(emailOrIp: string) {
  const normalized = emailOrIp.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttemptCache.get(normalized) || { attempts: 0, lockoutUntil: 0 };

  record.attempts += 1;
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
  }

  loginAttemptCache.set(normalized, record);
}

export function clearFailedLogins(emailOrIp: string) {
  const normalized = emailOrIp.toLowerCase().trim();
  loginAttemptCache.delete(normalized);
}

// ─── 4. CSRF Origin & Referer Verification ───
export function verifyCSRF(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host') || '';

  // For server-to-server or non-mutating requests (GET) CSRF might not be present,
  // but for POST, PUT, DELETE, PATCH, we should check it.
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(request.method)) {
    return true;
  }

  const expectedHost = host.split(':')[0]; // strip port

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.hostname !== expectedHost && originUrl.hostname !== 'localhost') {
        return false;
      }
    } catch {
      return false;
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname !== expectedHost && refererUrl.hostname !== 'localhost') {
        return false;
      }
    } catch {
      return false;
    }
  } else {
    // Block mutating requests without Origin or Referer in production
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
  }

  return true;
}

// ─── 5. Activity Audit Logging Helper ───
export async function logActivity(
  type: 'auth' | 'purchase' | 'download' | 'review' | 'admin' | 'settings' | 'featured',
  userId: string,
  action: string,
  metadata: Record<string, any> = {}
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Use an asynchronous call without blocking
    fetch(`${baseUrl}/api/stitch/activityLogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        userId,
        action,
        metadata,
        createdAt: new Date().toISOString(),
      }),
    }).catch((err) => console.error('Silent fail on log activity fetch:', err));
  } catch (err) {
    console.error('Error writing activity log:', err);
  }
}
