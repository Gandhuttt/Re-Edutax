<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { KeyValueItem } from "./KeyValueGrid.svelte";

	export type CredentialCardProps = {
		label: string;
		title: string;
		statement: string;
		details: KeyValueItem[];
	} & Omit<HTMLAttributes<HTMLElement>, "title" | "children">;
</script>

<script lang="ts">
	import KeyValueGrid from "./KeyValueGrid.svelte";

	let {
		label,
		title,
		statement,
		details,
		class: className,
		...props
	}: CredentialCardProps = $props();
</script>

<article {...props} class="credential-card {className ?? ""}">
	<header>
		<span class="seal" aria-hidden="true">✓</span>
		<div>
			<p class="label">{label}</p>
			<h3>{title}</h3>
		</div>
	</header>
	<p class="statement">{statement}</p>
	<div class="details">
		<KeyValueGrid columns={1} surface="paper" items={details} />
	</div>
</article>

<style>
	.credential-card {
		display: flex;
		height: 100%;
		flex-direction: column;
		padding: 30px;
		border: 1px solid var(--ui-surface-line);
		border-top: 4px solid var(--ui-navy);
		border-radius: 2px;
		background: var(--ui-surface-card);
	}
	header {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		align-items: center;
		gap: 16px;
	}
	.seal {
		display: grid;
		width: 44px;
		height: 44px;
		place-items: center;
		border: 1px solid color-mix(in srgb, var(--ui-yellow-deep) 45%, transparent);
		border-radius: 50%;
		background: var(--ui-yellow-soft);
		color: var(--ui-navy);
		font-size: 18px;
		font-weight: 900;
	}
	.label {
		margin: 0 0 4px;
		color: var(--ui-surface-accent);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	h3 {
		margin: 0;
		color: var(--ui-surface-heading);
		font-family: var(--ui-font-display);
		font-size: 24px;
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	.statement {
		margin: 20px 0 0;
		color: var(--ui-surface-text);
		font-size: 15px;
		line-height: 1.65;
	}
	.details {
		margin-top: auto;
		padding-top: 24px;
	}
	@media (max-width: 560px) {
		.credential-card {
			padding: 22px;
		}
		h3 {
			font-size: 21px;
		}
	}
</style>
