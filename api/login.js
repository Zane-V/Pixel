/* POST   { password } → signs in (sets the session cookie)
   GET    → { admin: true|false }
   DELETE → signs out */
import { checkPassword, sessionCookie, clearCookie, isAdmin, json } from './_auth.js';

export async function POST(request) {
    const body = await request.json().catch(() => ({}));
    if (!checkPassword(body.password)) {
        await new Promise(r => setTimeout(r, 800));   // slow down guessing
        return json({ error: 'That password is not right.' }, 401);
    }
    return json({ admin: true }, 200, { 'Set-Cookie': sessionCookie() });
}

export function GET(request) {
    return json({ admin: isAdmin(request) });
}

export function DELETE() {
    return json({ admin: false }, 200, { 'Set-Cookie': clearCookie });
}
