<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Radio from "$lib/components/RadioPair.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-B" ? "PERNYATAAN TERKAIT TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA" : currentTab.title})

    let hubunganA = $state();
    let hubunganB = $state();
    let hubunganC = $state();
    let hubunganD = $state();
    let transaksiA = $state();
    let transaksiB = $state();
    let transaksiC = $state();
    let dokumentasiA = $state();
    let dokumentasiB = $state();
    let dokumentasiC = $state();
    let dokumentasiD = $state();
    let dokumentasiE = $state();
    let dokumenA = $state()
    let dokumenB = $state()
    let dokumenC = $state()
</script>

<div class="tw:mt-5 {currentTab.tab === "L10-B" ? "" : "tw:hidden"}">
    <Card> 
        {#snippet head()}
        <!-- svelte-ignore block_empty -->
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:p-5 tw:gap-10">
            <!-- Hubungan Istimewa -->
            <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col tw:font-bold">
                    <span>1. Mengenai Hubungan Istimewa</span>
                    <span>Bahwasanya kami telah menerapkan Prinsip Kewajaran dan Kelaziman Usaha</span>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Transaksi dengan pihak yang memiliki hubungan istimewa karena kepemilikan saham/penyertaan</span>
                    <Radio name={"hubunganA"} bind:group={hubunganA}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Transaksi dengan pihak yang memiliki hubungan istimewa karena penguasaan</span>
                    <Radio name={"hubunganB"} bind:group={hubunganB}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Transaksi dengan pihak yang memiliki hubungan istimewa karena hubungan keluarga</span>
                    <Radio name={"hubunganC"} bind:group={hubunganC}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Transaksi yang dilakukan antarpihak yang tidak memiliki hubungan istimewa tetapi Pihak Afiliasi dari salah satu atau kedua pihak yang bertransaksi tersebut menentukan lawan transaksi dan harga transaksi</span>
                    <Radio name={"hubunganD"} bind:group={hubunganD}/>
                </div>
            </div>

            <!-- Transaksi -->
             <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col tw:font-bold">
                    <span>2. Mengenai Transaksi</span>
                    <span>Bahwasanya kami telah menerapkan Prinsip Kewajaran dan Kelaziman Usaha</span>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">berdasarkan keadaan yang sebenarnya.</span>
                    <Radio name={"transaksiA"} bind:group={transaksiA}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">pada saat Penentuan Harga Transfer dan/atau saat terjadinya Transaksi yang dipengaruhi Hubungan Istimewa.</span>
                    <Radio name={"transaksiB"} bind:group={transaksiB}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <div class="tw:w-[75rem]">
                        <span class="tw:block">sesuai dengan:</span>
                        <span class="tw:block">- Tahapan penerapan Prinsip Kewajaran dan Kelaziman Usaha; dan</span>
                        <span class="tw:block">- Tahapan pendahuluan dalam hal terdapat Transaksi Yang Dipengaruhi Hubungan Istimewa tertentu.</span>
                    </div>
                    <Radio name={"transaksiC"} bind:group={transaksiC}/>
                </div>
            </div>

            <!-- Dokumentasi -->
             <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col tw:font-bold">
                    <span>3. Mengenai Dokumentasi Penerapan Prinsip Kewajaran dan Kelaziman Usaha</span>
                    <span>Bahwasanya kami memiliki</span>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">a. nilai peredaran bruto tahun pajak sebelumnya dalam satu tahun pajak lebih dari Rp50.000.000.000,00 (lima puluh miliar rupiah);</span>
                    <Radio name={"dokumentasiA"} bind:group={dokumentasiA}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">b. nilai Transaksi Afiliasi tahun pajak sebelumnya dalam satu tahun pajak lebih dari Rp20.000.000.000,00 (dua puluh miliar rupiah) untuk transaksi barang berwujud;</span>
                    <Radio name={"dokumentasiB"} bind:group={dokumentasiB}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">c. nilai Transaksi Afiliasi tahun pajak sebelumnya dalam satu tahun pajak lebih dari Rp5.000.000.000,00 (5 miliar rupiah) untuk masing-masing penyediaan jasa, pembayaran bunga, pemanfaatan barang tidak berwujud, atau Transaski Afiliasi lainnya;</span>
                    <Radio name={"dokumentasiC"} bind:group={dokumentasiC}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">d. Pihak Afiliasi yang berada di negara atau yuridikasi dengan tarif pajak penghasilan lebih rendah daripada tarif pajak penghasilan</span>
                    <Radio name={"dokumentasiD"} bind:group={dokumentasiD}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">e. Grup Usaha dengan peredaran bruto konsolidasi paling sedikit Rp11.000.000.000.000,00 (sebelas triliun rupiah) pada tahun pajak sebelumnya</span>
                    <Radio name={"dokumentasiE"} bind:group={dokumentasiE}/>
                </div>
            </div>

            <!-- Dokumen -->
             <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col tw:font-bold">
                    <span>4. Mengenai Dokumen Penentuan Harga Transfer</span>
                    <span>Bahwasanya kami telah menyelenggarakan:</span>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Dokumen Induk</span>
                    <Radio name={"dokumenA"} bind:group={dokumenA}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Dokumen Lokal</span>
                    <Radio name={"dokumenB"} bind:group={dokumenB}/>
                </div>
                <div class="tw:flex tw:flex-row tw:gap-5 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">Laporan per Negara</span>
                    <Radio name={"dokumenC"} bind:group={dokumenC}/>
                </div>
            </div>
        </div>
        {/snippet}
    </Card>
</div>
