// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user: import('$lib/types').SafeUser | null;
		}
		// You can extend other types below if needed in the future
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'set-cookie-parser';

export {};


