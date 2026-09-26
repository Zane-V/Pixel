/* GET    → every uploaded photo: { photos: [{ url, category, uploadedAt }] }  (public)
   POST   → upload one photo; body is the image, X-Category names its category  (admin)
   DELETE → { url } removes one uploaded photo  (admin)
   Photos live in Vercel Blob under gallery/<category>/. */
import { list, put, del } from '@vercel/blob';
import { isAdmin, json, CATEGORIES } from './_auth.js';

const PREFIX = 'gallery/';
const MAX_BYTES = 4_400_000;   // Vercel's request body limit is 4.5 MB; the admin page resizes first
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function GET(request) {
    const photos = [];
    let cursor;
    do {
        const page = await list({ prefix: PREFIX, limit: 1000, cursor });
        page.blobs.forEach(b => {
            const category = b.pathname.split('/')[1];
            if (CATEGORIES.includes(category)) photos.push({ url: b.url, category, uploadedAt: b.uploadedAt });
        });
        cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // The public site can use a briefly cached copy; the admin page asks for a fresh one
    const fresh = new URL(request.url).searchParams.has('fresh');
    return json({ photos }, 200, {
        'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=30, stale-while-revalidate=300',
    });
}

export async function POST(request) {
    if (!isAdmin(request)) return json({ error: 'Please sign in again.' }, 401);

    const category = request.headers.get('x-category');
    if (!CATEGORIES.includes(category)) return json({ error: 'Pick a category.' }, 400);

    const type = (request.headers.get('content-type') || '').split(';')[0];
    if (!TYPES[type]) return json({ error: 'Only JPEG, PNG or WebP images.' }, 415);

    const body = Buffer.from(await request.arrayBuffer());
    if (!body.length) return json({ error: 'The file was empty.' }, 400);
    if (body.length > MAX_BYTES) return json({ error: 'That image is too large.' }, 413);

    const name = (request.headers.get('x-filename') || 'photo')
        .replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo';

    const blob = await put(`${PREFIX}${category}/${Date.now()}-${name}.${TYPES[type]}`, body, {
        access: 'public',
        contentType: type,
        addRandomSuffix: true,
    });
    return json({ url: blob.url, category, uploadedAt: new Date().toISOString() }, 201);
}

export async function DELETE(request) {
    if (!isAdmin(request)) return json({ error: 'Please sign in again.' }, 401);
    const { url } = await request.json().catch(() => ({}));
    let path = '';
    try { path = new URL(url).pathname; } catch (e) {}
    if (!path.startsWith('/' + PREFIX)) return json({ error: 'Unknown photo.' }, 400);
    await del(url);
    return json({ deleted: url });
}
