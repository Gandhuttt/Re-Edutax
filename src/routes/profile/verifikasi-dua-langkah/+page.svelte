<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		SelectField,
		Stack,
		StatusBadge,
	} from "$lib/re-ui-components";

	let enabled = $state(false);
	let setupOpen = $state(false);
	let method = $state("Aplikasi autentikator");
	let verificationCode = $state("");
	let notice = $state("");

	function beginSetup() {
		setupOpen = true;
		notice = "";
	}

	function activate() {
		if (!/^\d{6}$/.test(verificationCode)) {
			notice = "Masukkan kode simulasi 6 digit untuk melanjutkan.";
			return;
		}
		enabled = true;
		setupOpen = false;
		verificationCode = "";
		notice = "Verifikasi dua langkah berhasil diaktifkan untuk tampilan demo.";
	}

	function cancelSetup() {
		setupOpen = false;
		verificationCode = "";
		notice = "";
	}

	function disable() {
		enabled = false;
		notice = "Verifikasi dua langkah dinonaktifkan untuk tampilan demo.";
	}
</script>

<svelte:head><title>Verifikasi Dua Langkah</title></svelte:head>

<PageLayout contentWidth="1100px">
	<Breadcrumbs
		items={[
			{ label: "Profil Saya", href: "/profile" },
			{ label: "Verifikasi Dua Langkah" },
		]}
	/>
	<PageHeading
		eyebrow="Keamanan Akun"
		title="Verifikasi Dua Langkah"
		description="Tambahkan lapisan verifikasi saat masuk ke akun."
	/>

	<Stack gap="18px">
		{#if notice}
			<InlineAlert
				tone={notice.startsWith("Masukkan") ? "error" : "success"}
				message={notice}
			/>
		{/if}

		<section class="status-card">
			<div>
				<span class="eyebrow">STATUS KEAMANAN</span>
				<h2>{enabled ? "Aktif" : "Belum aktif"}</h2>
				<p>
					{enabled
						? `Metode utama: ${method}`
						: "Akun ini masih menggunakan kata sandi sebagai satu-satunya langkah masuk."}
				</p>
			</div>
			<StatusBadge label={enabled ? "Aktif" : "Tidak aktif"} tone={enabled ? "success" : "neutral"} />
		</section>

		<FormSection
			title="Metode verifikasi"
			description="Pilih metode yang akan digunakan setelah memasukkan kata sandi."
			bordered
		>
			<div class="method-field">
				<SelectField
					label="Metode"
					value={method}
					disabled={enabled}
					options={[
						{ value: "Aplikasi autentikator", label: "Aplikasi autentikator" },
						{ value: "Email terdaftar", label: "Email terdaftar" },
					]}
					onchange={(value) => (method = String(value))}
				/>
			</div>
		</FormSection>

		{#if setupOpen && !enabled}
			<FormSection title={`Siapkan ${method}`} bordered>
				<Stack gap="18px">
					<ol>
						<li>Buka aplikasi atau kotak masuk sesuai metode yang dipilih.</li>
						<li>
							Gunakan petunjuk simulasi ini untuk menghubungkan akun. Tidak ada secret atau
							QR autentikasi sungguhan yang ditampilkan.
						</li>
						<li>Masukkan kode simulasi 6 digit untuk mengonfirmasi konfigurasi.</li>
					</ol>

					<div class="code-field">
						<FormField
							label="Kode verifikasi"
							bind:value={verificationCode}
							inputmode="numeric"
							maxlength={6}
							placeholder="000000"
							autocomplete="one-time-code"
						/>
					</div>

					<Stack direction="horizontal" gap="8px" align="center" wrap>
						<ActionButton tone="quiet" onclick={cancelSetup}>Batal</ActionButton>
						<ActionButton tone="secondary" onclick={activate}>Aktifkan</ActionButton>
					</Stack>
				</Stack>
			</FormSection>
		{/if}

		<div class="actions">
			{#if enabled}
				<ActionButton tone="danger" onclick={disable}>Nonaktifkan</ActionButton>
				<ActionButton
					tone="quiet"
					onclick={() =>
						(notice =
							"Kode pemulihan demo diperbarui. Tidak ada kode sungguhan yang dibuat.")}
					>Perbarui Kode Pemulihan</ActionButton
				>
			{:else if !setupOpen}
				<ActionButton tone="secondary" onclick={beginSetup}
					>Atur Verifikasi Dua Langkah</ActionButton
				>
			{/if}
		</div>

		<InlineAlert tone="info" title="Sebelum mengaktifkan">
			<p class="help-copy">
				Pastikan email dan nomor telepon pada profil tetap dapat diakses. Simpan kode pemulihan
				di tempat yang aman setelah aktivasi pada sistem produksi.
			</p>
		</InlineAlert>
	</Stack>
</PageLayout>

<style>
	.status-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 22px;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
	}

	.eyebrow {
		color: var(--ui-yellow-deep);
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h2 {
		margin: 4px 0 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 22px;
	}

	.status-card p {
		margin: 5px 0 0;
		color: var(--ui-muted);
		font-size: 12px;
	}

	.method-field {
		max-width: 360px;
	}

	.code-field {
		max-width: 320px;
	}

	ol {
		margin: 0;
		padding-left: 22px;
		color: var(--ui-ink);
	}

	li + li {
		margin-top: 8px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		flex-wrap: wrap;
	}

	.help-copy {
		margin: 0;
	}

	@media (max-width: 600px) {
		.status-card {
			align-items: flex-start;
			flex-direction: column;
		}

		.actions {
			justify-content: flex-start;
		}
	}
</style>
