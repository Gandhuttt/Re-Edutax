<script lang="ts">
	interface Option {
		value: string;
		label: string;
		group?: string;
	}

	let {
		value = $bindable([]),
		options,
		placeholder = 'Pilih...',
		id,
		disabled = false
	}: {
		value: string[];
		options: Option[];
		placeholder?: string;
		id?: string;
		disabled?: boolean;
	} = $props();

	let open = $state(false);
	let root = $state<HTMLDivElement>();

	function toggleOption(optionValue: string) {
		value = value.includes(optionValue)
			? value.filter((v) => v !== optionValue)
			: [...value, optionValue];
	}

	const groups = $derived.by(() => {
		const map = new Map<string, Option[]>();
		for (const option of options) {
			const key = option.group ?? '';
			map.set(key, [...(map.get(key) ?? []), option]);
		}
		return [...map.entries()];
	});

	const summary = $derived(
		value.length === 0
			? placeholder
			: options
					.filter((option) => value.includes(option.value))
					.map((option) => option.value)
					.join(', ')
	);

	function handleWindowClick(e: MouseEvent) {
		if (!open || !root) return;
		if (!root.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="checkable-select" bind:this={root}>
	<button
		type="button"
		{id}
		class="toggle"
		class:placeholder={value.length === 0}
		{disabled}
		onclick={() => (open = !open)}
	>
		<span class="toggle-label">{summary}</span>
		<span class="caret">▾</span>
	</button>
	{#if open}
		<div class="menu">
			{#each groups as [group, groupOptions] (group)}
				{#if group}<div class="group-label">{group}</div>{/if}
				{#each groupOptions as option (option.value)}
					<label class="option">
						<input
							type="checkbox"
							checked={value.includes(option.value)}
							onchange={() => toggleOption(option.value)}
						/>
						<span>{option.value} — {option.label}</span>
					</label>
				{/each}
			{/each}
		</div>
	{/if}
</div>

<style>
	.checkable-select {
		position: relative;
		flex: 1;
	}

	.toggle {
		width: 100%;
		height: 2.5rem;
		border: 1px solid var(--color-input-secondary);
		border-radius: 4px;
		background: white;
		padding: 0 0.6rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		text-align: left;
		font-size: 0.9rem;
	}

	.toggle:disabled {
		background: hsl(from var(--color-input-primary) h s calc(l - 10));
	}

	.toggle-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.toggle.placeholder .toggle-label {
		color: hsl(from var(--color-input-secondary) h s calc(l - 20));
	}

	.caret {
		flex-shrink: 0;
		font-size: 0.7rem;
	}

	.menu {
		position: absolute;
		z-index: 1080;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		max-height: 16rem;
		overflow-y: auto;
		background: white;
		border: 1px solid var(--color-input-secondary);
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 0.25rem 0;
	}

	.group-label {
		padding: 0.35rem 0.6rem 0.15rem;
		font-size: 0.7rem;
		font-weight: bold;
		text-transform: uppercase;
		color: hsl(from var(--color-input-secondary) h s calc(l - 30));
	}

	.option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.6rem;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.option:hover {
		background: hsl(from var(--color-input-primary) h s calc(l - 5));
	}
</style>
