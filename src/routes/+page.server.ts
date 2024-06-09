import * as db from '$lib/db.server';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ url, cookies }) {
	const accessToken = url.searchParams.get('access_token');
	if (accessToken) {
		if (!(await db.auth.exists(accessToken))) {
			throw fail(401);
		}

		cookies.set('access_token', accessToken, { path: '/', maxAge: 60 * 60 * 24 * 7 });
		return redirect(302, '/');
	}

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

		if (emote) {
			console.log(`${user.name} deleted the emote ${emote.name}`);
		}
	},
	'sign-out'({ cookies }) {
		cookies.delete('access_token', { path: '/' });
		return redirect(302, '/');
	}
};
