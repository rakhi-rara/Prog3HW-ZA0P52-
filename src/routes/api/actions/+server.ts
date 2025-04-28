import fs from 'fs/promises';
import path from 'path';
import { json } from '@sveltejs/kit';
import { feedPet, toyPet, returnPet, logAction } from '$lib/helpers';

import type { RequestHandler } from './$types';

const dataPath = (file: string) => path.resolve('static/data', file);




// POST handler
export const POST: RequestHandler = async ({ request }) => {
	const { petId, action } = await request.json();

	if (!petId || !action) {
		return json({ error: 'Missing petId or action' }, { status: 400 });
	}

	const [usersRaw, petsRaw] = await Promise.all([
		fs.readFile(dataPath('users.json'), 'utf-8'),
		fs.readFile(dataPath('pets.json'), 'utf-8')
	]);

	const users = JSON.parse(usersRaw);
	const pets = JSON.parse(petsRaw);

	const pet = pets.find((p: any) => p.id === petId);
	if (!pet || !pet.ownerId) {
		return json({ error: 'Pet not found or not adopted.' }, { status: 400 });
	}

	const user = users.find((u: any) => u.id === pet.ownerId);
	if (!user) {
		return json({ error: 'Owner not found.' }, { status: 404 });
	}

	let message: string | null = null;

	if (action === 'feed') {
		message = feedPet(user, pet);
	} else if (action === 'toy') {
		message = toyPet(user, pet);
	} else if (action === 'return') {
		message = returnPet(user, pet);
	} else {
		return json({ error: 'Invalid action' }, { status: 400 });
	}

	if (!message) {
		return json({ redirectTo: '/shop' }, { status: 400 });
	}


	await logAction(message);

	await Promise.all([
		fs.writeFile(dataPath('users.json'), JSON.stringify(users, null, 2)),
		fs.writeFile(dataPath('pets.json'), JSON.stringify(pets, null, 2))
	]);

	const safeUser = { ...user };
	delete safeUser.passwordHash;

	return json({
		user: safeUser,
		pets: pets.filter((p: any) => p.ownerId === user.id),
		message
	});
};

