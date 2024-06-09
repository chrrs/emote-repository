<script lang="ts">
	import { page } from '$app/stores';

	import '$lib/base.css';
</script>

<a href="/">&leftarrow; back to home</a>

<h1>{$page.status}: {$page.error?.message}</h1>
<p>Oops! Something went wrong.</p>
