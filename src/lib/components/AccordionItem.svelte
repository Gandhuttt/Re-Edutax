<script lang="ts">
	import type { Snippet } from "svelte";

    const uid = $props.id();
    const { item, target, children}: {item: string, target?: string, children: Snippet} = $props();
</script>

<div class="accordion-item">
    <div class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#{ uid }-accordion" aria-expanded="true" aria-controls="{ uid }-accordion">{ item }</button>
    </div>
    <div class="accordion-collapse collapse show" id="{ uid }-accordion" data-bs-parent="{ target }">
        <div class="{["Header", "X. PERNYATAAN"].includes(item)?"accordion-body":undefined}">{@render children()}</div>
    </div>
</div>
