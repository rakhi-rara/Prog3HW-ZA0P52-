
import { readFile } from 'fs/promises';
import path from 'path';
import type { RequestHandler } from '@sveltejs/kit';

const logPath = path.join(process.cwd(), 'static', 'data', 'log.json');

export const GET: RequestHandler = async () => {
	try {
		const data = await readFile(logPath, 'utf-8');
		const logs = JSON.parse(data);

		if (!Array.isArray(logs)) {
			throw new Error('Logs is not an array!');
		}

		console.log('Fetched logs from API:', logs);

		return new Response(JSON.stringify(logs), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (err) {
		console.error('Failed to read logs:', err);
		return new Response(JSON.stringify({ error: 'Failed to read logs.' }), {
			status: 500
		});
	}
};

