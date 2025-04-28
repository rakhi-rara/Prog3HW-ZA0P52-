import { redirect } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import path from 'path';

const dataPath = (file: string) => path.join('static', 'data', file);

export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(302, '/login');
    }
    if (locals.user.role !== 'admin') {
        throw redirect(302, '/');
    }

    const [usersRaw, petsRaw] = await Promise.all([
        readFile(dataPath('users.json'), 'utf-8'),
        readFile(dataPath('pets.json'), 'utf-8')
    ]);

    const users = JSON.parse(usersRaw).map((u: any) => {
        const safeUser = { ...u };
        delete safeUser.passwordHash;
        return safeUser;
    });
    const pets = JSON.parse(petsRaw);

    return { users, pets };
}
