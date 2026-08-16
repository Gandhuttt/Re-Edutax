<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import '../app.scss';
	import Header from './Header.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		void import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});
</script>

<svelte:head>
</svelte:head>

<div class="app">
	<Header
		authenticated={!!data.user}
		loggedUsername={data.user?.name ?? 'guest'}
		isAdmin={data.isAdmin ?? false}
	/>

	<main>
		{@render children()}
	</main>

	<footer></footer>
</div>
