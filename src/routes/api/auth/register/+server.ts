import type { RequestHandler } from './$types';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { json } from '@sveltejs/kit';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { name, password } = await request.json();

		if (!name || !password) {
			return json({ error: 'Missing name or password' }, { status: 400 });
		}

		const raw = await readFile(usersPath, 'utf-8');
		const users = JSON.parse(raw);

		if (users.find((u: any) => u.name === name)) {
			return json({ error: 'User already exists' }, { status: 409 });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = {
			id: Math.max(0, ...users.map((u: any) => u.id ?? 0)) + 1,
			name,
			passwordHash: hashedPassword,
			budget: 100,
			role: 'user',
			inventory: { food: 0, toy: 0, treat: 0 }
		};

		users.push(newUser);
		await writeFile(usersPath, JSON.stringify(users, null, 2));

		const safeUser = {
			id: newUser.id,
			name: newUser.name,
			role: newUser.role,
			budget: newUser.budget,
			inventory: newUser.inventory
		};

		// Auto-login after register
		cookies.set('user', JSON.stringify(safeUser), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24
		});

		return json({ success: true, user: safeUser });
	} catch (err) {
		console.error('Register error:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

