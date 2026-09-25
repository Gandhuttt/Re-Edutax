<script lang="ts">
    import { DisclosureItem, Stack } from "$lib/re-ui-components";
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisEntertainment, BarisPiutang, BarisPromosi } from "./types";

    interface Props {
        currentTab: string;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        entertainment: BarisEntertainment[];
        promosi: BarisPromosi[];
        piutang: BarisPiutang[];
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        kodeReferensi,
        entertainment = $bindable(),
        promosi = $bindable(),
        piutang = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<div class:hidden={currentTab !== "L-3D"}>
    <Stack gap="0">
        <DisclosureItem title="A. DAFTAR NOMINATIF BIAYA ENTERTAINMENT">
            <A bind:rows={entertainment} {referensi} {kodeReferensi} {readonly} />
        </DisclosureItem>
        <DisclosureItem title="B. DAFTAR NOMINATIF BIAYA PROMOSI SERTA PENGGANTIAN ATAU IMBALAN DALAM BENTUK NATURA DAN/ATAU KENIKMATAN">
            <B bind:rows={promosi} {referensi} {kodeReferensi} {readonly} />
        </DisclosureItem>
        <DisclosureItem title="C. PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH">
            <C bind:rows={piutang} {referensi} {kodeReferensi} {readonly} />
        </DisclosureItem>
    </Stack>
</div>

<style>.hidden { display: none; }</style>
