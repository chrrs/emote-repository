import * as db from '$lib/db.server';
import { fail, redirect } from '@sveltejs/kit';
import { purgeCache } from '@netlify/functions';

export async function load() {
	return {
		emotes: (await db.emotes.allOrdered()).map((emote) => ({
			url: db.emotes.getUrl(emote),
			...emote
		}))
	};
}

export const actions = {
	async 'delete-emote'({ request, cookies }) {
		// We only want authenticated users to be able to delete emotes.
		const user = await db.auth.getFromCookies(cookies);
		if (!user) {
			return fail(401, { message: 'no permission' });
		}

		const body = await request.json();
		const emoteId = body['id'];

		const emote = await db.emotes.delete(user, emoteId);

		try {
			await purgeCache();
		} catch (e) {
			console.warn('could not purge netlify cache:', e);
		}

		if (emote) {
			console.log(`${user.name} deleted the emote ${emote.name}`);
		}
	},
	'sign-out'({ cookies }) {
		cookies.delete('access_token', { path: '/' });
		return redirect(302, '/');
	}
};
