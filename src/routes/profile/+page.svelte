<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import { getContext } from "svelte";
</script>

<div class="tw:p-25">
    <Card>
        {#snippet head()}
        <h1 class="tw:text-2xl!">Ikhtisar Profil Wajib Pajak</h1>
        {/snippet}
        {#snippet body()}
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
        {/snippet}
    </Card>
</div>