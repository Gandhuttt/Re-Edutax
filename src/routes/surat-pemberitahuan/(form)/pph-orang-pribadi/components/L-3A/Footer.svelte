<script lang="ts">
    import type { FooterL3A } from "./types";

    // Section A footer, below the neraca and outside both of its tables.
    //
    // Five fields, not the three the UI capture recorded: the NPWP/NAMA KANTOR
    // AKUNTAN PUBLIK pair only renders when LAPORAN KEUANGAN is Diaudit, which
    // is why it was never seen. From the bundle:
    // isShownAccountantFirm = ("TRADING" == FinancialStatement), and TRADING is
    // the FINANCIAL_STATEMENT code for Diaudit.
    //
    // LAPORAN KEUANGAN carries Validators.required on the live form, so it is
    // marked mandatory here too.
    interface Props {
        footer: FooterL3A;
        readonly?: boolean;
    }

    let { footer = $bindable(), readonly = false }: Props = $props();

    const diaudit = $derived(footer.laporanKeuangan === 'diaudit');
</script>

<div class="tw:flex tw:flex-col tw:gap-3 tw:mt-4">
    <label class="tw:flex tw:flex-col tw:gap-1 tw:max-w-[28rem]">
        <span class="tw:text-sm tw:font-bold">LAPORAN KEUANGAN *</span>
        <select
            class="form-control form-control-sm"
            bind:value={footer.laporanKeuangan}
            disabled={readonly}
        >
            <option value={null}>Silakan Pilih</option>
            <option value="tidak_diaudit">Tidak Diaudit</option>
            <option value="diaudit">Diaudit</option>
        </select>
    </label>

    <div class="tw:flex tw:flex-row tw:gap-4 tw:flex-wrap">
        <label class="tw:flex tw:flex-col tw:gap-1 tw:max-w-[28rem]">
            <span class="tw:text-sm">NPWP KONSULTAN PAJAK</span>
            <input
                type="text"
                class="form-control form-control-sm"
                bind:value={footer.npwpKonsultanPajak}
                disabled={readonly}
            />
        </label>
        <label class="tw:flex tw:flex-col tw:gap-1 tw:max-w-[28rem]">
            <span class="tw:text-sm">NAMA KONSULTAN PAJAK</span>
            <input
                type="text"
                class="form-control form-control-sm"
                bind:value={footer.namaKonsultanPajak}
                disabled={readonly}
            />
        </label>
    </div>

    {#if diaudit}
        <div class="tw:flex tw:flex-row tw:gap-4 tw:flex-wrap">
            <label class="tw:flex tw:flex-col tw:gap-1 tw:max-w-[28rem]">
                <span class="tw:text-sm">NPWP KANTOR AKUNTAN PUBLIK</span>
                <input
                    type="text"
                    class="form-control form-control-sm"
                    bind:value={footer.npwpKantorAkuntanPublik}
                    disabled={readonly}
                />
            </label>
            <label class="tw:flex tw:flex-col tw:gap-1 tw:max-w-[28rem]">
                <span class="tw:text-sm">NAMA KANTOR AKUNTAN PUBLIK</span>
                <input
                    type="text"
                    class="form-control form-control-sm"
                    bind:value={footer.namaKantorAkuntanPublik}
                    disabled={readonly}
                />
            </label>
        </div>
    {/if}
</div>
