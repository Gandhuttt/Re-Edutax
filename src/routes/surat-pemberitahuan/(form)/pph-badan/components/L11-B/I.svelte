<script lang="ts">
	import { FieldGrid, RupiahField } from "$lib/re-ui-components";
</script>

<FieldGrid columns={1}>
	<RupiahField label="1. PENHGASILAN NETO KOMERSIAL" />
	<RupiahField label="2. BEBAN PENYUSUTAN DAN AMORTISASI" />
	<RupiahField label="3. BEBAN PAJAK PENGHASILAN" />
	<RupiahField label="4. BEBAN BIAYA PINJAMAN" />
	<RupiahField label="5. EBITDA" />
	<RupiahField label="6. EBITDA (25%)" readonly />
</FieldGrid>
