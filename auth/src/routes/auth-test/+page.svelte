<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import { authClient } from '$lib/auth-client';

	type PageData = {
		session: {
			session: Record<string, unknown>;
			user: Record<string, unknown>;
		} | null;
	};

	let { data }: { data: PageData } = $props();

	const sessionStore = authClient.useSession();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let signInEmail = $state('');
	let signInPassword = $state('');
	let responseText = $state('');
	let pendingAction = $state<'signup' | 'signin' | 'signout' | 'session' | null>(null);

	function formatResult(label: string, payload: unknown) {
		responseText = `${label}\n${JSON.stringify(payload, null, 2)}`;
	}

	async function refreshPageData() {
		await invalidateAll();
	}

	async function handleSignUp() {
		pendingAction = 'signup';

		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password,
			});

			formatResult('Sign up response', result);
			await refreshPageData();
		} catch (error) {
			formatResult('Sign up error', error);
		} finally {
			pendingAction = null;
		}
	}

	async function handleSignIn() {
		pendingAction = 'signin';

		try {
			const result = await authClient.signIn.email({
				email: signInEmail,
				password: signInPassword,
			});

			formatResult('Sign in response', result);
			await refreshPageData();
		} catch (error) {
			formatResult('Sign in error', error);
		} finally {
			pendingAction = null;
		}
	}

	async function handleSignOut() {
		pendingAction = 'signout';

		try {
			const result = await authClient.signOut();

			formatResult('Sign out response', result);
			await refreshPageData();
		} catch (error) {
			formatResult('Sign out error', error);
		} finally {
			pendingAction = null;
		}
	}

	async function handleFetchSession() {
		pendingAction = 'session';

		try {
			const result = await authClient.getSession();

			formatResult('Get session response', result);
			await refreshPageData();
		} catch (error) {
			formatResult('Get session error', error);
		} finally {
			pendingAction = null;
		}
	}
</script>

<svelte:head>
	<title>Better Auth Test</title>
</svelte:head>

<div class="page-shell">
	<div class="hero">
		<p class="eyebrow">Better Auth Sandbox</p>
		<h1>Auth test bench</h1>
		<p class="lede">
			Halaman ini untuk mengecek sign up, sign in, sign out, dan session Better
			Auth end-to-end.
		</p>
	</div>

	<div class="grid">
		<section class="card">
			<h2>Current session</h2>
			<p class="muted">Data dari server load saat request ini dirender.</p>
			<pre>{JSON.stringify(data.session, null, 2)}</pre>
		</section>

		<section class="card">
			<h2>Live session store</h2>
			<p class="muted">Data dari `authClient.useSession()` di browser.</p>
			<pre>{JSON.stringify($sessionStore, null, 2)}</pre>
			<button class="secondary" onclick={handleFetchSession} disabled={pendingAction !== null}>
				{pendingAction === 'session' ? 'Loading...' : 'Refresh session'}
			</button>
		</section>

		<section class="card form-card">
			<h2>Sign up</h2>
			<label>
				<span>Name</span>
				<input bind:value={name} placeholder="Jane Doe" />
			</label>
			<label>
				<span>Email</span>
				<input bind:value={email} type="email" placeholder="jane@example.com" />
			</label>
			<label>
				<span>Password</span>
				<input bind:value={password} type="password" placeholder="••••••••" />
			</label>
			<button onclick={handleSignUp} disabled={pendingAction !== null}>
				{pendingAction === 'signup' ? 'Creating account...' : 'Create account'}
			</button>
		</section>

		<section class="card form-card">
			<h2>Sign in</h2>
			<label>
				<span>Email</span>
				<input bind:value={signInEmail} type="email" placeholder="jane@example.com" />
			</label>
			<label>
				<span>Password</span>
				<input bind:value={signInPassword} type="password" placeholder="••••••••" />
			</label>
			<div class="button-row">
				<button onclick={handleSignIn} disabled={pendingAction !== null}>
					{pendingAction === 'signin' ? 'Signing in...' : 'Sign in'}
				</button>
				<button class="secondary" onclick={handleSignOut} disabled={pendingAction !== null}>
					{pendingAction === 'signout' ? 'Signing out...' : 'Sign out'}
				</button>
			</div>
		</section>
	</div>

	<section class="card response-card">
		<h2>Latest response</h2>
		<pre>{responseText || 'No requests sent yet.'}</pre>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
		background:
			radial-gradient(circle at top left, rgba(255, 201, 107, 0.45), transparent 30%),
			radial-gradient(circle at top right, rgba(94, 214, 192, 0.32), transparent 28%),
			linear-gradient(180deg, #f7f2e8 0%, #efe6d7 100%);
		color: #1d1a16;
	}

	.page-shell {
		max-width: 1120px;
		margin: 0 auto;
		padding: 48px 20px 72px;
	}

	.hero {
		margin-bottom: 28px;
	}

	.eyebrow {
		margin: 0 0 8px;
		font-size: 0.82rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #905b16;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.4rem, 4vw, 4.4rem);
		line-height: 0.95;
		font-weight: 700;
	}

	.lede {
		max-width: 52rem;
		margin: 14px 0 0;
		font-size: 1.02rem;
		line-height: 1.6;
		color: #50473d;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
	}

	.card {
		padding: 20px;
		border: 1px solid rgba(71, 55, 34, 0.14);
		border-radius: 20px;
		background: rgba(255, 251, 245, 0.82);
		backdrop-filter: blur(10px);
		box-shadow: 0 18px 60px rgba(57, 39, 13, 0.08);
	}

	h2 {
		margin: 0 0 10px;
		font-size: 1.1rem;
	}

	.muted {
		margin: 0 0 14px;
		color: #64584c;
		font-size: 0.94rem;
	}

	.form-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.92rem;
		color: #3c342d;
	}

	input {
		padding: 12px 14px;
		border-radius: 14px;
		border: 1px solid rgba(61, 48, 32, 0.16);
		background: rgba(255, 255, 255, 0.9);
		font: inherit;
	}

	button {
		padding: 12px 16px;
		border: 0;
		border-radius: 999px;
		background: #1d1a16;
		color: #fff8f0;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}

	button.secondary {
		background: #e7dcc7;
		color: #2d261e;
	}

	.button-row {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.response-card {
		margin-top: 18px;
	}

	pre {
		margin: 0;
		padding: 16px;
		border-radius: 16px;
		background: #201c18;
		color: #f3eadc;
		font-size: 0.83rem;
		line-height: 1.5;
		overflow: auto;
	}

	@media (max-width: 780px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.page-shell {
			padding: 30px 14px 52px;
		}
	}
</style>
