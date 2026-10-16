<script lang="ts">
	import { onMount } from 'svelte';

	type TurnstileApi = {
		render(container: HTMLElement, options: Record<string, unknown>): string;
		reset(widgetId: string): void;
		remove(widgetId: string): void;
	};

	let { siteKey, action }: { siteKey: string; action: string } = $props();

	let container: HTMLDivElement;
	let widgetId: string | undefined;

	const turnstile = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

	let scriptReady: Promise<void> | undefined;

	function loadScript() {
		scriptReady ??= new Promise<void>((resolve, reject) => {
			if (turnstile()) return resolve();

			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Turnstile gagal dimuat'));
			document.head.appendChild(script);
		});

		return scriptReady;
	}

	/** A token is single-use, so every attempt that reaches the server needs a fresh one. */
	export function reset() {
		if (widgetId) turnstile()?.reset(widgetId);
	}

	onMount(() => {
		let dibatalkan = false;

		loadScript()
			.then(() => {
				if (dibatalkan) return;
				// Form field names must be plain identifiers; Turnstile's default
				// "cf-turnstile-response" contains dashes and SvelteKit rejects it.
				widgetId = turnstile()?.render(container, {
					sitekey: siteKey,
					action,
					'response-field-name': 'turnstileToken'
				});
			})
			.catch(() => {
				// The form still renders; submitting without a token is rejected server-side.
			});

		return () => {
			dibatalkan = true;
			if (widgetId) turnstile()?.remove(widgetId);
		};
	});
</script>

<div bind:this={container}></div>
