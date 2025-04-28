
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/log');

		if (!res.ok) {
			throw new Error(`Failed to fetch logs: ${res.status}`);
		}

		const logs = await res.json();

		if (!Array.isArray(logs)) {
			throw new Error('Logs is not an array!');
		}

		console.log('Logs loaded on server:', logs);

		return { logs };
	} catch (err) {
		console.error('Error loading logs:', err);
		return { logs: [] };
	}
};

