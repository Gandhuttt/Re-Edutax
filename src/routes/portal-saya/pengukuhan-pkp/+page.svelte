<script lang="ts">
	import Card from '$lib/components/Card.svelte';
</script>

<svelte:head><title>Pengukuhan PKP</title></svelte:head>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<h1 class="tw:text-2xl!">Pengukuhan Pengusaha Kena Pajak</h1>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:flex tw:items-center tw:justify-center tw:p-6">
				<p class="tw:m-0 tw:text-center">
					Menu ini hanya tersedia untuk Wajib Pajak yang belum terdaftar sebagai PKP.
				</p>
			</div>
		{/snippet}
	</Card>
</div>
