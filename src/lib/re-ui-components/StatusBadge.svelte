<script module lang="ts">
	export type StatusBadgeTone = "neutral" | "attention" | "success" | "error";

	export type StatusBadgeProps = {
		label: string;
		tone?: StatusBadgeTone;
		ariaLabel?: string;
	};
</script>

<script lang="ts">
	let {
		label,
		tone = "neutral",
		ariaLabel,
	}: StatusBadgeProps = $props();
</script>

<span
	class="badge"
	class:attention={tone === "attention"}
	class:success={tone === "success"}
	class:error={tone === "error"}
	aria-label={ariaLabel}
>
	<span class="dot" aria-hidden="true"></span>{label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		width: max-content;
		padding: 5px 8px;
		border: 1px solid var(--ui-line);
		border-radius: 999px;
		background: var(--ui-paper-deep);
		color: var(--ui-muted);
		font-size: 11px;
		font-weight: 750;
		letter-spacing: 0.03em;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #718096;
	}
	.attention {
		background: var(--ui-yellow-soft);
		border-color: #dfbd52;
		color: #76550a;
	}
	.attention .dot {
		background: var(--ui-yellow-deep);
		animation: attention-pulse 2.4s ease-out infinite;
	}
	.success {
		background: var(--ui-success-surface, #edf4eb);
		border-color: #b8ceb3;
		color: var(--ui-success, #345c36);
	}
	.success .dot {
		background: #4e7d50;
	}
	.error {
		background: var(--ui-danger-surface, #fff0ee);
		border-color: #dfb4b0;
		color: var(--ui-danger, #8f2823);
	}
	.error .dot {
		background: var(--ui-danger, #8f2823);
	}
	@keyframes attention-pulse {
		0%,
		45%,
		100% {
			box-shadow: 0 0 0 0 rgba(189, 141, 19, 0);
		}
		12% {
			box-shadow: 0 0 0 4px rgba(189, 141, 19, 0.18);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.attention .dot {
			animation: none;
		}
	}
</style>
