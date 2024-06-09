import * as db from '$lib/db.server';
import { fail, redirect } from '@sveltejs/kit';
import { purgeCache } from '@netlify/functions';

export const actions = {
	async default({ request, cookies, platform }) {
		// We only want authenticated users to be able to upload emotes.
		const user = await db.auth.getFromCookies(cookies);
		if (!user) {
			return fail(401, { message: 'no permission' });
		}

		const form = await request.formData();

		const name = form.get('name');
		const type = form.get('type');

		if (typeof name !== 'string') {
			return fail(400, { message: 'missing name' });
		}

		// The source of the image depends on the upload type.
		let image: Blob;
		let format: string;
		if (type === 'bttv') {
			const url = form.get('bttv-url');
			if (!url) {
				return fail(400, { message: 'missing BTTV url' });
			}

			// First, we extract the ID from the BTTV url.
			const match = /https:\/\/betterttv\.com\/emotes\/([a-z0-9]+)/g.exec(url.toString());
			if (!match || match?.length < 2) {
				return fail(400, { message: 'invalid BTTV url' });
			}

			const id = match[1];

			// Then, we fetch some information about the emote from the BTTV API.
			const apiUrl = `https://api.betterttv.net/3/emotes/${id}`;
			const apiRes = await fetch(apiUrl).then((res) => res.json());

			format = apiRes['imageType'];

			// Lastly, we fetch the image itself
			const emoteUrl = `https://cdn.betterttv.net/emote/${id}/3x.${format}`;
			image = await fetch(emoteUrl).then((res) => res.blob());
		} else if (type === 'upload') {
			const file = form.get('image');
			if (!(file instanceof File)) {
				return fail(400, { message: 'invalid file upload' });
			}

			format = file.name.split('.').at(-1)!;
			image = file;
		} else {
			return fail(400, { message: 'invalid upload type' });
		}

		if (!(await db.emotes.upload(name, image, format, user))) {
			return fail(500, { message: 'internal error while uploading emote' });
		}

		try {
			// @ts-expect-error Netlify types are weird.
			const context = platform?.context;
			const token = context?.clientContext?.custom?.purge_api_token;
			await purgeCache({ token });
		} catch (e) {
			console.warn('could not purge netlify cache:', e);
		}

		console.log(`${user.name} added the emote ${name} (${type}, ${format})`);
		return redirect(302, '/');
	}
};
