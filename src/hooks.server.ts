import type { Handle } from '@sveltejs/kit';
import parse from 'set-cookie-parser';
import { readFile } from 'fs/promises';
import path from 'path';
import type { SafeUser, User } from '$lib/types';

const dataPath = (file: string) => path.resolve('static/data', file);

export const handle: Handle = async ({ event, resolve }) => {
    const cookieHeader = event.request.headers.get('cookie');
    let user: SafeUser | null = null;

    if (cookieHeader) {
        const cookies = parse(cookieHeader, { map: false }) as { name: string; value: string }[];

        const userCookie = cookies.find((c) => c.name === 'user');
        if (userCookie?.value) {
            const userId = parseInt(userCookie.value); // ✅ just parseInt, NOT JSON.parse

            const usersRaw = await readFile(dataPath('users.json'), 'utf-8');
            const users: User[] = JSON.parse(usersRaw);

            const found = users.find((u) => u.id === userId);

            if (found) {
                const { passwordHash, ...safeUser } = found;
                user = safeUser;
            }
        }
    }

    event.locals.user = user;

    return resolve(event);
};
