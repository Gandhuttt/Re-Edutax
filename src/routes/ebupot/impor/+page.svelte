<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { importBp } from './importBp.remote';
	import {
		ActionButton,
		Breadcrumbs,
		DocumentWorkspace,
		FileUploadField,
		FormActions,
		FormSection,
		InlineAlert,
		PageLayout,
		ServiceWorkspace,
		Stack
	} from '$lib/re-ui-components';

	const kind = $derived(page.url.searchParams.get('jenis') === 'bp26' ? 'bp26' : 'bp21');
	const label = $derived(kind.toUpperCase());
	const templateUrl = $derived(`https://pajak.go.id/sites/default/files/2024-12/${kind}.zip`);
	const accountName = $derived(String(page.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(page.data.user?.username ?? ''));
	const issues = $derived(importBp.fields.allIssues() ?? []);
	let sidebarOpen = $state(false);
</script>

<svelte:head><title>Impor XML {label}</title></svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label, href: `/ebupot/${kind}` }, { label: 'Impor XML' }]}
		/>
		<ServiceWorkspace
			bind:sidebarOpen
			identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }}
			groups={[
				{
					label: 'e-Bupot',
					links: [
						{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' },
						{ label: 'BPPU', href: '/ebupot/bpu' },
						{ label: 'BP21', href: '/ebupot/bp21', active: kind === 'bp21' },
						{ label: 'BP26', href: '/ebupot/bp26', active: kind === 'bp26' },
						{ label: 'BPA1', href: '/ebupot/bpa1' },
						{ label: 'BPA2', href: '/ebupot/bpa2' },
						{ label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
					]
				}
			]}
		>
			<DocumentWorkspace>
				<form {...importBp} enctype="multipart/form-data">
					<input type="hidden" name="jenis" value={kind} />
					<FormSection
						number="01"
						title={`Impor ${label} dari XML`}
						description={`Gunakan template XML resmi DJP. Setiap baris menjadi konsep ${label} baru berstatus Disimpan Tidak Valid; periksa lalu Submit dari daftar.`}
					>
						{#snippet actions()}
							<ActionButton type="button" tone="quiet" onclick={() => window.open(templateUrl, '_blank', 'noopener')}>Unduh Template</ActionButton>
						{/snippet}
						<Stack gap="14px">
							<FileUploadField
								label={`Berkas XML ${label}`}
								name="file"
								accept=".xml,application/xml,text/xml"
								required
								hint={kind === 'bp21'
									? 'Maksimum 100 baris dan 1 MiB. TIN pemotong harus sama dengan akun ini. Nama penerima diambil dari wajib pajak terdaftar.'
									: 'Maksimum 100 baris dan 1 MiB. TIN pemotong harus sama dengan akun ini.'}
							/>
							{#if issues.length > 0}
								<InlineAlert tone="error" title="Impor dibatalkan" message={issues.map((issue) => issue.message).join(' ')} />
							{/if}
							{#if importBp.result}
								<InlineAlert tone="success" title="Impor berhasil" message={importBp.result.message} />
							{/if}
						</Stack>
					</FormSection>
					<FormActions>
						<ActionButton type="button" tone="quiet" onclick={() => goto(`/ebupot/${kind}`)}>Kembali</ActionButton>
						<ActionButton type="submit" pending={importBp.pending > 0} pendingLabel="Mengimpor...">Impor</ActionButton>
					</FormActions>
				</form>
			</DocumentWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
