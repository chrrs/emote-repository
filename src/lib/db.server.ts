import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { sha1hex } from './hash';

export interface User {
	id: number;
	name: string;
}

export interface Emote {
	id: number;
	name: string;
	format: string;
	sha1: string;
	created_at: string;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const emotes = {
	async all(): Promise<Emote[]> {
		const { data } = await supabase.from('emotes').select('*');
		return data || [];
	},
	async allOrdered(): Promise<Emote[]> {
		const { data } = await supabase.from('emotes').select('*').order('name');
		return data || [];
	},
	getUrl(emote: Emote): string {
		return `${SUPABASE_URL}/storage/v1/object/public/emotes/${emote.sha1}.${emote.format}`;
	},
	async upload(name: string, image: Blob, format: string, author: User): Promise<boolean> {
		const sha1 = await sha1hex(image);
		const filename = `${sha1}.${format}`;

		const upload = await supabase.storage
			.from('emotes')
			.upload(filename, image, { upsert: true, cacheControl: '31556952' });
		if (!upload.data) {
			console.error('failed to upload emote:', upload.error);
			return false;
		}

		const insert = await supabase.from('emotes').insert({
			name,
			format,
			sha1,
			created_by: author.id
		});

		if (insert.error) {
			console.error('failed to insert emote:', insert.error);
			return false;
		}

		return true;
	},
	async delete(user: User, id: number): Promise<Emote | null> {
		const { data, error } = await supabase.from('emotes').delete().eq('id', id).select();

		if (error || !data) {
			console.error('failed to delete emote', error);
			return null;
		}

		if (data.length < 1) {
			return null;
		}

		const record = data[0];
		const duplicates = await supabase.from('emotes').select('').eq('sha1', record.sha1);
		if (!duplicates.error && duplicates.data?.length === 0) {
			await supabase.storage.from('emotes').remove([`${record.sha1}.${record.format}`]);
		}

		return record;
	}
};

// FIXME: The auth system we're using is kind of insecure, but I don't want to make
//        it too complicated, so this works for now. Ideally, this would use Supabase's
//        Auth system, but I don't want to force anyone to give me their email address.
export const auth = {
	async exists(accessToken: string): Promise<boolean> {
		return (await this.get(accessToken)) !== null;
	},
	async get(accessToken: string): Promise<User | null> {
		const { data } = await supabase
			.from('users')
			.select('id, name')
			.limit(1)
			.eq('access_token', accessToken);
		return data?.[0] ?? null;
	},
	async getFromCookies(cookies: Cookies): Promise<User | null> {
		const accessToken = cookies.get('access_token');
		if (!accessToken) {
			return null;
		}

		return await this.get(accessToken);
	}
};
