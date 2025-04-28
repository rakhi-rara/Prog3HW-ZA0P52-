import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import path from 'path';
import type { Pet, SafeUser } from '$lib/types';

const dataPath = (file: string) => path.resolve('static/data', file);

export const load = async ({ locals }: RequestEvent) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const [petsRaw, usersRaw] = await Promise.all([
        readFile(dataPath('pets.json'), 'utf-8'),
        readFile(dataPath('users.json'), 'utf-8')
    ]);

    const pets: Pet[] = JSON.parse(petsRaw);
    const users = JSON.parse(usersRaw);

    const freshUser = users.find((u: SafeUser) => u.id === locals.user!.id);

    if (!freshUser) {
        throw redirect(302, '/login');
    }

    const adoptedPets = pets.filter((p) => p.ownerId === freshUser.id);

    return {
        user: freshUser,
        pets: adoptedPets
    };
};

