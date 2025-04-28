import type { RequestHandler } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { json, error } from '@sveltejs/kit';

// Utility to resolve paths for data files
const dataPath = (file: string) => path.join('static', 'data', file);

// GET: Return all pets, with optional filtering by type
export const GET: RequestHandler = async ({ url }) => {
	try {
		const filePath = dataPath('pets.json');
		const data = await readFile(filePath, 'utf-8');
		let pets = JSON.parse(data);

		// Optional filter: /api/pets?type=kitten
		const type = url.searchParams.get('type');
		if (type) {
			pets = pets.filter((p: any) => p.type === type);
		}

		return new Response(JSON.stringify(pets), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to load pets' }), {
			status: 500
		});
	}
};

// POST: Add a new pet (Admin only)
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { name, type } = await request.json();

		if (!name || !type) {
			return json({ error: 'Missing name or type.' }, { status: 400 });
		}

		const petsRaw = await readFile(dataPath('pets.json'), 'utf-8');
		const pets = JSON.parse(petsRaw);

		const newPet = {
			id: Math.max(0, ...pets.map((p: any) => p.id)) + 1,
			name,
			type,
			ownerId: null,
			adopted: false,
			hunger: 50,
			happiness: 50
		};

		pets.push(newPet);

		await writeFile(dataPath('pets.json'), JSON.stringify(pets, null, 2));

		return json({ success: true, pet: newPet });
	} catch (error) {
		return json({ error: 'Failed to add pet.' }, { status: 500 });
	}
};

// PATCH: Perform feed/play/return action on a pet
export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const { petId, action } = await request.json();

	const petsPath = dataPath('pets.json');
	const usersPath = dataPath('users.json');

	const pets = JSON.parse(await readFile(petsPath, 'utf-8'));
	const users = JSON.parse(await readFile(usersPath, 'utf-8'));

	const pet = pets.find((p: any) => p.id === petId);
	const user = users.find((u: any) => u.id === locals.user?.id);

	if (!pet || !user) throw error(404, 'Pet or user not found');
	if (pet.ownerId !== user.id) throw error(403, 'Not your pet');

	let message = '';
	if (action === 'feed' && user.budget >= 5) {
		pet.hunger = Math.max(0, pet.hunger - 10);
		user.budget -= 5;
		message = 'Pet fed!';
	} else if (action === 'toy' && user.budget >= 10) {
		pet.happiness = Math.min(100, pet.happiness + 10);
		user.budget -= 10;
		message = 'Pet played with!';
	} else if (action === 'return' && user.budget >= 20) {
		pet.ownerId = null;
		user.budget -= 20;
		message = 'Pet returned.';
	} else {
		throw error(400, 'Invalid action or not enough budget.');
	}

	await writeFile(petsPath, JSON.stringify(pets, null, 2));
	await writeFile(usersPath, JSON.stringify(users, null, 2));

	const updatedUser = { ...user };
	delete updatedUser.passwordHash;

	const userPets = pets.filter((p: any) => p.ownerId === user.id);

	return json({ user: updatedUser, pets: userPets, message });
};

