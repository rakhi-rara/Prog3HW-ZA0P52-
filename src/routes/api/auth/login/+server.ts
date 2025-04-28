import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { name, password } = await request.json();

		if (!name || !password) {
			return json({ error: 'Missing name or password' }, { status: 400 });
		}

		const raw = await readFile(usersPath, 'utf-8');
		const users = JSON.parse(raw);
		const user = users.find((u: any) => u.name === name);

		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);

		if (!isValid) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		cookies.set('user', String(user.id), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 // 1 day
		});

		// Still return the full user object for app to use
		const safeUser = {
			id: user.id,
			name: user.name,
			role: user.role,
			budget: user.budget,
			inventory: user.inventory ?? {}
		};

		return json({ success: true, user: safeUser });
	} catch (err) {
		console.error('Login error:', err);
		return json({ error: 'Login failed' }, { status: 500 });
	}
};

