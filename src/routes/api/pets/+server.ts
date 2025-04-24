import type { RequestHandler } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async () => {
	const filePath = path.resolve('data/pets.json');
	const data = await readFile(filePath, 'utf-8');
	const pets = JSON.parse(data);

	return new Response(JSON.stringify(pets), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};


