<script lang="ts">
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import '../app.css';
	import '../app.scss';
	import Header from './Header.svelte';
	import type { LayoutProps } from './$types';
	import { dismissBsModalsForNavigation } from '$lib/helpers/bsModal';

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		void import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});

	// A modal that submits and redirects (Buat SPT on /konsep) never gets hidden,
	// so Bootstrap's backdrop and body scroll lock -- both attached to <body>,
	// outside the routed DOM -- survive the navigation and cover the destination
	// page. Cleared here rather than at each call site so any modal that
	// navigates is covered, and so a failed submit still leaves the modal open
	// with its errors showing.
	onNavigate(() => {
		void dismissBsModalsForNavigation();
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
