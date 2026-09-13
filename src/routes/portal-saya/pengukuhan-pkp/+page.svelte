<script lang="ts">
	import {
		Breadcrumbs,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
	} from "$lib/re-ui-components";
</script>

<svelte:head><title>Pengukuhan PKP</title></svelte:head>

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: "Portal Saya", href: "/" },
			{ label: "Pengukuhan PKP" },
		]}
	/>
	<PageHeading eyebrow="Portal Saya" title="Pengukuhan Pengusaha Kena Pajak" />

	<FormSection title="Ketersediaan Layanan">
		<InlineAlert
			tone="info"
			title="Status pengukuhan"
			message="Menu ini hanya tersedia untuk Wajib Pajak yang belum terdaftar sebagai PKP."
		/>
	</FormSection>
</PageLayout>
