import type { Pet, User } from './types';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const dataPath = (file: string) => path.resolve('static/data', file);

export async function logAction(message: string) {
    const logPath = dataPath('log.json');
    const logDataRaw = await readFile(logPath, 'utf-8');
    const logData = JSON.parse(logDataRaw);
    logData.unshift({ timestamp: new Date().toISOString(), message });
    await writeFile(logPath, JSON.stringify(logData, null, 2));
}


/**
 * Check if the user has enough budget to afford something.
 */
export function canAfford(user: User, cost: number): boolean {
    return user.budget >= cost;
}

/**
 * Feed a pet: uses inventory first; if not, uses $5. Returns a log message.
 */
export function feedPet(user: User, pet: Pet): string | null {
    if (user.inventory.food > 0) {
        user.inventory.food -= 1;
        pet.hunger = Math.max(0, pet.hunger - 20);
        return `${user.name} fed ${pet.name} (used 1 food)`;
    } else if (canAfford(user, 5)) {
        user.budget -= 5;
        pet.hunger = Math.max(0, pet.hunger - 20);
        return `${user.name} fed ${pet.name} (−$5)`;
    }
    return null; // Not enough food or money
}

/**
 * Play with pet: uses inventory first; if not, uses $10. Returns a log message.
 */
export function toyPet(user: User, pet: Pet): string | null {
    if (user.inventory.toy > 0) {
        user.inventory.toy -= 1;
        pet.happiness = Math.min(100, pet.happiness + 30);
        return `${user.name} played with ${pet.name} (used 1 toy)`;
    } else if (canAfford(user, 10)) {
        user.budget -= 10;
        pet.happiness = Math.min(100, pet.happiness + 30);
        return `${user.name} played with ${pet.name} (−$10)`;
    }
    return null; // Not enough toys or money
}

/**
 * Return pet: costs $20. Returns a log message or null if not enough budget.
 */
export function returnPet(user: User, pet: Pet): string | null {
    if (!canAfford(user, 20)) return null;

    user.budget -= 20;
    pet.ownerId = null;
    pet.adopted = false;
    pet.hunger = 50;
    pet.happiness = 50;

    return `${user.name} returned ${pet.name} (−$20)`;
}
