export type User = {
	id: number;
	name: string;
	passwordHash: string;
	budget: number;
	inventory: {
		food: number;
		toy: number;
		treat: number;
	};
	role?: 'admin' | 'user';
	pets?: number[]; // optional - list of adopted pet IDs
};

export type SafeUser = Omit<User, 'passwordHash'>;

export type Pet = {
	id: number;
	name: string;
	type: 'puppy' | 'kitten';
	hunger: number;
	happiness: number;
	adopted: boolean;
	ownerId: number | null;
	image?: string;
};
