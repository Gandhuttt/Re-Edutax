<script lang="ts">
    import Card from "$lib/components/Card.svelte";
	import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import { getContext } from "svelte";

	const tabs = [
		'Profil',
		'Daftar Kode Billing Belum Dibayar',
		'Saldo Saat Ini',
		'SPT Belum Disampaikan',
		'Jenis Pajak Terdaftar',
		'Kasus Aktif',
		'Fasilitas Aktif'
	];

	let activeTab = $state('Profil');
	let tableFilterOpen = $state(false);

	const tableDefinitions: Record<string, { columns: string[]; rows: string[][]; activeFilter?: string }> = {
		'Daftar Kode Billing Belum Dibayar': {
			columns: ['Kode Billing', 'Mata Uang', 'Jumlah Total', 'Masa Aktif'],
			rows: []
		},
		'SPT Belum Disampaikan': {
			columns: ['Jenis Pajak', 'Jenis SPT', 'Masa Pajak', 'Tanggal Jatuh Tempo', 'Model SPT'],
			rows: [
				['PPN', 'SPT Masa PPN', 'Juli 2026', '31/08/2026', 'Pembetulan'],
				['PPh Badan', 'SPT PPh Badan Rupiah', 'Januari - Desember 2025', '30/04/2026', 'Pembetulan']
			]
		},
		'Jenis Pajak Terdaftar': {
			columns: ['Jenis Pajak', 'Tanggal Permohonan', 'Tanggal Mulai Transaksi', 'Tanggal Pendaftaran', 'Nomor Kasus'],
			rows: []
		},
		'Kasus Aktif': {
			columns: ['Nomor Kasus', 'Jenis Kasus', 'Status Kasus', 'Langkah Alur Kerja', 'Tanggal Jatuh Tempo Tertinggi'],
			rows: []
		},
		'Fasilitas Aktif': {
			columns: ['Kode Jenis Layanan', 'Deskripsi Kode Jenis Layanan', 'Nama Sub Kode Jenis Layanan', 'Sub Kode Jenis Layanan Deskripsi', 'Kode Layanan Administrasi', 'Status', 'Tanggal Mulai', 'Tanggal Berakhir', 'Tanggal Dibuat', 'Tahun Pajak'],
			rows: [],
			activeFilter: 'Status: Active'
		}
	};
</script>

<div class="tw:p-25">
    <Card>
        {#snippet head()}
		<div class="tw:flex tw:w-full tw:items-center tw:justify-between tw:gap-4">
			<h1 class="tw:text-2xl!">Ikhtisar Profil Wajib Pajak</h1>
			<Button type="button">Unduh Ikhtisar Profil</Button>
		</div>
        {/snippet}
        {#snippet body()}
		<div class="profile-tabs" role="tablist" aria-label="Ikhtisar profil">
			{#each tabs as tab}
				<button
					type="button"
					class:active={activeTab === tab}
					onclick={() => (activeTab = tab)}
				>{tab}</button
				>
			{/each}
		</div>
		{#if activeTab === 'Profil'}
        <div class="tw:flex tw:flex-row tw:gap-10 tw:w-full">
        <!-- KOLOM 1 -->
            <div class="tw:flex tw:flex-col tw:gap-1 tw:w-1/2">
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Nama</span>
                    <Input type={"text"} name={"namaWP"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Nomor Pokok Wajib Pajak</span>
                    <Input type={"text"} name={"nomorWP"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Kegiatan Utama</span>
                    <Input type={"text"} name={"kegiatanUtama"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Jenis Wajib Pajak</span>
                    <Input type={"text"} name={"jenisWP"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Bentuk Badan Hukum</span>
                    <Input type={"text"} name={"badanHukum"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Status NPWP</span>
                    <Input type={"text"} name={"statusNPWP"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Tanggal Terdaftar</span>
                    <Input type={"date"} name={"tglTerdaftar"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Tanggal Aktivasi</span>
                    <Input type={"date"} name={"tglAktivasi"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Status Pengusaha Kena Pajak</span>
                    <Input type={"text"} name={"statusKenaPajak"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Tanggal Pengukuhan Pengusaha Kena Pajak</span>
                    <Input type={"date"} name={"tglPengukuhan"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Kantor Wilayah Direktorat Jenderal Pajak</span>
                    <Input type={"text"} name={"kantorDJP"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Kantor Pelayanan Pajak</span>
                    <Input type={"text"} name={"kantorPelayanan"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Seksi Pengawasan</span>
                    <Input type={"text"} name={"seksiPengawasan"} id={getContext('id')}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Tanggal Pembaruan Profil Terakhir</span>
                    <Input type={"date"} name={"lastProfileUpdate"} id={getContext('id')}/>
                </Label>
            </div>

        <!-- KOLOM 2 -->
            <div class="tw:flex tw:flex-col tw:gap-5 tw:w-1/2">
                <div>
                    <h2 class="tw:text-2xl!">Alamat Utama</h2>
                    <textarea class="tw:w-full tw:h-30 tw:resize-none!" name="alamatWP" maxlength="200"></textarea>
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1">
                    <h2 class="tw:text-2xl!">Kontak Utama</h2>
                    <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                        <span class="tw:block tw:w-[25rem]">Nomor Handphone</span>
                        <Input type={"text"} name={"handphoneWP"} id={getContext('id')}/>
                    </Label>
                    <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                        <span class="tw:block tw:w-[25rem]">Email</span>
                        <Input type={"email"} name={"emailWP"} id={getContext('id')}/>
                    </Label>
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1">
                    <h2 class="tw:text-2xl!">Klasifikasi Lapangan Usaha Utama</h2>
                    <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                        <span class="tw:block tw:w-[25rem]">Kode Klasifikasi Lapangan Usaha</span>
                        <Input type={"text"} name={"kodeKlasifikasi"} id={getContext('id')}/>
                    </Label>
                    <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                        <span class="tw:block tw:w-[25rem]">Deskripsi Klasifikasi Lapangan Usaha</span>
                        <Input type={"text"} name={"deskripsiKlasifikasi"} id={getContext('id')}/>
                    </Label>
                </div>
            </div>
        </div>
		{:else if activeTab === 'Saldo Saat Ini'}
			<div class="balance-grid">
				<div><span>Saldo</span><strong>0,00</strong></div>
				<div><span>Debit</span><strong>0,00</strong></div>
				<div><span>Kredit</span><strong>0,00</strong></div>
				<div><span>Debit Tersisa</span><strong>0,00</strong></div>
				<div><span>Kredit Tersisa</span><strong>0,00</strong></div>
			</div>
		{:else}
			{@const tableDefinition = tableDefinitions[activeTab]}
			<div class="tab-table-panel">
				<div class="table-toolbar">
					<button type="button">Muat Ulang</button>
					<button class:active={tableFilterOpen} type="button" onclick={() => (tableFilterOpen = !tableFilterOpen)}>Filter</button>
					<button type="button">Atur Kolom</button>
					<button type="button">Export</button>
				</div>
				{#if tableDefinition.activeFilter}
					<div class="active-filter"><strong>Filter Aktif:</strong> {tableDefinition.activeFilter}</div>
				{/if}
				<div class="profile-table-scroll">
					<table>
						<thead>
							<tr>{#each tableDefinition.columns as column}<th>{column}</th>{/each}</tr>
							{#if tableFilterOpen}
								<tr class="table-filters">{#each tableDefinition.columns as column}<th><input aria-label="Filter {column}" /></th>{/each}</tr>
							{/if}
						</thead>
						<tbody>
							{#each tableDefinition.rows as row}
								<tr>{#each row as value}<td>{value}</td>{/each}</tr>
							{:else}
								<tr><td class="empty" colspan={tableDefinition.columns.length}>Tidak ada data.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
				<footer class="table-footer">
					<span>Menampilkan {tableDefinition.rows.length === 0 ? '0–0 dari 0' : `1–${tableDefinition.rows.length} dari ${tableDefinition.rows.length}`}</span>
					<div><button type="button" disabled>Sebelumnya</button><button type="button" disabled>Berikutnya</button><select disabled={tableDefinition.rows.length === 0} aria-label="Jumlah baris"><option>10</option></select></div>
				</footer>
			</div>
		{/if}
        {/snippet}
    </Card>
</div>

<style>
	.profile-tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1.5rem;
		overflow-x: auto;
		border-bottom: 1px solid #a9a9a9;
	}

	.profile-tabs button {
		flex: 0 0 auto;
		padding: 0.65rem 1rem;
		border: 0;
		border-bottom: 3px solid transparent;
		background: transparent;
		color: var(--color-text);
	}

	.profile-tabs button.active {
		border-bottom-color: var(--color-secondary);
		font-weight: 700;
	}

	.balance-grid {
		display: grid;
		grid-template-columns: repeat(5, minmax(10rem, 1fr));
		gap: 1rem;
		min-height: 25rem;
		align-content: start;
	}

	.balance-grid div {
		display: flex;
		min-height: 8rem;
		flex-direction: column;
		justify-content: space-between;
		padding: 1rem;
		border: 1px solid #a9a9a9;
		border-radius: 2px;
		background: #e5e7eb;
	}

	.balance-grid span { font-weight: 700; }
	.balance-grid strong { font-size: 1.5rem; font-weight: 400; }
	.tab-table-panel { min-height: 25rem; }
	.table-toolbar { min-height: 4rem; display: flex; align-items: center; justify-content: flex-end; gap: .75rem; }
	.table-toolbar button, .table-footer button { min-width: 5rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	.table-toolbar button.active { background: var(--color-secondary); color: white; }
	.active-filter { margin-bottom: .75rem; padding: .6rem .75rem; border: 1px solid #a9a9a9; background: #e5e7eb; }
	.profile-table-scroll { overflow-x: auto; }
	.profile-table-scroll table { width: 100%; min-width: 65rem; border-collapse: collapse; table-layout: fixed; }
	.profile-table-scroll th, .profile-table-scroll td { padding: .5rem 1rem; text-align: left; vertical-align: top; }
	.profile-table-scroll th { min-width: 12rem; }
	.profile-table-scroll input { width: 100%; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; }
	.profile-table-scroll .empty { height: 10rem; text-align: center; vertical-align: middle; }
	.table-footer { min-height: 4rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
	.table-footer div { display: flex; align-items: center; gap: .75rem; }
	.table-footer button { background: transparent; }
	.table-footer select { width: 6rem; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); }

	@media (max-width: 1100px) {
		.balance-grid { grid-template-columns: repeat(2, minmax(10rem, 1fr)); }
	}

	@media (max-width: 720px) {
		:global(.profile-tabs + div) {
			flex-direction: column;
		}
		.balance-grid { grid-template-columns: 1fr; }
		.table-toolbar { justify-content: flex-start; flex-wrap: wrap; }
		.table-footer { align-items: flex-start; flex-direction: column; }
	}
</style>
