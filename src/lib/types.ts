export type User = {
	id: number;
	name: string;
	password: string; // hashed
	role: 'user' | 'admin';
	budget: number;
	inventory: {
		food: number;
		toy: number;
		treat: number;
	};
};
