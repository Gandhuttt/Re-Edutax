<script lang="ts">
	import { DataTable, FormField } from "$lib/re-ui-components";

	interface Props {
		data: {
			npwp: string;
		};
		readonly: boolean;
	}

	let { data, readonly }: Props = $props();
</script>

<DataTable label="Identitas wajib pajak" minWidth="620px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Identitas</th><th scope="col">Nilai</th></tr>
		</thead>
		<tbody>
			<tr><td>1.</td><td>NPWP</td><td><FormField label="NPWP" value={data.npwp} readonly /></td></tr>
			<tr><td>2.</td><td>Nama</td><td><FormField label="Nama" value="-" readonly /></td></tr>
			<tr><td>3.</td><td>Alamat Email</td><td><FormField label="Alamat Email" value="-" readonly /></td></tr>
			<tr><td>4.</td><td>Nomor Telepon</td><td><FormField label="Nomor Telepon" value="-" readonly /></td></tr>
		</tbody>
	</table>
</DataTable>
