import * as db from '$lib/db.server';
import { json } from '@sveltejs/kit';

export async function GET() {
	const emotes = await db.emotes.all();

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
