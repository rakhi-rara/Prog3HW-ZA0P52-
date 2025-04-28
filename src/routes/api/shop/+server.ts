import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const dataPath = (file: string) => path.resolve('static/data', file);

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { item } = await request.json();

		const usersRaw = await fs.readFile(dataPath('users.json'), 'utf-8');
		const users = JSON.parse(usersRaw);

		const user = users.find((u: any) => u.id === locals.user!.id);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Item prices
		const prices = {
			food: 5,
			toy: 10,
			treat: 15
		};

		if (!(item in prices)) {
			return json({ error: 'Invalid item' }, { status: 400 });
		}

		const cost = prices[item as keyof typeof prices];

		if (user.budget < cost) {
			return json({ error: 'Not enough budget' }, { status: 400 });
		}

		// Deduct cost and update inventory
		user.budget -= cost;
		user.inventory = user.inventory || {};
		user.inventory[item] = (user.inventory[item] || 0) + 1;

		// Save updated users
		await fs.writeFile(dataPath('users.json'), JSON.stringify(users, null, 2));

		const { passwordHash, ...safeUser } = user;

		return json({
			success: true,
			message: `Purchased ${item}!`,
			user: safeUser
		});
	} catch (err) {
		console.error('Shop POST error:', err);
		return json({ error: 'Failed to process purchase' }, { status: 500 });
	}
};
