<script module lang="ts">
	export type FormField = {
		name: string;
		label: string;
		type?: 'text' | 'date' | 'number' | 'email' | 'url' | 'tel' | 'select' | 'textarea' | 'file';
		placeholder?: string;
		options?: string[];
		required?: boolean;
		disabled?: boolean;
		full?: boolean;
		help?: string;
		accept?: string;
		value?: string;
		min?: string;
		step?: string;
		inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
		maxLength?: number;
		rows?: number;
	};

	export type FormSection = {
		title: string;
		description?: string;
		fields: FormField[];
	};

	export type StatusFormConfig = {
		title: string;
		intro?: string;
		identityFields?: FormField[];
		sections: FormSection[];
		representativeLabel?: string;
		representativeIdLabel?: string;
		representativeIdPlaceholder?: string;
		representativeTaxIdLabel?: string;
		representativeDetailsPlaceholder?: string;
		declaration?: string;
		successMessage?: string;
	};
</script>

<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		DateField,
		FieldGrid,
		FileUploadField,
		FormActions,
		FormField as ReFormField,
		FormSection as ReFormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		SelectField,
		Stack,
		TextAreaField,
		type SelectFieldValue,
	} from '$lib/re-ui-components';

	let { config }: { config: StatusFormConfig } = $props();
	let represented = $state(false);
	let representativeId = $state('');
	let agreed = $state(false);
	let saved = $state(false);
	let error = $state('');
	let values = $state<Record<string, string>>({});
	let files = $state<Record<string, FileList | undefined>>({});
	let fieldErrors = $state<Record<string, string>>({});

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
	const defaultIdentityFields: FormField[] = [
		{
			name: 'taxpayer-id',
			label: 'NIK/NPWP',
			placeholder: 'Sesuai akun Wajib Pajak',
			required: true,
			disabled: true,
		},
		{
			name: 'taxpayer-name',
			label: 'Nama Wajib Pajak',
			placeholder: 'Sesuai akun Wajib Pajak',
			disabled: true,
		},
		{
			name: 'registered-address',
			label: 'Alamat Terdaftar',
			type: 'textarea',
			rows: 2,
			placeholder: 'Sesuai profil Wajib Pajak',
			disabled: true,
			full: true,
		},
	];

	const identityFields = $derived(config.identityFields ?? defaultIdentityFields);
	const declaration = $derived(
		config.declaration ??
			'Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai ketentuan yang berlaku, saya menyatakan bahwa data dan dokumen yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.',
	);

	function clearFeedback(name?: string) {
		saved = false;
		error = '';
		if (name) fieldErrors[name] = '';
	}

	function setValue(name: string, value: string | SelectFieldValue) {
		values[name] = String(value);
		clearFeedback(name);
	}

	function isFullField(field: FormField) {
		return field.full ?? (field.type === 'textarea' || field.type === 'file');
	}

	function validateConfiguredFields() {
		let valid = true;
		for (const section of config.sections) {
			for (const field of section.fields) {
				if (!field.required || field.disabled) continue;
				const present = field.type === 'file' ? Boolean(files[field.name]?.length) : Boolean(values[field.name]?.trim());
				fieldErrors[field.name] = present ? '' : `${field.label} wajib diisi.`;
				valid = present && valid;
			}
		}
		return valid;
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const configuredFieldsValid = validateConfiguredFields();
		if (!form.checkValidity() || !configuredFieldsValid || !agreed) {
			error = 'Lengkapi seluruh data dan pernyataan yang wajib diisi.';
			saved = false;
			form.reportValidity();
			return;
		}
		error = '';
		saved = true;
	}
</script>

<svelte:head><title>{config.title}</title></svelte:head>

{#snippet renderField(field: FormField)}
	{#if field.type === 'select'}
		<SelectField
			label={field.label}
			name={field.name}
			value={values[field.name] ?? field.value ?? ''}
			options={[
				{ value: '', label: 'Silakan Pilih' },
				...(field.options ?? []).map((option) => ({ value: option, label: option })),
			]}
			required={field.required}
			disabled={field.disabled}
			hint={field.help}
			error={fieldErrors[field.name]}
			onchange={(value) => setValue(field.name, value)}
		/>
	{:else if field.type === 'date'}
		<DateField
			label={field.label}
			name={field.name}
			value={values[field.name] ?? field.value ?? ''}
			required={field.required}
			disabled={field.disabled}
			hint={field.help}
			error={fieldErrors[field.name]}
			min={field.min}
			onchange={(value) => setValue(field.name, value)}
		/>
	{:else if field.type === 'textarea'}
		<TextAreaField
			label={field.label}
			name={field.name}
			value={values[field.name] ?? field.value ?? ''}
			rows={field.rows ?? 3}
			maxLength={field.maxLength}
			placeholder={field.placeholder}
			required={field.required}
			disabled={field.disabled}
			hint={field.help}
			error={fieldErrors[field.name]}
			oninput={(event) => setValue(field.name, event.currentTarget.value)}
		/>
	{:else if field.type === 'file'}
		<FileUploadField
			label={field.label}
			name={field.name}
			accept={field.accept}
			required={field.required}
			disabled={field.disabled}
			hint={field.help}
			error={fieldErrors[field.name]}
			bind:files={files[field.name]}
			onchange={() => clearFeedback(field.name)}
		/>
	{:else}
		<ReFormField
			label={field.label}
			name={field.name}
			type={field.type ?? 'text'}
			value={values[field.name] ?? field.value ?? ''}
			placeholder={field.placeholder}
			required={field.required}
			disabled={field.disabled}
			hint={field.help}
			error={fieldErrors[field.name]}
			min={field.min ?? (field.type === 'number' ? '0' : undefined)}
			step={field.step}
			inputmode={field.inputMode}
			oninput={(event) => setValue(field.name, event.currentTarget.value)}
		/>
	{/if}
{/snippet}

<PageLayout contentWidth="1180px">
	<Breadcrumbs items={[{ label: 'Perubahan Status' }, { label: config.title }]} />
	<PageHeading eyebrow="Perubahan Status" title={config.title} description={config.intro} />

	<form onsubmit={submit} oninput={() => clearFeedback()} novalidate>
		<Stack gap="18px">
			<ReFormSection number="01" title="Manajemen Kasus" bordered>
				<FieldGrid columns={2}>
					<ReFormField label="Kanal" value="Daring (Portal Wajib Pajak)" required disabled />
					<DateField label="Tanggal Permohonan" value={today} disabled />
				</FieldGrid>
			</ReFormSection>

			<ReFormSection number="02" title="Kuasa Wajib Pajak" bordered>
				<Stack gap="18px">
					<CheckboxField
						label={config.representativeLabel ?? 'Diisi oleh wakil atau kuasa Wajib Pajak?'}
						bind:checked={represented}
						onchange={() => clearFeedback('representative-id')}
					/>
					<FieldGrid columns={2}>
						<ReFormField
							label={config.representativeIdLabel ?? 'ID Penunjukan Wakil/Kuasa'}
							name="representative-id"
							bind:value={representativeId}
							required={represented}
							disabled={!represented}
							placeholder={config.representativeIdPlaceholder ?? 'Masukkan ID penunjukan'}
						/>
						<ReFormField label={config.representativeTaxIdLabel ?? 'NIK/NPWP Wakil/Kuasa'} disabled placeholder={config.representativeDetailsPlaceholder ?? 'Terisi setelah ID diverifikasi'} />
						<ReFormField label="Nama Wakil/Kuasa" disabled placeholder={config.representativeDetailsPlaceholder ?? 'Terisi setelah ID diverifikasi'} />
					</FieldGrid>
				</Stack>
			</ReFormSection>

			<ReFormSection number="03" title="Identitas Wajib Pajak" bordered>
				<FieldGrid columns={2}>
					{#each identityFields as field}
						<div class:full-row={isFullField(field)}>
							{@render renderField(field)}
						</div>
					{/each}
				</FieldGrid>
			</ReFormSection>

			{#each config.sections as section, index}
				<ReFormSection number={String(index + 4).padStart(2, '0')} title={section.title} description={section.description} bordered>
					<FieldGrid columns={2}>
						{#each section.fields as field}
							<div class:full-row={isFullField(field)}>
								{@render renderField(field)}
							</div>
						{/each}
					</FieldGrid>
				</ReFormSection>
			{/each}

			<ReFormSection number={String(config.sections.length + 4).padStart(2, '0')} title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField
					label={declaration}
					bind:checked={agreed}
					required
					onchange={() => clearFeedback()}
				/>
			</ReFormSection>

			{#if error}
				<InlineAlert tone="error" title="Permohonan belum lengkap" message={error} />
			{/if}
			{#if saved}
				<InlineAlert tone="success" title="Permohonan tersimpan" message={config.successMessage ?? 'Data permohonan telah disimpan.'} />
			{/if}

			<FormActions message="Lengkapi seluruh kolom wajib sebelum menyimpan.">
				<ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton>
			</FormActions>
		</Stack>
	</form>
</PageLayout>

<style>
	.full-row {
		grid-column: 1 / -1;
	}

	@media (max-width: 700px) {
		.full-row {
			grid-column: auto;
		}
	}
</style>
