import * as db from '$lib/db.server';
import { json } from '@sveltejs/kit';

export async function GET({ setHeaders }) {
	const emotes = await db.emotes.all();

	setHeaders({
		'CDN-Cache-Control': 'public, max-age=86400'
	});

	return json({
		lastUpdated: new Date().toISOString(),
		emotes: emotes.map((emote) => ({
			name: emote.name,
			format: emote.format,
			url: db.emotes.getUrl(emote),
			sha1: emote.sha1
		}))
	});
}
