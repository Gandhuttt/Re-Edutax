<svelte:head>
	<title>Auth Home</title>
</svelte:head>

<div class="shell">
	<section class="card">
		<p class="kicker">Better Auth</p>
		<h1>Simple auth flow.</h1>
		<p class="text">Masuk, daftar, lalu lanjut ke dashboard yang sudah diproteksi.</p>

		<nav class="actions">
			<a class="primary" href="/sign-in">Sign in</a>
			<a href="/sign-up">Create account</a>
			<a href="/auth-test">Sandbox</a>
		</nav>
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
		width: min(100%, 560px);
		padding: 32px;
		border: 1px solid #e4e4e7;
		border-radius: 16px;
		background: #ffffff;
	}

	.kicker {
		margin: 0 0 12px;
		font-size: 0.82rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #71717a;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 3rem);
		line-height: 1.05;
	}

	.text {
		margin: 12px 0 0;
		max-width: 32rem;
		line-height: 1.6;
		color: #52525b;
	}

	.actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 24px;
	}

	a {
		padding: 10px 14px;
		border: 1px solid #e4e4e7;
		border-radius: 10px;
		color: #18181b;
		text-decoration: none;
		font-weight: 500;
	}

	.primary {
		background: #18181b;
		border-color: #18181b;
		color: #fafafa;
	}
</style>
