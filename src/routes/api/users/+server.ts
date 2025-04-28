import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');
const logPath = path.resolve('static/data/log.json');

// Helper to log actions to log.json
const logAction = async (message: string) => {
    const logRaw = await fs.readFile(logPath, 'utf-8');
    const logs = JSON.parse(logRaw);
    logs.unshift({ timestamp: new Date().toISOString(), message });
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { userId, budget, inventory } = await request.json();

        if (!userId || budget === undefined || !inventory) {
            return json({ error: 'Missing data in request' }, { status: 400 });
        }

        const usersRaw = await fs.readFile(usersPath, 'utf-8');
        const users = JSON.parse(usersRaw);

        const user = users.find((u: any) => u.id === userId);
        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        user.budget = budget;
        user.inventory = inventory;

        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        await logAction(`${user.name} purchased items: ${JSON.stringify(inventory)}`);

        const safeUser = { ...user };
        delete safeUser.passwordHash;

        return json({ user: safeUser });
    } catch (err) {
        console.error(err);
        return json({ error: 'Failed to update user data' }, { status: 500 });
    }
};



