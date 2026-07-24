import { NextRequest, NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(request: NextRequest, scope: string, limit = 30, windowMs = 60_000) {
  const forwarded = request.headers.get('x-forwarded-for');
  const client =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'local';
  const key = `${scope}:${client}`;
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [bucketKey, candidate] of buckets) if (candidate.resetAt <= now) buckets.delete(bucketKey);
  }
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;

  return NextResponse.json(
    { error: 'rate_limited', message: 'Too many requests. Please wait and try again.' },
    { status: 429, headers: { 'Retry-After': Math.ceil((bucket.resetAt - now) / 1000).toString() } }
  );
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const requestHost = request.headers.get('host');
    const acceptedHosts = new Set([requestUrl.host, forwardedHost, requestHost].filter(Boolean));
    if (acceptedHosts.has(originUrl.host)) return null;
  } catch {
    // Malformed Origin headers are rejected below.
  }
  return NextResponse.json({ error: 'invalid_origin', message: 'Cross-origin request rejected.' }, { status: 403 });
}
