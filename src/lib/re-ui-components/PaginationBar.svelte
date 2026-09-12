<script module lang="ts">
	export type PaginationBarProps = {
		page?: number;
		pageSize?: number;
		totalItems: number;
		pageSizeOptions?: readonly number[];
		itemLabel?: string;
		ariaLabel?: string;
	};
</script>

<script lang="ts">
	import SelectField from "./SelectField.svelte";

	let {
		page = $bindable(1),
		pageSize = $bindable(10),
		totalItems,
		pageSizeOptions = [10, 25, 50],
		itemLabel = "data",
		ariaLabel = "Navigasi halaman",
	}: PaginationBarProps = $props();

	const safePageSize = $derived(Math.max(1, Number(pageSize) || 10));
	const pageCount = $derived(Math.max(1, Math.ceil(totalItems / safePageSize)));
	const currentPage = $derived(Math.min(Math.max(1, page), pageCount));
	const firstItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * safePageSize + 1);
	const lastItem = $derived(Math.min(currentPage * safePageSize, totalItems));

	$effect(() => {
		if (page !== currentPage) page = currentPage;
	});

	function changePage(nextPage: number) {
		page = Math.min(Math.max(1, nextPage), pageCount);
	}

	function changePageSize(value: string | number) {
		pageSize = Number(value);
		page = 1;
	}
</script>

<footer class="pagination-bar">
	<p aria-live="polite">
		Menampilkan <strong>{firstItem}–{lastItem}</strong> dari
		<strong>{totalItems}</strong> {itemLabel}
	</p>

	<nav aria-label={ariaLabel}>
		<button
			type="button"
			disabled={currentPage <= 1}
			aria-label="Halaman sebelumnya"
			onclick={() => changePage(currentPage - 1)}
		>‹</button>
		<span aria-current="page">{currentPage}</span>
		<small>dari {pageCount}</small>
		<button
			type="button"
			disabled={currentPage >= pageCount}
			aria-label="Halaman berikutnya"
			onclick={() => changePage(currentPage + 1)}
		>›</button>
	</nav>

	<div class="page-size">
		<SelectField
			label="Baris per halaman"
			layout="inline"
			value={pageSize}
			options={pageSizeOptions.map((size) => ({ value: size, label: String(size) }))}
			onchange={(value) => changePageSize(value)}
		/>
	</div>
</footer>

<style>
	.pagination-bar {
		min-height: 58px;
		padding: 10px 16px;
		display: grid;
		grid-template-columns: minmax(180px, 1fr) auto minmax(180px, 1fr);
		align-items: center;
		gap: 18px;
		border-top: 1px solid var(--ui-line-strong);
		background: var(--ui-paper-deep);
	}

	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 11px;
	}

	p strong {
		color: var(--ui-ink);
		font-variant-numeric: tabular-nums;
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
	}

	nav button,
	nav span {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		color: var(--ui-navy);
		font: inherit;
		font-weight: 800;
	}

	nav button {
		cursor: pointer;
		transition:
			background 140ms ease,
			transform 140ms ease;
	}

	nav button:hover:not(:disabled) {
		background: var(--ui-yellow-soft);
		transform: translateY(-1px);
	}

	nav button:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}

	nav button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	nav span {
		border-color: var(--ui-navy);
		background: var(--ui-navy);
		color: white;
	}

	nav small {
		color: var(--ui-muted);
		font-size: 10px;
	}

	.page-size {
		width: 210px;
		justify-self: end;
	}

	@media (max-width: 760px) {
		.pagination-bar {
			grid-template-columns: 1fr auto;
		}

		p {
			grid-column: 1/-1;
		}
	}

	@media (max-width: 480px) {
		.pagination-bar {
			grid-template-columns: 1fr;
		}

		nav {
			justify-content: flex-start;
		}

		.page-size {
			width: 100%;
			justify-self: stretch;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		nav button {
			transition: none;
		}
		nav button:hover:not(:disabled) {
			transform: none;
		}
	}
</style>
