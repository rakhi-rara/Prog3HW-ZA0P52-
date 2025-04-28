// src/routes/logs/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/logs');
		if (!res.ok) {
			throw new Error('Failed to fetch logs');
		}

		const logs = await res.json();
		return { logs };
	} catch (err) {
		console.error('Error loading logs:', err);
		return { logs: [] };
	}
};

