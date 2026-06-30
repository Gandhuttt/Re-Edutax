<script lang="ts">
	import { goto } from '$app/navigation';

	import { getAuthClient } from '$lib/auth-client';

	type PageData = {
		session: {
			session: Record<string, unknown>;
			user: Record<string, unknown>;
		};
	};

	let { data }: { data: PageData } = $props();
	let pending = $state(false);

	async function handleSignOut() {
		pending = true;

		try {
			await getAuthClient().signOut();
			await goto('/sign-in', { invalidateAll: true });
		} finally {
			pending = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="shell">
	<section class="card">
		<div class="header">
			<div>
				<p class="kicker">Protected</p>
				<h1>Dashboard</h1>
				<p class="text">Session aktif dan route sudah terjaga.</p>
			</div>

			<div class="actions">
				<a href="/auth-test">Sandbox</a>
				<button onclick={handleSignOut} disabled={pending}>
					{pending ? 'Signing out...' : 'Sign out'}
				</button>
			</div>
		</div>

		<pre>{JSON.stringify(data.session, null, 2)}</pre>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
		background: #f5f5f4;
		color: #18181b;
	}

	.shell {
		max-width: 860px;
		margin: 0 auto;
		padding: 24px;
	}

	.card {
		border: 1px solid #e4e4e7;
		border-radius: 16px;
		background: #ffffff;
		padding: 24px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 20px;
	}

	.kicker {
		margin: 0 0 8px;
		font-size: 0.82rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #71717a;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
	}

	.text {
		margin: 8px 0 0;
		color: #52525b;
	}

	.actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	a,
	button {
		padding: 10px 14px;
		border: 1px solid #e4e4e7;
		border-radius: 10px;
		text-decoration: none;
		font: inherit;
		font-weight: 500;
	}

	a {
		color: #18181b;
	}

	button {
		background: #18181b;
		border-color: #18181b;
		color: #fafafa;
	}

	pre {
		margin: 0;
		padding: 16px;
		border-radius: 12px;
		background: #fafafa;
		border: 1px solid #e4e4e7;
		color: #27272a;
		font-size: 0.85rem;
		line-height: 1.5;
		overflow: auto;
	}

	@media (max-width: 720px) {
		.header {
			flex-direction: column;
		}
	}
</style>
