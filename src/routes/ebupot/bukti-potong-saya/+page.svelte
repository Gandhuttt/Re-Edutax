<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import {
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		PageLayout,
		PaginationBar,
		ServiceWorkspace,
		Stack
	} from '$lib/re-ui-components';
	import { listBuktiPotongSaya } from './listBuktiPotongSaya.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
	const issuedRecords = await listBuktiPotongSaya();
	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(50);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const pagedRecords = $derived(
		issuedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);
</script>

<svelte:head><title>Bukti Potong Saya</title></svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/' },
				{ label: 'e-Bupot' },
				{ label: 'Bukti Potong Saya' }
			]}
		/>

		<ServiceWorkspace
			bind:sidebarOpen
			identity={{
				eyebrow: 'Wajib Pajak',
				name: accountName,
				identifier: accountNpwp,
				mark: 'EB'
			}}
			groups={[
				{
					label: 'e-Bupot',
					links: [
						{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya', active: true },
						{ label: 'BPPU', href: '/ebupot/bpu' },
						{ label: 'BP21', href: '/ebupot/bp21' },
						{ label: 'BP26', href: '/ebupot/bp26' },
						{ label: 'BPA1', href: '/ebupot/bpa1' },
						{ label: 'BPA2', href: '/ebupot/bpa2' },
						{ label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
					]
				}
			]}
		>
			<DataWorkspace title="Bukti Potong Saya">
				<DataTableViewport
					label="Daftar bukti potong saya"
					minWidth="1260px"
					framed={false}
					headerTone="yellow"
					density="compact"
				>
					<table>
						<thead>
							<tr>
								<th scope="col" style="width: 110px">Jenis</th>
								<th scope="col" style="width: 240px">Nomor Pemotongan</th>
								<th scope="col" style="width: 150px">Masa Pajak</th>
								<th scope="col" style="width: 180px">NPWP Pemotong</th>
								<th scope="col" style="width: 220px">Nama Pemotong</th>
								<th scope="col" style="width: 250px">Objek Pajak</th>
								<th scope="col" class="right" style="width: 190px">Pajak Penghasilan (Rp)</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedRecords}
							getKey={(row, index) => `${row.nomorPemotongan}-${index}`}
							emptyColspan={7}
							emptyText="Tidak ada data yang ditemukan."
						>
							{#snippet row(row)}
								<td>{row.jenis}</td>
								<td><code>{row.nomorPemotongan}</code></td>
								<td>{formatMonth(row.masaPajak)} {row.tahun}</td>
								<td>{row.npwpPemotong}</td>
								<td>{row.namaPemotong}</td>
								<td>{row.namaObjekPajak ?? ''}</td>
								<td class="right amount">{rupiah.format(row.pajakPenghasilan)}</td>
							{/snippet}
						</DataTableBody>
					</table>
				</DataTableViewport>
				<PaginationBar
					bind:page={currentPage}
					bind:pageSize
					totalItems={issuedRecords.length}
					pageSizeOptions={[10, 25, 50, 100]}
					itemLabel="bukti potong"
				/>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
