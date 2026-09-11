<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLFormAttributes } from "svelte/elements";
	import type { ReUiRemoteForm } from "./remote-form";

	export type DocumentFormSection = {
		number: string;
		title: string;
	};

	export type DocumentFormTotal = {
		label: string;
		value: string;
		emphasis?: boolean;
	};

	export type DocumentFormProps = {
		remote?: ReUiRemoteForm;
		eyebrow?: string;
		title: string;
		statusLabel?: string;
		status?: string;
		primarySection: DocumentFormSection;
		secondarySection: DocumentFormSection;
		ledgerSection: DocumentFormSection;
		primary: Snippet;
		secondary: Snippet;
		ledger: Snippet;
		ledgerActions?: Snippet;
		totals?: readonly DocumentFormTotal[];
		footer?: Snippet<[boolean]>;
	} & Omit<HTMLFormAttributes, "title" | "children" | "action" | "method">;
</script>

<script lang="ts">
	let {
		remote,
		eyebrow = "",
		title,
		statusLabel = "Status dokumen",
		status = "",
		primarySection,
		secondarySection,
		ledgerSection,
		primary,
		secondary,
		ledger,
		ledgerActions,
		totals = [],
		footer,
		class: className,
		...props
	}: DocumentFormProps = $props();

	const remoteAttributes = $derived(remote ?? {});
	const pending = $derived(Boolean(remote?.pending));
</script>

<form {...remoteAttributes} {...props} class="document-form {className ?? ""}">
	<header class="form-heading">
		<div>
			{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
			<h3>{title}</h3>
		</div>
		{#if status}
			<div class="document-state">
				<span>{statusLabel}</span>
				<strong>{status}</strong>
			</div>
		{/if}
	</header>

	<div class="paired-sections">
		<section class="form-card">
			<header class="section-heading">
				<span>{primarySection.number}</span>
				<h4>{primarySection.title}</h4>
			</header>
			{@render primary()}
		</section>
		<section class="form-card">
			<header class="section-heading">
				<span>{secondarySection.number}</span>
				<h4>{secondarySection.title}</h4>
			</header>
			{@render secondary()}
		</section>
	</div>

	<section class="ledger-section">
		<header class="ledger-heading">
			<div>
				<span>{ledgerSection.number}</span>
				<h4>{ledgerSection.title}</h4>
			</div>
			{#if ledgerActions}<div class="ledger-actions">{@render ledgerActions()}</div>{/if}
		</header>
		{@render ledger()}
		{#if totals.length > 0}
			<dl class="totals">
				{#each totals as item}
					<div class:emphasis={item.emphasis}>
						<dt>{item.label}</dt>
						<dd>{item.value}</dd>
					</div>
				{/each}
			</dl>
		{/if}
	</section>

	{#if footer}{@render footer(pending)}{/if}
</form>

<style>
	.document-form {
		min-width: 0;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
	}

	.form-heading {
		padding: 18px 20px;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		border-bottom: 1px solid var(--ui-line-strong);
		background: #e1e4e2;
	}

	.eyebrow {
		color: #87640c;
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	h3 {
		margin: 3px 0 2px;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 20px;
	}

	.document-state {
		flex: 0 0 auto;
		padding-left: 16px;
		border-left: 3px solid var(--ui-yellow);
	}

	.document-state span,
	.document-state strong {
		display: block;
	}

	.document-state span {
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.document-state strong {
		margin-top: 2px;
		color: var(--ui-navy);
		font-size: 12px;
	}

	.paired-sections {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
	}

	.form-card {
		min-width: 0;
		padding: 20px;
	}

	.form-card + .form-card {
		border-left: 1px solid var(--ui-line-strong);
	}

	.section-heading,
	.ledger-heading > div {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.section-heading {
		margin-bottom: 17px;
		padding-bottom: 11px;
		border-bottom: 1px solid var(--ui-line);
	}

	.section-heading > span,
	.ledger-heading > div > span {
		color: var(--ui-yellow-deep);
		font: 800 10px var(--ui-font-mono);
	}

	h4 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 16px;
	}

	.ledger-section {
		border-top: 1px solid var(--ui-line-strong);
	}

	.ledger-heading {
		padding: 15px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		background: #efede5;
	}

	.ledger-actions {
		flex: 0 0 auto;
	}

	.totals {
		display: flex;
		justify-content: flex-end;
		margin: 0;
		border-top: 1px solid var(--ui-line-strong);
		background: #efede5;
	}

	.totals div {
		min-width: 160px;
		padding: 10px 14px;
		border-left: 1px solid var(--ui-line);
	}

	.totals dt,
	.totals dd {
		margin: 0;
		text-align: right;
	}

	.totals dt {
		color: var(--ui-muted);
		font-size: 8px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.totals dd {
		margin-top: 2px;
		color: var(--ui-navy);
		font-size: 11px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.totals .emphasis {
		border-left: 3px solid var(--ui-yellow-deep);
		background: var(--ui-yellow-soft);
	}

	@media (max-width: 900px) {
		.paired-sections {
			grid-template-columns: 1fr;
		}

		.form-card + .form-card {
			border-top: 1px solid var(--ui-line-strong);
			border-left: 0;
		}
	}

	@media (max-width: 650px) {
		.form-heading,
		.ledger-heading,
		.totals {
			overflow-x: auto;
			justify-content: flex-start;
		}
	}
</style>
