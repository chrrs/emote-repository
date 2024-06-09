// See https://kit.svelte.dev/docs/types#app

import type { User } from '$lib/db.server';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
