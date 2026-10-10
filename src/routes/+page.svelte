<script lang="ts">
	import {
		AppHeader,
		BulletList,
		CredentialCard,
		CtaBand,
		DisplayHeading,
		FeatureImage,
		LinkButton,
		NavLink,
		NumberedGrid,
		OfferCard,
		ReUiRoot,
		ResponsiveGrid,
		SiteFooter,
		SiteSection,
		SplitLayout,
		Stack,
		StatementStrip,
		StepList
	} from '$lib/re-ui-components';

	const registrationUrl = 'https://bit.ly/BrevetEdutaxindo';

	const subjects = [
		{
			title: 'KUP Basic',
			description: 'Pahami fondasi kewajiban pajak dari pendaftaran sampai pelaporan.'
		},
		{
			title: 'PPh Potong/Pungut',
			description: 'Latihan membuat bukti potong dan menyusun SPT Masa.'
		},
		{
			title: 'PPh Orang Pribadi & Badan',
			description: 'Hitung kewajiban dan kerjakan alur SPT Tahunan.'
		},
		{
			title: 'PPN & PPnBM',
			description: 'Kenali transaksi, faktur pajak, dan pelaporan SPT Masa PPN.'
		},
		{
			title: 'Akuntansi Pajak',
			description: 'Hubungkan laporan keuangan dengan rekonsiliasi fiskal.'
		},
		{
			title: 'Praktik Coretax',
			description: 'Simulasikan proses administrasi dan pelaporan di Coretax.'
		}
	] as const;

	const learningSteps = [
		{
			title: 'Pahami alurnya',
			description: 'Mulai dari konsep yang langsung dihubungkan dengan pekerjaan pajak sehari-hari.'
		},
		{
			title: 'Kerjakan kasusnya',
			description: 'Latih penghitungan dan penyiapan dokumen melalui contoh kasus.'
		},
		{
			title: 'Praktikkan pelaporannya',
			description: 'Susun hasil kerja dan ikuti alur pelaporan menggunakan Coretax.'
		}
	] as const;

	const audiences = [
		{
			title: 'Mahasiswa & pelajar',
			description: 'Bangun keterampilan praktis sebelum masuk dunia kerja.'
		},
		{
			title: 'Fresh graduate',
			description: 'Tambah kesiapan untuk posisi pajak, akuntansi, dan keuangan.'
		},
		{
			title: 'Staf administrasi',
			description: 'Rapikan pemahaman atas pekerjaan pajak yang rutin dikerjakan.'
		},
		{
			title: 'Pemilik usaha',
			description: 'Pahami proses agar administrasi perpajakan lebih terkendali.'
		}
	] as const;

	const highlights = [
		{ title: 'Kasus nyata', description: 'Latihan yang dekat dengan pekerjaan.' },
		{ title: 'Praktik Coretax', description: 'Ikuti alur administrasi dan pelaporan.' },
		{ title: 'Hasil kerja', description: 'Susun latihan sebagai portofolio SPT.' }
	] as const;

	const legalDocuments = [
		{
			label: 'Badan hukum terdaftar',
			title: 'PT WSD Edutaxindo Praktika',
			statement:
				'PT WSD Edutaxindo Praktika telah terdaftar sebagai badan hukum pada Direktorat Jenderal Administrasi Hukum Umum.',
			details: [
				{ label: 'Penerbit', value: 'Kementerian Hukum dan HAM Republik Indonesia' },
				{ label: 'Nomor dokumen', value: 'AHU-064885.AH.01.30.Tahun 2023' },
				{ label: 'Keterangan', value: 'Terdaftar sejak 17 September 2023' }
			]
		},
		{
			label: 'Lembaga kursus berizin',
			title: 'LKP WSD Edutaxindo Praktika',
			statement:
				'LKP WSD Edutaxindo Praktika memiliki izin penyelenggaraan Satuan Pendidikan Nonformal Lembaga Kursus dan Pelatihan.',
			details: [
				{ label: 'Penerbit', value: 'DPMPTSP Kabupaten Banyumas' },
				{ label: 'Nomor dokumen', value: 'Keputusan Nomor 503/002/DPMPTSP/LKP-B/2024' },
				{ label: 'Keterangan', value: 'Ditetapkan 20 September 2024' }
			]
		}
	];

	const schedules = [
		{
			label: 'Kelas utama',
			title: 'Weekday · Batch 19',
			schedule: 'Mulai 23 November',
			detail: 'Early bird sampai 1 November',
			cta: 'Daftar Batch 19',
			featured: true
		},
		{
			label: 'Weekday class',
			title: 'Batch 18',
			schedule: 'Mulai Senin, 19 Oktober',
			detail: 'Pilihan jadwal lebih awal',
			cta: 'Daftar Batch 18'
		},
		{
			label: 'Weekend · Jakarta',
			title: 'Kelas tatap muka',
			schedule: 'Mulai 28 November',
			detail: 'Tebet Timur, Jakarta Selatan',
			price: 'Rp1,75 juta',
			priceNote: 'Early bird · Normal Rp2,45 juta',
			cta: 'Daftar kelas Jakarta'
		}
	] as const;

	const nextBatch = schedules[0];

	const businessServices = [
		'Penataan data dan dokumen',
		'Administrasi pajak bulanan',
		'Persiapan penghitungan dan pelaporan',
		'Diskusi kendala administrasi'
	];

	const footerLinks = [
		{ label: 'Program', href: '#program' },
		{ label: 'Legalitas', href: '#legalitas' },
		{ label: 'Jadwal', href: '#jadwal' },
		{ label: 'Pendampingan usaha', href: '#pendampingan' }
	];
</script>

<svelte:head>
	<title>Brevet Pajak Praktik A & B | Edutaxindo Praktika</title>
	<meta
		name="description"
		content="Belajar Brevet Pajak A & B melalui contoh kasus, praktik Coretax, dan latihan pelaporan bersama Edutaxindo Praktika."
	/>
</svelte:head>

<ReUiRoot style="--ui-canvas: #f5f2ea">
	<AppHeader
		brand="Edutaxindo Praktika"
		subtitle="Brevet Pajak Praktik"
		logoSrc="/brand/wsd-mark-inverse.svg"
		homeHref="/"
		homeLabel="Edutaxindo Praktika — beranda"
		contentWidth="1240px"
		sticky
		skipLinkTarget="#main-content"
	>
		{#snippet navigation()}
			<NavLink href="#program">Program</NavLink>
			<NavLink href="#pengalaman">Cara belajar</NavLink>
			<NavLink href="#legalitas">Legalitas</NavLink>
			<NavLink href="#jadwal">Jadwal</NavLink>
		{/snippet}
		{#snippet account()}
			<LinkButton href={registrationUrl} tone="accent" size="sm" icon="↗" shortLabel="Daftar">
				Daftar kelas
			</LinkButton>
		{/snippet}
	</AppHeader>

	<main id="main-content" tabindex="-1">
		<SiteSection spacing="lg" aria-labelledby="hero-title">
			<SplitLayout columns="minmax(0, 1.2fr) minmax(320px, 0.8fr)">
				{#snippet start()}
					<DisplayHeading
						level={1}
						size="hero"
						headingId="hero-title"
						eyebrow="Brevet Pajak A & B berbasis praktik"
						title="Belajar pajak dengan cara"
						emphasis="mengerjakannya."
						description="Bukan hanya menghafal aturan. Pahami alurnya, kerjakan contoh kasus, lalu praktikkan pelaporannya di Coretax."
					>
						<Stack direction="horizontal" wrap align="center" gap="16px 28px">
							<LinkButton href={registrationUrl}>{nextBatch.cta}</LinkButton>
							<LinkButton href="#program" tone="text" icon="↓">Lihat isi program</LinkButton>
						</Stack>
					</DisplayHeading>
				{/snippet}
				{#snippet end()}
					<OfferCard
						featured
						live
						label="Pendaftaran dibuka"
						title={nextBatch.title}
						schedule={nextBatch.schedule}
						detail={nextBatch.detail}
						href={registrationUrl}
						actionLabel={nextBatch.cta}
					>
						<BulletList items={highlights} />
					</OfferCard>
				{/snippet}
			</SplitLayout>
		</SiteSection>

		<SiteSection spacing="none" aria-label="Suasana kelas Edutaxindo Praktika">
			<Stack gap="32px">
				<FeatureImage
					src="/landing/classroom-session.png"
					alt="Peserta Edutaxindo Praktika mengikuti sesi praktik Brevet Pajak"
					width={722}
					height={153}
					caption="Brevet A & B — konsep, kasus, aplikasi"
					zoom={1.1}
					priority
				/>
				<StatementStrip
					statement="Belajar untuk bisa mengerjakan, bukan sekadar tahu."
					items={['Pahami', 'Hitung', 'Siapkan', 'Laporkan']}
					itemsLabel="Tahapan belajar"
				/>
			</Stack>
		</SiteSection>

		<SiteSection id="program" spacing="lg" aria-labelledby="program-title">
			<Stack gap="44px">
				<DisplayHeading
					layout="split"
					headingId="program-title"
					eyebrow="Isi program"
					title={'Fondasi lengkap.\nLatihan yang terarah.'}
					description="Enam materi inti dirangkai mengikuti pekerjaan administrasi dan pelaporan pajak, sehingga setiap konsep memiliki konteks penggunaannya."
				/>
				<NumberedGrid items={subjects} columns={3} />
			</Stack>
		</SiteSection>

		<SiteSection id="pengalaman" tone="inverse" spacing="lg" aria-labelledby="experience-title">
			<SplitLayout columns="minmax(0, 0.95fr) minmax(0, 1.05fr)">
				{#snippet start()}
					<Stack gap="16px">
						<FeatureImage
							src="/landing/classroom-group.png"
							alt="Peserta Edutaxindo Praktika mengerjakan latihan aplikasi bersama"
							width={240}
							height={120}
						/>
						<FeatureImage
							src="/landing/classroom-coretax.png"
							alt="Peserta dan instruktur dalam kelas Brevet Pajak Edutaxindo Praktika"
							width={240}
							height={120}
							caption="Ruang belajar untuk mencoba, bertanya, dan menyelesaikan kasus."
						/>
					</Stack>
				{/snippet}
				{#snippet end()}
					<Stack gap="36px">
						<DisplayHeading
							headingId="experience-title"
							eyebrow="Pengalaman belajar"
							title="Dari penjelasan menuju pekerjaan nyata."
							description="Setiap tahap membantu Anda menghubungkan aturan perpajakan dengan proses yang benar-benar dikerjakan."
						/>
						<StepList items={learningSteps} />
					</Stack>
				{/snippet}
			</SplitLayout>
		</SiteSection>

		<SiteSection spacing="lg" aria-labelledby="audience-title">
			<Stack gap="44px">
				<DisplayHeading
					layout="split"
					headingId="audience-title"
					eyebrow="Untuk siapa"
					title="Mulai dari posisi Anda sekarang."
					description="Program dirancang untuk peserta yang ingin lebih percaya diri menghadapi pekerjaan pajak."
				/>
				<NumberedGrid items={audiences} columns={4} />
			</Stack>
		</SiteSection>

		<SiteSection id="legalitas" tone="paper" spacing="lg" aria-labelledby="legal-title">
			<Stack gap="44px">
				<DisplayHeading
					layout="split"
					headingId="legal-title"
					eyebrow="Legalitas lembaga"
					title={'Identitas jelas.\nLegalitas tercatat.'}
					description="Edutaxindo Praktika diselenggarakan oleh badan hukum terdaftar dan memiliki izin penyelenggaraan satuan pendidikan nonformal. Informasi berikut merujuk pada dokumen resmi lembaga."
				/>
				<ResponsiveGrid columns={2} gap="16px">
					{#each legalDocuments as document}
						<CredentialCard {...document} />
					{/each}
				</ResponsiveGrid>
			</Stack>
		</SiteSection>

		<SiteSection id="jadwal" spacing="lg" aria-labelledby="schedule-title">
			<Stack gap="44px">
				<DisplayHeading
					layout="split"
					headingId="schedule-title"
					eyebrow="Jadwal kelas"
					title="Pilih waktu belajar Anda."
					description="Daftar lebih awal untuk mengamankan tempat pada kelas yang paling sesuai."
				/>
				<ResponsiveGrid columns={3} gap="16px">
					{#each schedules as { cta, ...schedule }}
						<OfferCard {...schedule} href={registrationUrl} actionLabel={cta} />
					{/each}
				</ResponsiveGrid>
			</Stack>
		</SiteSection>

		<SiteSection id="pendampingan" spacing="none" aria-labelledby="business-title">
			<CtaBand
				tone="inverse"
				headingId="business-title"
				eyebrow="Untuk pemilik usaha"
				title="Butuh bantuan untuk administrasi pajak usaha?"
				description="Edutaxindo Praktika juga mendampingi UMKM dan usaha menengah untuk menata rutinitas administrasi perpajakan dari bulan ke bulan."
			>
				<BulletList items={businessServices} columns={2} />
				{#snippet action()}
					<LinkButton href={registrationUrl} tone="inverse">Konsultasikan kebutuhan</LinkButton>
				{/snippet}
			</CtaBand>
		</SiteSection>

		<SiteSection spacing="lg" aria-labelledby="final-cta-title">
			<CtaBand
				tone="accent"
				headingId="final-cta-title"
				eyebrow="Batch berikutnya"
				title="Siap belajar pajak lewat praktik?"
				description="Mulai kelas Brevet Pajak A & B bersama Edutaxindo Praktika."
			>
				{#snippet action()}
					<LinkButton href={registrationUrl}>{nextBatch.cta}</LinkButton>
				{/snippet}
			</CtaBand>
		</SiteSection>
	</main>

	<SiteFooter
		brand="Edutaxindo Praktika"
		subtitle="Brevet Pajak Praktik"
		logoSrc="/brand/wsd-mark-inverse.svg"
		homeLabel="Edutaxindo Praktika — beranda"
		tagline="Belajar pajak untuk bisa mengerjakannya."
		links={footerLinks}
		legal={`© ${new Date().getFullYear()} PT WSD Edutaxindo Praktika`}
	/>
</ReUiRoot>
