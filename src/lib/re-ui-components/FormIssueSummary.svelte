<script module lang="ts">
	import type { RemoteFormIssue } from "@sveltejs/kit";

	export type FormIssueSource = {
		allIssues(): RemoteFormIssue[] | undefined;
	};

	export type FormIssueSummaryProps = {
		source?: FormIssueSource;
		issues?: readonly RemoteFormIssue[];
		title?: string;
		empty?: boolean;
	};
</script>

<script lang="ts">
	let {
		source,
		issues,
		title = "Periksa kembali isian berikut",
		empty = false,
	}: FormIssueSummaryProps = $props();

	const resolvedIssues = $derived(issues ?? source?.allIssues() ?? []);
</script>

{#if resolvedIssues.length > 0 || empty}
	<div class="issue-summary" role="alert" aria-live="assertive">
		<span class="icon" aria-hidden="true">!</span>
		<div>
			<strong>{title}</strong>
			{#if resolvedIssues.length > 0}
				<ul>
					{#each resolvedIssues as issue}
						<li>{issue.message}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}

<style>
	.issue-summary {
		min-height: 48px;
		padding: 10px 12px;
		display: grid;
		grid-template-columns: 22px minmax(0, 1fr);
		align-items: start;
		gap: 9px;
		border: 1px solid var(--ui-line);
		border-left: 4px solid var(--ui-danger);
		border-radius: 2px;
		background: var(--ui-danger-surface);
		color: var(--ui-ink);
		font-size: 12px;
		line-height: 1.45;
	}

	.icon {
		width: 20px;
		height: 20px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--ui-danger);
		color: white;
		font-weight: 900;
	}

	strong {
		color: var(--ui-danger);
	}

	ul {
		margin: 4px 0 0;
		padding-left: 18px;
	}

	li + li {
		margin-top: 2px;
	}
</style>
