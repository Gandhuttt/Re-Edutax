<script lang="ts">
	import { goto } from '$app/navigation';

	import { getAuthClient } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let pending = $state(false);
	let errorMessage = $state('');

	async function handleSubmit() {
		pending = true;
		errorMessage = '';

		try {
			const result = await getAuthClient().signIn.email({
				email,
				password,
			});

			if (result.error) {
				errorMessage = result.error.message ?? 'Sign in failed';
				return;
			}

			await goto('/dashboard', { invalidateAll: true });
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Sign in failed';
		} finally {
			pending = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<div class="shell">
	<section class="card">
		<a class="back" href="/">Back</a>
		<h1>Sign in</h1>
		<p class="text">Masuk dengan email dan password.</p>

		<div class="form">
			<label>
				<span>Email</span>
				<input bind:value={email} type="email" placeholder="jane@example.com" />
			</label>
			<label>
				<span>Password</span>
				<input bind:value={password} type="password" placeholder="••••••••" />
			</label>

			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}

			<button onclick={handleSubmit} disabled={pending}>
				{pending ? 'Signing in...' : 'Sign in'}
			</button>
		</div>

		<p class="foot">Belum punya akun? <a href="/sign-up">Create account</a></p>
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
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 24px;
	}

	.card {
		width: min(100%, 420px);
		padding: 28px;
		border: 1px solid #e4e4e7;
		border-radius: 16px;
		background: #ffffff;
	}

	.back,
	.foot a {
		color: #18181b;
	}

	.back {
		text-decoration: none;
		font-size: 0.95rem;
	}

	h1 {
		margin: 20px 0 0;
		font-size: 2rem;
	}

	.text {
		margin: 8px 0 0;
		color: #52525b;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-top: 24px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.92rem;
	}

	input {
		padding: 11px 12px;
		border: 1px solid #d4d4d8;
		border-radius: 10px;
		background: #ffffff;
		font: inherit;
		color: inherit;
	}

	button {
		padding: 11px 14px;
		border: 0;
		border-radius: 10px;
		background: #18181b;
		color: #fafafa;
		font: inherit;
		font-weight: 600;
	}

	button:disabled {
		opacity: 0.7;
	}

	.error {
		margin: 0;
		color: #b91c1c;
		font-size: 0.92rem;
	}

	.foot {
		margin: 18px 0 0;
		color: #52525b;
	}
</style>
