<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
        labaRugi: {
            id: string;
			kodeAkun: string;
			namaAkun: string;
			komersial: number
			tidakTermasukObjekPajak: number
			dikenakanPphFinal: number
			fiskal: number
        }[]
        neraca: {
            id: string;
			sisi: "aktiva" | "pasiva";
			kodeAkun: string;
			namaAkun: string;
			nilai: number;
        }[]
        readonly: boolean;
    }

    let { currentTab = $bindable(), labaRugi, neraca, readonly }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L1-A" ? "REKONSILIASI LAPORAN KEUANGAN - UMUM" : currentTab.title})

    const rupiah = new Intl.NumberFormat('id-ID');
    const totalFiskal = $derived(labaRugi.reduce((total, row) => total + Number(row.fiskal || 0), 0));
	const totalNeraca = $derived(neraca.reduce((total, row) => total + Number(row.nilai || 0), 0));
</script>

<div class="tw:flex tw:flex-col tw:gap-4 {currentTab.tab === "L1-A" ? "" : "tw:hidden"}">
    <Accordion item="Lampiran 1A - Laba Rugi" target="#accordionSptPphBadan">
        <div class="tw:overflow-x-auto tw:p-5">
            <Table class="tw:w-full attachment-table">
                {#snippet head()}<tr><th>Kode</th><th>Nama Akun</th><th>Komersial</th><th>Tidak Objek Pajak</th><th>PPh Final</th><th>Fiskal</th></tr>{/snippet}
                {#snippet body()}
                    {#each labaRugi as row}
                        <tr>
                            <td>{row.kodeAkun}</td>
                            <td>{row.namaAkun}</td>
                            <td><Input type="text" bind:value={row.komersial} disabled={readonly} /></td>
                            <td><Input type="text" bind:value={row.tidakTermasukObjekPajak} disabled={readonly} /></td>
                            <td><Input type="text" bind:value={row.dikenakanPphFinal} disabled={readonly} /></td>
                            <td><Input type="text" bind:value={row.fiskal} disabled={readonly} /></td>
                        </tr>
                    {/each}
                {/snippet}
            </Table>
        </div>
    </Accordion>

    <Accordion item="Lampiran 1B - Neraca" target="#accordionSptPphBadan">
        <div class="tw:overflow-x-auto tw:p-5">
            <Table class="tw:w-full attachment-table">
                {#snippet head()}<tr><th>Sisi</th><th>Kode</th><th>Nama Akun</th><th>Nilai</th></tr>{/snippet}
                {#snippet body()}
                    {#each neraca as row}
                        <tr>
                            <td>{row.sisi}</td>
                            <td>{row.kodeAkun}</td>
                            <td>{row.namaAkun}</td>
                            <td><Input type="text" bind:value={row.nilai} disabled={readonly} /></td>
                        </tr>
                    {/each}
                    <tr><td colspan="3">Total</td><td><Input class="tw:text-end" type="text" value={rupiah.format(totalNeraca)} disabled /></td></tr>
                {/snippet}
            </Table>
        </div>
    </Accordion>
</div>

<style>
    /* .old-spt-table tr {
		border: none;
	}

	.old-spt-table tr:nth-child(even) {
		background-color: #f9f6ee;
	}

	.old-spt-table td {
		padding: 0.25rem 0.5rem;
	}

	.old-spt-table span,
	.old-spt-table td,
	.attachment-table span,
	.attachment-table td,
	.attachment-table th {
		font-size: 0.8rem;
	}

	.attachment-table td,
	.attachment-table th {
		border: 1px solid #a9a9a9;
		padding: 0.25rem 0.5rem;
	}

	.attachment-table th {
		background-color: #ffd230;
		font-weight: 600;
		text-align: center;
	}

	.attachment-table td {
		text-align: right;
	}

	.attachment-table td:last-child {
		text-align: center;
	} */
</style>