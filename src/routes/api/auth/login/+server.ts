import type { RequestHandler } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request }) => {
	const { name, password } = await request.json();
	const filePath = path.resolve('data/users.json');
	const raw = await readFile(filePath, 'utf-8');
	const users = JSON.parse(raw);

	const user = users.find((u: any) => u.name === name);
	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 });
	}

	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
	}

	return new Response(JSON.stringify(user), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

