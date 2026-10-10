<script lang="ts">
	import { ActionButton, FormField, ReUiRoot } from '$lib/re-ui-components';
	import { login } from './login.remote';
</script>

<svelte:head>
	<title>Masuk | Edutaxindo Praktika</title>
	<meta
		name="description"
		content="Masuk ke Edutaxindo Praktika untuk mengakses layanan administrasi perpajakan."
	/>
</svelte:head>

<ReUiRoot>
	<main class="login-shell">
		<section class="brand-panel" aria-labelledby="brand-heading">
			<div class="brand-lockup">
				<img class="brand-logo" src="/brand/wsd-mark-inverse.svg" alt="" width="57" height="46" />
				<span class="brand-name">
					<strong>Edutaxindo Praktika</strong>
					<small>Layanan Administrasi Perpajakan</small>
				</span>
			</div>

			<div class="brand-message">
				<p class="eyebrow">Portal layanan perpajakan</p>
				<h1 id="brand-heading">Satu ruang kerja untuk kewajiban pajak Anda.</h1>
				<p>
					Kelola faktur, bukti potong, dan pelaporan pajak melalui alur kerja yang tertata.
				</p>
			</div>

			<p class="environment-note">Lingkungan simulasi edukasi perpajakan</p>
		</section>

		<section class="form-panel" aria-labelledby="login-heading">
			<div class="login-card">
				<div class="mobile-brand" aria-hidden="true">
					<img class="brand-logo" src="/brand/wsd-mark.svg" alt="" width="45" height="36" />
					<strong>Edutaxindo Praktika</strong>
				</div>

				<header class="form-heading">
					<p class="eyebrow">Akses akun</p>
					<h2 id="login-heading">Masuk ke Edutaxindo Praktika</h2>
					<p>Gunakan NPWP dan password yang terdaftar pada akun Anda.</p>
				</header>

				<form class="login-form" {...login}>
					<FormField
						label="NPWP"
						field={login.fields.npwp}
						type="text"
						inputmode="numeric"
						autocomplete="username"
						placeholder="Masukkan 15 atau 16 digit NPWP"
						required
					/>

					<FormField
						label="Password"
						field={login.fields._password}
						type="password"
						autocomplete="current-password"
						placeholder="Masukkan password"
						required
					/>

					<div class="submit-action">
						<ActionButton
							type="submit"
							pending={login.pending > 0}
							pendingLabel="Memproses..."
						>
							Masuk
						</ActionButton>
					</div>
				</form>

				<p class="support-note">
					Pastikan NPWP ditulis tanpa tanda baca atau spasi.
				</p>
			</div>
		</section>
	</main>
</ReUiRoot>

<style>
	.login-shell {
		min-height: 100svh;
		display: grid;
		grid-template-columns: minmax(360px, 0.9fr) minmax(480px, 1.1fr);
		background: var(--ui-paper);
	}

	.brand-panel {
		position: relative;
		isolation: isolate;
		display: flex;
		min-height: 100svh;
		padding: clamp(32px, 5vw, 76px);
		flex-direction: column;
		overflow: hidden;
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent 45%),
			var(--ui-navy);
		color: white;
	}

	.brand-panel::before {
		position: absolute;
		z-index: -1;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
		background-size: 46px 46px;
		content: '';
		mask-image: linear-gradient(to bottom right, transparent 8%, black 75%);
	}

	.brand-panel::after {
		position: absolute;
		z-index: -1;
		right: clamp(-150px, -9vw, -70px);
		bottom: clamp(-170px, -10vw, -90px);
		width: clamp(330px, 35vw, 560px);
		aspect-ratio: 1;
		border: 1px solid rgba(244, 197, 66, 0.35);
		border-radius: 50%;
		box-shadow:
			0 0 0 52px rgba(244, 197, 66, 0.06),
			0 0 0 104px rgba(244, 197, 66, 0.035);
		content: '';
	}

	.brand-lockup,
	.mobile-brand {
		display: flex;
		align-items: center;
		gap: 13px;
	}

	.brand-logo {
		display: block;
		flex: 0 0 auto;
		width: auto;
		height: 46px;
	}

	.mobile-brand .brand-logo {
		height: 36px;
	}

	.brand-name {
		display: grid;
		gap: 1px;
	}

	.brand-name strong {
		font-family: var(--ui-font-display);
		font-size: 24px;
		line-height: 1.05;
	}

	.brand-name small {
		color: rgba(255, 255, 255, 0.72);
		font-size: 12px;
		letter-spacing: 0.04em;
	}

	.brand-message {
		width: min(590px, 100%);
		margin: auto 0;
		padding: 88px 0;
	}

	.eyebrow {
		margin: 0 0 12px;
		color: var(--ui-yellow);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.brand-message h1 {
		max-width: 560px;
		margin: 0;
		font-family: var(--ui-font-display);
		font-size: clamp(38px, 4.2vw, 64px);
		font-weight: 700;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.brand-message > p:last-child {
		max-width: 520px;
		margin: 24px 0 0;
		color: rgba(255, 255, 255, 0.76);
		font-size: clamp(16px, 1.25vw, 19px);
		line-height: 1.7;
	}

	.environment-note {
		margin: 0;
		color: rgba(255, 255, 255, 0.62);
		font-size: 12px;
		letter-spacing: 0.05em;
	}

	.form-panel {
		display: grid;
		min-height: 100svh;
		padding: clamp(28px, 6vw, 96px);
		place-items: center;
		background:
			radial-gradient(circle at 85% 12%, rgba(244, 197, 66, 0.13), transparent 24%),
			var(--ui-paper);
	}

	.login-card {
		width: min(430px, 100%);
		padding: clamp(32px, 4vw, 52px);
		border: 1px solid var(--ui-line);
		border-top: 5px solid var(--ui-yellow);
		border-radius: 3px;
		background: #fffefa;
		box-shadow: 0 24px 60px rgba(24, 49, 79, 0.13);
	}

	.mobile-brand {
		display: none;
		margin-bottom: 34px;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 23px;
	}

	.form-heading {
		margin-bottom: 30px;
	}

	.form-heading .eyebrow {
		margin-bottom: 8px;
		color: var(--ui-yellow-deep);
	}

	.form-heading h2 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: clamp(30px, 3vw, 40px);
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.15;
	}

	.form-heading > p:last-child {
		margin: 12px 0 0;
		color: var(--ui-muted);
		font-size: 15px;
		line-height: 1.6;
	}

	.login-form {
		display: grid;
		gap: 20px;
	}

	.submit-action {
		margin-top: 4px;
	}

	.submit-action :global(button) {
		width: 100%;
		min-height: 44px;
	}

	.support-note {
		margin: 22px 0 0;
		padding-top: 18px;
		border-top: 1px solid var(--ui-line);
		color: var(--ui-muted);
		font-size: 12px;
		line-height: 1.5;
	}

	@media (max-width: 880px) {
		.login-shell {
			grid-template-columns: 1fr;
		}

		.brand-panel {
			display: none;
		}

		.form-panel {
			padding: 28px 20px;
		}

		.mobile-brand {
			display: flex;
		}
	}

	@media (max-width: 480px) {
		.form-panel {
			align-items: start;
			padding: 0;
			background: #fffefa;
		}

		.login-card {
			min-height: 100svh;
			padding: 32px 24px;
			border: 0;
			border-top: 5px solid var(--ui-yellow);
			box-shadow: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.brand-panel::after {
			box-shadow: none;
		}
	}
</style>
