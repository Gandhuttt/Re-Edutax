<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import { getContext } from 'svelte';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { updateFaktur } from '../updateFaktur.remote';

	let {
		canEdit,
		npwpPembeli = $bindable('')
	}: {
		canEdit: boolean;
		npwpPembeli: string;
	} = $props();

	const formFields = updateFaktur.fields.informasiPembeli;
	let wpPembeli = $state(await getWajibPajak({ npwp: npwpPembeli }));
</script>

<Card>
	{#snippet head()}
		<span class="tw:text-xl">Informasi Pembeli</span>
	{/snippet}
	{#snippet body()}
		<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
			<Label>
				<span>NPWP Pembeli</span>
				<div class="tw:flex tw:flex-row tw:bg-amber-50">
					<Input
						class={canEdit ? 'tw:rounded-e-none! tw:border-e-0' : ''}
						name={formFields.npwpPembeli.as('text').name}
						type="text"
						id={getContext('id')}
						bind:value={npwpPembeli}
						disabled={!canEdit}
					/>
					{#if canEdit}
						<Button
							color="#FFD230"
							class="tw:rounded-s-none! tw:w-30"
							type="button"
							onclick={async () => (wpPembeli = await getWajibPajak({ npwp: npwpPembeli }))}
						>
							Cari NPWP
						</Button>
					{/if}
				</div>
			</Label>
			<Label class="tw:flex! tw:items-center tw:gap-2">
				<Input type="radio" checked />
				<span>NPWP</span>
			</Label>
			<Label>
				<span>Negara</span>
				<Input type="text" id={getContext('id')} value={wpPembeli?.negara} disabled />
			</Label>
			<Label>
				<span>Nomor Dokumen</span>
				<Input type="text" id={getContext('id')} disabled />
			</Label>
			<Label>
				<span>Nama</span>
				<Input type="text" id={getContext('id')} value={wpPembeli?.nama} disabled />
			</Label>
			<Label>
				<span>Email</span>
				<Input type="text" id={getContext('id')} value={wpPembeli?.email} disabled />
			</Label>
		</div>
	{/snippet}
</Card>
