<script lang="ts">
    import Upload from "../Button.svelte";
    const { index, description, isUpload }: {index?: String, description?: String, isUpload?: boolean} = $props();
</script>

<div class="">
    <div class="tw:flex">
        <div class="tw:mr-8">{ index }</div>
        <div>{ description }
            {#if isUpload}
                <!-- <Upload label={"Unggah XML"} icon={"bi bi-upload"}/> -->
            {/if}
        </div>
    </div>
</div>
