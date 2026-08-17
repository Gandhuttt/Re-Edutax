<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import { untrack } from "svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { FieldSpec, LampiranRow } from "./types";

    interface Props {
        judul: string;
        fields: FieldSpec[];
        // A factory rather than a value: the modal edits a private copy, and it is
        // remounted on every open, so the row is read exactly once at mount.
        // Editing the draft must not write through to the grid until Simpan.
        rowAwal: () => LampiranRow;
        // daftar key -> option list, loaded once on the page.
        referensi: Record<string, string[]>;
        onSimpan: (row: LampiranRow) => void;
        onTutup: () => void;
    }

    let { judul, fields, rowAwal, referensi, onSimpan, onTutup }: Props = $props();

    // untrack makes the read-once intent explicit: the draft is seeded from the row
    // at mount and deliberately does not re-sync afterwards.
    let draft = $state<LampiranRow>(untrack(rowAwal));
    let errors = $state<Record<string, string>>({});

    // Derived fields recompute live while the modal is open, which is what the
    // real form does (L-1 D's Penghasilan Neto updates on blur).
    $effect(() => {
        for (const field of fields) {
            if (field.turunan) draft[field.key] = field.turunan(draft);
        }
    });

    function simpan() {
        // Validation fires on Simpan for every field at once rather than one at a
        // time, matching the live form. Derived fields are skipped: they are
        // disabled, and "required unless disabled" is the actual rule.
        const next: Record<string, string> = {};
        for (const field of fields) {
            if (!field.wajib || field.turunan) continue;
            const value = draft[field.key];
            if (value === '' || value === undefined || value === null) {
                next[field.key] = 'Kolom ini wajib diisi!';
            }
        }
        errors = next;
        if (Object.keys(next).length === 0) onSimpan({ ...draft });
    }
</script>

<div class="overlay">
    <div class="modal">
        <header>
            <span class="tw:text-lg">{judul}</span>
            <button type="button" onclick={onTutup} aria-label="Tutup">&times;</button>
        </header>

        <div class="body">
            {#each fields as field (field.key)}
                <div class="field">
                    <Label for={`modal-${field.key}`}>
                        <span>{field.label}{field.wajib ? ' *' : ''}</span>
                    </Label>

                    {#if field.turunan}
                        <!-- System-filled and disabled. -->
                        <Input
                            id={`modal-${field.key}`}
                            type={"text"}
                            value={field.kind === 'rupiah' ? formatRupiah(Number(draft[field.key])) : String(draft[field.key] ?? '')}
                            disabled
                        />
                    {:else if field.kind === 'daftar'}
                        <Select id={`modal-${field.key}`} bind:value={draft[field.key] as string}>
                            <option class="tw:text-black" value={""}>Silakan pilih</option>
                            {#each referensi[field.daftar ?? ''] ?? [] as option}
                                <option class="tw:text-black" value={option}>{option}</option>
                            {/each}
                        </Select>
                    {:else if field.kind === 'rupiah'}
                        <Input
                            id={`modal-${field.key}`}
                            class={"tw:text-end"}
                            type={"text"}
                            value={formatRupiah(Number(draft[field.key]))}
                            oninput={(e: Event) => (draft[field.key] = applyRupiahInput(e))}
                        />
                    {:else if field.kind === 'tahun'}
                        <Input id={`modal-${field.key}`} type={"number"} bind:value={draft[field.key] as number} />
                    {:else if field.kind === 'tanggal'}
                        <!-- An ordinary date input. The live form's picker cannot be
                             typed into at all and silently clamps out-of-range years,
                             which is exactly the behaviour we chose not to copy. -->
                        <Input id={`modal-${field.key}`} type={"date"} bind:value={draft[field.key] as string} />
                    {:else}
                        <Input id={`modal-${field.key}`} type={"text"} bind:value={draft[field.key] as string} />
                    {/if}

                    {#if errors[field.key]}
                        <span class="error">{errors[field.key]}</span>
                    {/if}
                </div>
            {/each}
        </div>

        <footer>
            <Button type="button" onclick={onTutup}>Tutup</Button>
            <Button type="button" onclick={simpan} color="var(--color-secondary)">
                <span class="tw:text-white">Simpan</span>
            </Button>
        </footer>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }
    .modal {
        background: white;
        width: min(48rem, 92vw);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        border-radius: 0.25rem;
    }
    header,
    footer {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
    }
    header {
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
    }
    header button {
        font-size: 1.5rem;
        line-height: 1;
        background: none;
        border: none;
        cursor: pointer;
    }
    footer {
        justify-content: flex-end;
        gap: 0.5rem;
        border-top: 1px solid #ddd;
    }
    .body {
        overflow-y: auto;
        padding: 1rem;
        display: grid;
        gap: 0.75rem;
    }
    .field {
        display: grid;
        gap: 0.25rem;
    }
    .field span {
        font-size: 0.8rem;
    }
    .error {
        background: #fde8e8;
        color: #b91c1c;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
    }
</style>
