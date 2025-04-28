import type { RequestHandler } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { json } from '@sveltejs/kit';
import { logAction } from '$lib/helpers';



const dataPath = (file: string) => path.join('static', 'data', file);

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { petId } = await request.json();

		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = locals.user.id;
		const petsRaw = await readFile(dataPath('pets.json'), 'utf-8');
		const pets = JSON.parse(petsRaw);

		const pet = pets.find((p: any) => p.id === petId);
		if (!pet) {
			return json({ error: 'Pet not found' }, { status: 404 });
		}
		if (pet.adopted) {
			return json({ error: 'Pet already adopted' }, { status: 400 });
		}

		// Mark pet as adopted
		pet.adopted = true;
		pet.ownerId = userId;

		await writeFile(dataPath('pets.json'), JSON.stringify(pets, null, 2));

		// Update user’s pet list
		const usersRaw = await readFile(dataPath('users.json'), 'utf-8');
		const users = JSON.parse(usersRaw);
		const user = users.find((u: any) => u.id === userId);

		if (!user) {
			return json({ error: 'User not found' }, { status: 500 });
		}

		user.pets = [...(user.pets || []), pet.id];
		await writeFile(dataPath('users.json'), JSON.stringify(users, null, 2));

		await logAction(`${user.name} adopted ${pet.name}`);


		return json({ success: true, pet });

	} catch (err) {
		console.error(err);
		return json({ error: 'Failed to adopt pet' }, { status: 500 });
	}
};

