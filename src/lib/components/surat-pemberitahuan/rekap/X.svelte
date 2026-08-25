<script lang="ts">
    import Input from "$lib/components/Input.svelte";
	import { untrack } from 'svelte';

    let {
		sptItem
	}: {
		sptItem: {
			xSetuju: boolean | null;
			xDitandatanganiOleh: 'PKP' | 'KuasaWajibPajak' | null;
			xKotaPenandatanganSpt: string | null;
			xNama: string | null;
			xJabatan: string | null;
			xBatasWaktuPenyampaian: string | null;
		};
	} = $props();

    let checked = $state(untrack(() => sptItem.xSetuju ?? false));
    let isDisabled = $derived(!checked);
</script>

<div>
	<div class="tw:flex tw:items-center">
        <div class="tw:mr-5"><Input type={'checkbox'} id={'X-0'} name={'check-ttd'} {checked}/></div>
		<label class="form-check-label" for="X-0"><strong><em>PERNYATAAN: DENGAN MENYADARI SEPENUHNYA AKAN SEGALA AKIBATNYA, SAYA MENYATAKAN BAHWA APA YANG TELAH SAYA BERITAHUKAN DI ATAS BESERTA LAMPIRAN-LAMPIRANNYA ADALAH BENAR, LENGKAP, JELAS, DAN TIDAK BERSYARAT</em></strong></label>
	</div>
    <div>
        <table class="table table-borderless align-middle">
            <tbody>
                <tr>
                    <td class="inputHead"><label for="X-1">DITANDATANGANI OLEH</label></td>
                    <td>
                        <div class="tw:flex tw:flex-row">
                            <div class="form-check tw:mr-5">
                                <Input type={"radio"} id={"X-1"} name={"radio-ttd"} value="PKP" checked={sptItem.xDitandatanganiOleh === 'PKP'} disabled={isDisabled}/>
                                <label class="form-check-label" for="X-1">PKP</label>
                            </div>
                            <div class="form-check">
                                <Input type={"radio"} id={"X-2"} name={"radio-ttd"} value="KuasaWajibPajak" checked={sptItem.xDitandatanganiOleh === 'KuasaWajibPajak'} disabled={isDisabled}/>
                                <label class="form-check-label" for="X-2">Kuasa Wajib Pajak</label>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td><label for="X-3">Kota Penandatanganan SPT</label></td>
                    <td><Input id={"X-3"} type={'text'} value={sptItem.xKotaPenandatanganSpt} disabled/></td>
                </tr>
                <tr>
                    <td><label for="X-4">Nama</label></td>
                    <td><Input id={"X-4"} type={'text'} value={sptItem.xNama} disabled/></td>
                </tr>
                <tr>
                    <td><label for="X-5">Jabatan</label></td>
                    <td><Input id={"X-5"} name="X_jabatan" type={'text'} value={sptItem.xJabatan} disabled={isDisabled}/></td>
                </tr>
                <tr>
                    <td><label for="X-6"></label>Batas Waktu Penyampaian SPT</td>
                    <td><Input id={"X-6"} type={"date"} value={sptItem.xBatasWaktuPenyampaian} disabled/></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<style>
    td {
        font-size: 1rem;
    }
    .inputHead {
        width: 20rem;
    }
</style>
