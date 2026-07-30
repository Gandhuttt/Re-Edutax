<script lang="ts">
	import { page } from '$app/state';
	import { logout } from './auth/logout/logout.remote';

	let {
		authenticated = false,
		loggedUsername = 'guest'
	}: { authenticated?: boolean; loggedUsername?: string } = $props();

	const displayName = $derived(loggedUsername.replace(/'/g, ''));
</script>

<header>
	<nav>
		<ul class="nav-ul">
			<li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li class="dropdown" aria-current={page.url.pathname.startsWith('/faktur-pajak') ? 'page' : undefined}>
				<button class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Faktur</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" href="/faktur-pajak/masukan">Faktur Pajak Masukan</a></li>
					<li><a class="dropdown-item" href="/faktur-pajak/keluaran">Faktur Pajak Keluaran</a></li>
				</ul>
			</li>
			<li
				class="dropdown"
				aria-current={page.url.pathname.startsWith('/surat-pemberitahuan') ? 'page' : undefined}
			>
				<button class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">SPT</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" href="/surat-pemberitahuan/konsep">Konsep SPT</a></li>
					<li><a class="dropdown-item" href="/surat-pemberitahuan/pembayaran">SPT Menunggu Pembayaran</a></li>
					<li><a class="dropdown-item" href="/surat-pemberitahuan/laporan">SPT Dilaporkan</a></li>
				</ul>
			</li>
		</ul>
		<div class="corner">
			<span class="tw:w-auto tw:text-base tw:text-[.8em] tw:overflow-clip">{displayName}</span>
			<div class="tw:w-20">
				{#if authenticated}
				<form {...logout}>
					<button type="submit">Logout</button>
				</form>
				{:else}
				<a href="/auth/login">Login</a>
				{/if}
			</div>
		</div>
	</nav>
	<svg viewBox="0 0 2 3" aria-hidden="true">
		<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
	</svg>
</header>

<style>
	header {
		display: flex;
		justify-content: start;
		font-size: 16px;
		position: sticky;
		top: 0rem;
		z-index: 1;
	}

	.corner {
		display: flex;
		align-items: center;
		width: 15rem;
		font-weight: 700;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		justify-content: right;
		gap: 1rem;
	}

	nav {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0 5rem;
		padding-right: 1rem;
		--background: rgb(255, 255, 255);
		background: var(--background);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: rgb(255, 255, 255);
	}

	.nav-ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	form {
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav button,
	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		background: transparent;
		font-weight: 700;
		font-size: 0.8em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
		&:hover {
			color: var(--color-theme-1);
		}
	}

	nav button::after {
		content: '';
	}

	.dropdown-toggle,
	form button {
		border: 0;
	}

	.dropdown-menu {
		padding: 0;
	}

	.dropdown-item {
		padding: 1rem;
		border-bottom: 1px solid var(--color-bg-0);
	}
</style>
