<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Emote } from '$lib/db.server';

	import '$lib/base.css';
	import { invalidateAll } from '$app/navigation';

	export let data;

	async function removeEmote(emote: Emote) {
		if (!confirm(`Are you sure you want to delete ${emote.name}?`)) {
			return;
		}

		await fetch('?/delete-emote', {
			method: 'POST',
			body: JSON.stringify({ id: emote.id })
		});

		await invalidateAll();
	}
</script>

<h1>emotes.chrr.me</h1>

{#if data.user}
	<form use:enhance method="POST" action="?/sign-out">
		<p>
			You're signed in as <b>{data.user.name}</b>.
			<button class="link">Click here to sign out</button>.
		</p>
	</form>
{:else}
	<p>
		This is the main emote repository for the
		<a href="https://github.com/chrrs/pegs-emotes">PEGS Emotes mod</a>.
	</p>
{/if}

<div class="emote-header">
	<h2>List of all emotes:</h2>
	{#if data.user}
		<a href="/add">+ add a new emote</a>
	{/if}
</div>

<div class="emotes">
	{#each data.emotes as emote (emote.id)}
		<figure class="emote">
			<img src={emote.url} alt={emote.name} />
			<figcaption>
				{emote.name}
				{#if data.user}
					<button class="link" on:click={() => removeEmote(emote)}>[X]</button>
				{/if}
			</figcaption>
		</figure>
	{/each}
</div>

<style>
	.emote-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.emotes {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.emote img {
		width: 8rem;
		height: 4rem;
		object-fit: contain;
	}
</style>
