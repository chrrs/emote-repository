<script lang="ts">
	import { enhance } from '$app/forms';
	import '$lib/base.css';

	let type = 'bttv';
	let loading = false;

	export let form;
</script>

<a href="/">&leftarrow; back to home</a>

<h1>Add an emote!</h1>

<form
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			update();
		};
	}}
	method="POST"
	enctype="multipart/form-data"
>
	<div class="input-group">
		<label for="name">Name</label>
		<input id="name" name="name" type="text" placeholder="FeelsDankMan" required />
	</div>

	<hr />

	<div class="radio-group">
		<label>
			<input type="radio" name="type" value="bttv" bind:group={type} />
			Import from BTTV
		</label>
		<label>
			<input type="radio" name="type" value="upload" bind:group={type} />
			Upload image
		</label>
	</div>

	{#if type === 'bttv'}
		<div class="input-group">
			<label for="bttv-url">Emote URL</label>
			<input
				id="bttv-url"
				name="bttv-url"
				type="text"
				placeholder="https://betterttv.com/emotes/5b6ded5560d17f4657e1319e"
				required
			/>
		</div>
	{:else if type === 'upload'}
		<div class="input-group">
			<label for="image">Image File</label>
			<input id="image" name="image" type="file" required />
		</div>
	{/if}

	<hr />

	{#if loading}
		<p>loading...</p>
	{:else if form?.message}
		<p class="error">failed to submit emote: {form.message}</p>
	{/if}

	<p><button class="link">+ submit emote</button></p>
</form>
