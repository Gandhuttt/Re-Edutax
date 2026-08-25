<script lang="ts">
	import Input from "$lib/components/Input.svelte";

    let { sptItem }: { sptItem: { ixA: boolean | null; ixB: boolean | null } } = $props();
</script>

<div>
    <table class="table table-hover align-bottom">
        <tbody>
            <tr>
                <td class="tw:w-1">A.</td>
                <td>
                    <Input type={"checkbox"} name="IX_0" checked={sptItem.ixA ?? false} id={"IX-1"}/>
                    <label for="IX-1">Daftar Rincian Kendaran Bermotor</label>
                </td>
                <td>
                    <!-- <Upload label={"Unggah XML"} icon={"bi bi-upload"}/> -->
                </td>
            </tr>
            <tr>
                <td class="tw:w-1">B.</td>
                <td>
                    <Input type={"checkbox"} name="IX_1" checked={sptItem.ixB ?? false} id={"IX-2"}/>
                    <label for="IX-2">Hasil penghitungan kembali Pajak Masukan yang telah dikreditkan sebagai penambah (Pengurang) Pajak Masukan</label>
                </td>
                <td>
                    <!-- <Upload label={"Upload PDF"} icon={"bi bi-upload"} width={"30"}/> -->
                </td>
            </tr>
        </tbody>
    </table>
</div>

<style>
    table{
        margin: 0;
    }
    label {
        font-size: .9rem;
    }
</style>
