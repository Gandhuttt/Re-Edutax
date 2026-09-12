<script lang="ts">
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import '../app.css';
	import '../app.scss';
	import Header from './Header.svelte';
	import type { LayoutProps } from './$types';
	import { dismissBsModalsForNavigation } from '$lib/helpers/bsModal';

	let { data, children }: LayoutProps = $props();
	const isDevUi = $derived(
		page.url.pathname === '/dev/ui' || page.url.pathname.startsWith('/dev/ui/')
	);
	const usesReUiShell = $derived(
		isDevUi || Boolean((page.data as { reUi?: boolean }).reUi)
	);

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

{#if isDevUi}
	<div class="dev-ui-canvas">
		{@render children()}
	</div>
{:else if usesReUiShell}
	<div class="re-ui-canvas">
		{@render children()}
	</div>
{:else}
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
{/if}

<style>
	.dev-ui-canvas {
		position: fixed;
		inset: 0;
		z-index: 1000;
		overflow: auto;
		background: #fff;
	}
	.re-ui-canvas {
		min-height: 100vh;
	}
</style>
