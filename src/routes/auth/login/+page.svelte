<script lang="ts">
	import { login } from './login.remote';
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="tw:flex tw:min-h-[50vh] tw:justify-center tw:items-center">
	<form class="tw:w-[25rem] tw:max-sm:w-[40rem]" {...login}>
		<h1>Login</h1>
		<div>
			<input
				{...login.fields.npwp.as('text')}
				inputmode="numeric"
				autocomplete="username"
				class="form-control tw:max-sm:h-[5rem]"
				placeholder="NPWP"
				required
			/>
		</div>
		<div>
			<input
				{...login.fields._password.as('password')}
				autocomplete="current-password"
				class="form-control tw:max-sm:h-[5rem]"
				placeholder="Password"
				required
			/>
		</div>

		{#if login.fields.allIssues()?.[0]}
			<p class="error">{login.fields.allIssues()?.[0]?.message}</p>
		{/if}

		<div>
			<button class="btn btn-success tw:w-full tw:max-sm:h-[5rem]" disabled={login.pending > 0}>
				{login.pending > 0 ? 'Masuk...' : 'Login'}
			</button>
		</div>
	</form>
</div>

<style>
	div {
		margin: 1rem 0;
	}

	h1 {
		margin: 0 0 2rem;
		color: var(--color-text);
		font-size: 3rem;
		font-weight: 700;
		text-align: center;
	}

	input {
		width: 100%;
	}

	input,
	button {
		font-size: 16px;
	}

	button {
		background-color: var(--color-theme-2);
		border: 0;
	}

	button:hover {
		background-color: var(--color-theme-1);
	}

	.error {
		margin: 0 0 1rem;
		color: #b42318;
		font-size: 0.95rem;
	}
</style>
