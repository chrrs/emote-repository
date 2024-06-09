import * as db from '$lib/db.server';

export async function load({ cookies }) {
	const accessToken = cookies.get('access_token');
	if (accessToken) {
		const user = await db.auth.get(accessToken);
		if (user != null) {
			// We refresh the cookie, so it can be valid for longer.
			cookies.set('access_token', accessToken, { path: '/', maxAge: 60 * 60 * 24 * 7 });
			return { user };
		} else {
			cookies.delete('access_token', { path: '/' });
		}
	}

	return { user: null };
}
