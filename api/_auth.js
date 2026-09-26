/* Admin session: a signed, HttpOnly cookie that expires after 8 hours.
   Set ADMIN_PASSWORD (and optionally ADMIN_SESSION_SECRET) in the Vercel project.
   Files starting with "_" in /api are helpers, not endpoints. */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'px_admin';
const MAX_AGE = 60 * 60 * 8;

function secret() {
    const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
    if (!s) throw new Error('ADMIN_PASSWORD is not set');
    return s;
}
const sign = value => createHmac('sha256', secret()).update(value).digest('base64url');
const digest = value => createHash('sha256').update(value).digest();

export function checkPassword(given) {
    const want = process.env.ADMIN_PASSWORD;
    if (!want || typeof given !== 'string' || !given) return false;
    return timingSafeEqual(digest(given), digest(want));
}

export function sessionCookie() {
    const exp = String(Date.now() + MAX_AGE * 1000);
    return `${COOKIE}=${exp}.${sign(exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}
export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function isAdmin(request) {
    const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)px_admin=([^;]+)/);
    if (!m) return false;
    const [exp, sig] = m[1].split('.');
    if (!exp || !sig || !(Number(exp) > Date.now())) return false;
    const good = Buffer.from(sign(exp));
    const got = Buffer.from(sig);
    return good.length === got.length && timingSafeEqual(good, got);
}

export function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
    });
}

/* Must match the ids in photos.js */
export const CATEGORIES = ['beauty', 'birthday', 'bridals', 'lifestyle', 'men', 'pregnancy', 'wedding'];
