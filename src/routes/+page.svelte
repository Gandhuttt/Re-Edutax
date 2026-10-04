<script lang="ts">
	import { AppHeader, NavLink, ReUiRoot } from '$lib/re-ui-components';

	const registrationUrl = 'https://bit.ly/BrevetEdutaxindo';

	const subjects = [
		{
			code: '01',
			name: 'KUP Basic',
			description: 'Pahami fondasi kewajiban pajak dari pendaftaran sampai pelaporan.'
		},
		{
			code: '02',
			name: 'PPh Potong/Pungut',
			description: 'Latihan membuat bukti potong dan menyusun SPT Masa.'
		},
		{
			code: '03',
			name: 'PPh Orang Pribadi & Badan',
			description: 'Hitung kewajiban dan kerjakan alur SPT Tahunan.'
		},
		{
			code: '04',
			name: 'PPN & PPnBM',
			description: 'Kenali transaksi, faktur pajak, dan pelaporan SPT Masa PPN.'
		},
		{
			code: '05',
			name: 'Akuntansi Pajak',
			description: 'Hubungkan laporan keuangan dengan rekonsiliasi fiskal.'
		},
		{
			code: '06',
			name: 'Praktik Coretax',
			description: 'Simulasikan proses administrasi dan pelaporan di Coretax.'
		}
	] as const;

	const learningSteps = [
		{
			number: '01',
			title: 'Pahami alurnya',
			description: 'Mulai dari konsep yang langsung dihubungkan dengan pekerjaan pajak sehari-hari.'
		},
		{
			number: '02',
			title: 'Kerjakan kasusnya',
			description: 'Latih penghitungan dan penyiapan dokumen melalui contoh kasus.'
		},
		{
			number: '03',
			title: 'Praktikkan pelaporannya',
			description: 'Susun hasil kerja dan ikuti alur pelaporan menggunakan Coretax.'
		}
	] as const;

	const audiences = [
		['Mahasiswa & pelajar', 'Bangun keterampilan praktis sebelum masuk dunia kerja.'],
		['Fresh graduate', 'Tambah kesiapan untuk posisi pajak, akuntansi, dan keuangan.'],
		['Staf administrasi', 'Rapikan pemahaman atas pekerjaan pajak yang rutin dikerjakan.'],
		['Pemilik usaha', 'Pahami proses agar administrasi perpajakan lebih terkendali.']
	] as const;

	const legalDocuments = [
		{
			label: 'Badan hukum terdaftar',
			title: 'PT WSD Edutaxindo Praktika',
			statement:
				'PT WSD Edutaxindo Praktika telah terdaftar sebagai badan hukum pada Direktorat Jenderal Administrasi Hukum Umum.',
			issuer: 'Kementerian Hukum dan HAM Republik Indonesia',
			number: 'AHU-064885.AH.01.30.Tahun 2023',
			note: 'Terdaftar sejak 17 September 2023'
		},
		{
			label: 'Lembaga kursus berizin',
			title: 'LKP WSD Edutaxindo Praktika',
			statement:
				'LKP WSD Edutaxindo Praktika memiliki izin penyelenggaraan Satuan Pendidikan Nonformal Lembaga Kursus dan Pelatihan.',
			issuer: 'DPMPTSP Kabupaten Banyumas',
			number: 'Keputusan Nomor 503/002/DPMPTSP/LKP-B/2024',
			note: 'Ditetapkan 20 September 2024'
		}
	] as const;

	const schedules = [
		{
			label: 'Kelas utama',
			title: 'Weekday · Batch 19',
			date: 'Mulai 23 November',
			detail: 'Early bird sampai 1 November',
			price: '',
			cta: 'Daftar Batch 19',
			featured: true
		},
		{
			label: 'Weekday class',
			title: 'Batch 18',
			date: 'Mulai Senin, 19 Oktober',
			detail: 'Pilihan jadwal lebih awal',
			price: '',
			cta: 'Daftar Batch 18',
			featured: false
		},
		{
			label: 'Weekend · Jakarta',
			title: 'Kelas tatap muka',
			date: 'Mulai 28 November',
			detail: 'Tebet Timur, Jakarta Selatan',
			price: 'Rp1,75 juta',
			cta: 'Daftar kelas Jakarta',
			featured: false
		}
	] as const;
</script>

<svelte:head>
	<title>Brevet Pajak Praktik A & B | EduTax</title>
	<meta
		name="description"
		content="Belajar Brevet Pajak A & B melalui contoh kasus, praktik Coretax, dan latihan pelaporan bersama EduTax."
	/>
</svelte:head>

<ReUiRoot class="landing-root">
	<a class="skip-link" href="#main-content">Lewati ke konten utama</a>

	<div class="landing-header">
		<AppHeader
			brand="EduTax"
			subtitle="Brevet Pajak Praktik"
			mark="ET"
			homeHref="/"
			homeLabel="EduTax — beranda"
			contentWidth="1240px"
		>
			{#snippet navigation()}
				<NavLink href="#program">Program</NavLink>
				<NavLink href="#pengalaman">Cara belajar</NavLink>
				<NavLink href="#jadwal">Jadwal</NavLink>
			{/snippet}
			{#snippet account()}
				<a class="header-cta" href={registrationUrl}>
					<span class="desktop-label">Daftar kelas</span>
					<span class="mobile-label">Daftar</span>
					<span aria-hidden="true">↗</span>
				</a>
			{/snippet}
		</AppHeader>
	</div>

	<main id="main-content">
		<section class="hero" aria-labelledby="hero-title">
			<div class="hero-copy">
				<p class="eyebrow"><span></span> Brevet Pajak A &amp; B berbasis praktik</p>
				<h1 id="hero-title">Belajar pajak dengan cara <em>mengerjakannya.</em></h1>
				<p class="hero-lede">
					Bukan hanya menghafal aturan. Pahami alurnya, kerjakan contoh kasus, lalu praktikkan
					pelaporannya di Coretax.
				</p>

				<div class="hero-actions">
					<a class="button button-primary" href={registrationUrl}>
						Daftar Batch 19 <span aria-hidden="true">→</span>
					</a>
					<a class="text-link" href="#program">Lihat isi program <span aria-hidden="true">↓</span></a>
				</div>

				<ul class="hero-highlights" aria-label="Fokus pembelajaran">
					<li>
						<strong>Kasus nyata</strong>
						<span>Latihan yang dekat dengan pekerjaan</span>
					</li>
					<li>
						<strong>Praktik Coretax</strong>
						<span>Ikuti alur administrasi dan pelaporan</span>
					</li>
					<li>
						<strong>Hasil kerja</strong>
						<span>Susun latihan sebagai portofolio SPT</span>
					</li>
				</ul>
			</div>

			<div class="hero-visual">
				<div class="image-frame">
					<img
						src="/landing/classroom-session.png"
						alt="Peserta EduTax mengikuti sesi praktik Brevet Pajak"
					/>
				</div>
				<article class="batch-card">
					<span class="status-dot"></span>
					<div>
						<p>Pendaftaran dibuka</p>
						<strong>Batch 19 · 23 November</strong>
					</div>
					<a href={registrationUrl} aria-label="Daftar Brevet Pajak Batch 19">↗</a>
				</article>
				<div class="visual-note">
					<strong>A &amp; B</strong>
					<span>Konsep, kasus, aplikasi</span>
				</div>
			</div>
		</section>

		<section class="promise-strip" aria-label="Pendekatan belajar EduTax">
			<p>Belajar untuk bisa mengerjakan, bukan sekadar tahu.</p>
			<div>
				<span>01 — Pahami</span>
				<span>02 — Hitung</span>
				<span>03 — Siapkan</span>
				<span>04 — Laporkan</span>
			</div>
		</section>

		<section id="program" class="section program-section" aria-labelledby="program-title">
			<div class="section-heading">
				<div>
					<p class="eyebrow"><span></span> Isi program</p>
					<h2 id="program-title">Fondasi lengkap.<br />Latihan yang terarah.</h2>
				</div>
				<p>
					Enam materi inti dirangkai mengikuti pekerjaan administrasi dan pelaporan pajak,
					sehingga setiap konsep memiliki konteks penggunaannya.
				</p>
			</div>

			<div class="subject-list">
				{#each subjects as subject}
					<article class="subject-item">
						<span class="subject-code">{subject.code}</span>
						<div>
							<h3>{subject.name}</h3>
							<p>{subject.description}</p>
						</div>
						<span class="subject-arrow" aria-hidden="true">↗</span>
					</article>
				{/each}
			</div>
		</section>

		<section id="pengalaman" class="experience-section" aria-labelledby="experience-title">
			<div class="experience-gallery">
				<figure class="gallery-main">
					<img
						src="/landing/classroom-group.png"
						alt="Peserta EduTax mengerjakan latihan aplikasi bersama"
					/>
				</figure>
				<figure class="gallery-secondary">
					<img
						src="/landing/classroom-coretax.png"
						alt="Peserta dan instruktur dalam kelas Brevet Pajak EduTax"
					/>
				</figure>
				<p class="gallery-caption">Ruang belajar untuk mencoba, bertanya, dan menyelesaikan kasus.</p>
			</div>

			<div class="experience-copy">
				<p class="eyebrow eyebrow-light"><span></span> Pengalaman belajar</p>
				<h2 id="experience-title">Dari penjelasan menuju pekerjaan nyata.</h2>
				<p class="experience-lede">
					Setiap tahap membantu Anda menghubungkan aturan perpajakan dengan proses yang benar-benar
					dikerjakan.
				</p>

				<ol class="learning-steps">
					{#each learningSteps as step}
						<li>
							<span>{step.number}</span>
							<div>
								<h3>{step.title}</h3>
								<p>{step.description}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</section>

		<section class="section audience-section" aria-labelledby="audience-title">
			<div class="section-heading audience-heading">
				<div>
					<p class="eyebrow"><span></span> Untuk siapa</p>
					<h2 id="audience-title">Mulai dari posisi Anda sekarang.</h2>
				</div>
				<p>
					Program dirancang untuk peserta yang ingin lebih percaya diri menghadapi pekerjaan pajak.
				</p>
			</div>

			<div class="audience-grid">
				{#each audiences as [title, description], index}
					<article>
						<span>{String(index + 1).padStart(2, '0')}</span>
						<h3>{title}</h3>
						<p>{description}</p>
					</article>
				{/each}
			</div>
		</section>

		<section id="legalitas" class="section legal-section" aria-labelledby="legal-title">
			<div class="section-heading legal-heading">
				<div>
					<p class="eyebrow"><span></span> Legalitas EduTax</p>
					<h2 id="legal-title">Identitas jelas.<br />Legalitas tercatat.</h2>
				</div>
				<p>
					EduTax diselenggarakan oleh badan hukum terdaftar dan memiliki izin penyelenggaraan
					satuan pendidikan nonformal. Informasi berikut merujuk pada dokumen resmi EduTax.
				</p>
			</div>

			<div class="legal-grid">
				{#each legalDocuments as document}
					<article class="legal-card">
						<div class="legal-card-heading">
							<span class="legal-seal" aria-hidden="true">✓</span>
							<div>
								<p class="legal-label">{document.label}</p>
								<h3>{document.title}</h3>
							</div>
						</div>

						<p class="legal-statement">{document.statement}</p>

						<dl class="legal-meta">
							<div>
								<dt>Penerbit</dt>
								<dd>{document.issuer}</dd>
							</div>
							<div>
								<dt>Nomor dokumen</dt>
								<dd>{document.number}</dd>
							</div>
							<div>
								<dt>Keterangan</dt>
								<dd>{document.note}</dd>
							</div>
						</dl>

					</article>
				{/each}
			</div>
		</section>

		<section id="jadwal" class="section schedule-section" aria-labelledby="schedule-title">
			<div class="section-heading">
				<div>
					<p class="eyebrow"><span></span> Jadwal kelas</p>
					<h2 id="schedule-title">Pilih waktu belajar Anda.</h2>
				</div>
				<p>Daftar lebih awal untuk mengamankan tempat pada kelas yang paling sesuai.</p>
			</div>

			<div class="schedule-grid">
				{#each schedules as schedule}
					<article class:featured={schedule.featured} class="schedule-card">
						<div>
							<p class="schedule-label">{schedule.label}</p>
							<h3>{schedule.title}</h3>
							<strong class="schedule-date">{schedule.date}</strong>
							<p class="schedule-detail">{schedule.detail}</p>
						</div>
						{#if schedule.price}
							<p class="schedule-price">
								<strong>{schedule.price}</strong>
								<span>Early bird · Normal Rp2,45 juta</span>
							</p>
						{/if}
						<a href={registrationUrl}>{schedule.cta} <span aria-hidden="true">→</span></a>
					</article>
				{/each}
			</div>
		</section>

		<section id="pendampingan" class="business-section" aria-labelledby="business-title">
			<div class="business-intro">
				<p class="eyebrow eyebrow-light"><span></span> Untuk pemilik usaha</p>
				<h2 id="business-title">Butuh bantuan untuk administrasi pajak usaha?</h2>
			</div>
			<div class="business-copy">
				<p>
					EduTax juga mendampingi UMKM dan usaha menengah untuk menata rutinitas administrasi
					perpajakan dari bulan ke bulan.
				</p>
				<ul>
					<li>Penataan data dan dokumen</li>
					<li>Administrasi pajak bulanan</li>
					<li>Persiapan penghitungan dan pelaporan</li>
					<li>Diskusi kendala administrasi</li>
				</ul>
				<a class="button button-light" href={registrationUrl}>
					Konsultasikan kebutuhan <span aria-hidden="true">→</span>
				</a>
			</div>
		</section>

		<section class="final-cta" aria-labelledby="final-cta-title">
			<div>
				<p class="eyebrow"><span></span> Batch berikutnya</p>
				<h2 id="final-cta-title">Siap belajar pajak lewat praktik?</h2>
				<p>Mulai kelas Brevet Pajak A &amp; B bersama EduTax.</p>
			</div>
			<a class="button button-primary" href={registrationUrl}>
				Daftar Batch 19 <span aria-hidden="true">→</span>
			</a>
		</section>
	</main>

	<footer class="site-footer">
		<div class="footer-inner">
			<a class="brand footer-brand" href="/" aria-label="EduTax — beranda">
				<span class="brand-mark" aria-hidden="true">E</span>
				<span class="brand-copy"><strong>EduTax</strong><small>Brevet Pajak Praktik</small></span>
			</a>
			<p>Belajar pajak untuk bisa mengerjakannya.</p>
			<div>
				<a href="#program">Program</a>
				<a href="#jadwal">Jadwal</a>
				<a href="#pendampingan">Pendampingan usaha</a>
			</div>
		</div>
	</footer>
</ReUiRoot>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		background: #f6f4ee;
	}

	:global(.landing-root) {
		--landing-navy: #112d4a;
		--landing-navy-deep: #0a2036;
		--landing-blue: #274d6f;
		--landing-gold: #e9b936;
		--landing-gold-soft: #fff3c8;
		--landing-cream: #f6f4ee;
		--landing-paper: #fffdfa;
		--landing-ink: #132536;
		--landing-muted: #5f6d78;
		--landing-line: #d9ddd9;
		overflow: hidden;
		background: var(--landing-cream);
		color: var(--landing-ink);
		font-family: Arial, Helvetica, sans-serif;
		line-height: 1.5;
	}

	:global(.landing-root *) {
		box-sizing: border-box;
	}

	.skip-link {
		position: fixed;
		z-index: 100;
		top: 12px;
		left: 12px;
		padding: 10px 16px;
		transform: translateY(-150%);
		border-radius: 999px;
		background: white;
		color: var(--landing-navy);
		font-weight: 700;
	}

	.skip-link:focus {
		transform: translateY(0);
	}

	.landing-header {
		position: relative;
		z-index: 20;
		animation: header-enter 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.hero,
	.promise-strip,
	.section,
	.experience-section,
	.business-section,
	.final-cta,
	.footer-inner {
		width: min(1240px, calc(100% - 48px));
		margin-inline: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 11px;
		color: var(--landing-navy);
		text-decoration: none;
	}

	.brand-mark {
		display: grid;
		width: 38px;
		height: 38px;
		place-items: center;
		border-radius: 11px;
		background: var(--landing-navy);
		color: var(--landing-gold);
		font: 700 19px Georgia, serif;
	}

	.brand-copy strong,
	.brand-copy small {
		display: block;
	}

	.brand-copy strong {
		font: 700 19px Georgia, serif;
		letter-spacing: -0.02em;
	}

	.brand-copy small {
		margin-top: 1px;
		color: var(--landing-muted);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}


	.site-footer a {
		color: var(--landing-navy);
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
	}

	.site-footer a:hover {
		color: var(--landing-blue);
	}

	.header-cta {
		display: inline-flex;
		min-height: 38px;
		align-items: center;
		gap: 12px;
		padding: 7px 15px;
		border: 1px solid var(--landing-gold);
		border-radius: 3px;
		background: var(--landing-gold);
		color: var(--landing-navy-deep);
		font-size: 12px;
		font-weight: 800;
		text-decoration: none;
		transition:
			background-color 160ms ease,
			transform 160ms ease;
	}

	.header-cta:hover {
		transform: translateY(-1px);
		background: #f4c542;
	}

	.mobile-label {
		display: none;
	}

	.hero {
		display: grid;
		min-height: 660px;
		grid-template-columns: minmax(0, 1.02fr) minmax(420px, 0.98fr);
		align-items: center;
		gap: clamp(48px, 7vw, 96px);
		padding-block: 68px 78px;
	}

	.hero-copy {
		position: relative;
		z-index: 2;
	}

	.hero-copy > * {
		opacity: 0;
		animation: fade-up 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	.hero-copy > :nth-child(1) {
		animation-delay: 80ms;
	}

	.hero-copy > :nth-child(2) {
		animation-delay: 140ms;
	}

	.hero-copy > :nth-child(3) {
		animation-delay: 200ms;
	}

	.hero-copy > :nth-child(4) {
		animation-delay: 260ms;
	}

	.hero-copy > :nth-child(5) {
		animation-delay: 320ms;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 20px;
		color: #7d5d08;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	.eyebrow > span {
		display: inline-block;
		width: 28px;
		height: 2px;
		background: var(--landing-gold);
	}

	.hero h1,
	.section-heading h2,
	.experience-copy h2,
	.business-intro h2,
	.final-cta h2 {
		margin: 0;
		color: var(--landing-navy-deep);
		font-family: Georgia, 'Times New Roman', serif;
		font-weight: 500;
		letter-spacing: -0.045em;
	}

	.hero h1 {
		max-width: 720px;
		font-size: clamp(52px, 5.6vw, 82px);
		line-height: 0.99;
	}

	.hero h1 em {
		color: var(--landing-blue);
		font-weight: inherit;
	}

	.hero-lede {
		max-width: 590px;
		margin: 26px 0 0;
		color: var(--landing-muted);
		font-size: 18px;
		line-height: 1.7;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 22px;
		margin-top: 32px;
	}

	.button {
		display: inline-flex;
		min-height: 52px;
		align-items: center;
		justify-content: center;
		gap: 24px;
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 800;
		text-decoration: none;
		transition:
			transform 160ms ease,
			background-color 160ms ease;
	}

	.button span,
	.header-cta > span:last-child,
	.schedule-card > a span {
		transition: transform 160ms ease;
	}

	.button:hover span,
	.header-cta:hover > span:last-child,
	.schedule-card > a:hover span {
		transform: translateX(4px);
	}

	.button:hover {
		transform: translateY(-2px);
	}

	.button-primary {
		background: var(--landing-navy);
		color: white;
		box-shadow: 0 10px 24px rgba(17, 45, 74, 0.18);
	}

	.button-primary:hover {
		background: var(--landing-navy-deep);
	}

	.text-link {
		color: var(--landing-navy);
		font-size: 14px;
		font-weight: 800;
		text-underline-offset: 5px;
	}

	.hero-highlights {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
		margin: 48px 0 0;
		padding: 24px 0 0;
		border-top: 1px solid var(--landing-line);
		list-style: none;
	}

	.hero-highlights li {
		min-width: 0;
	}

	.hero-highlights strong,
	.hero-highlights span {
		display: block;
	}

	.hero-highlights strong {
		color: var(--landing-navy);
		font-size: 13px;
	}

	.hero-highlights span {
		margin-top: 5px;
		color: var(--landing-muted);
		font-size: 11px;
		line-height: 1.45;
	}

	.hero-visual {
		position: relative;
		min-height: 540px;
		opacity: 0;
		animation: visual-enter 760ms 160ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	.hero-visual::before {
		position: absolute;
		inset: 8% -14% -5% 18%;
		background-image: radial-gradient(circle, rgba(17, 45, 74, 0.19) 1.4px, transparent 1.5px);
		background-size: 16px 16px;
		content: '';
	}

	.image-frame {
		position: absolute;
		inset: 0 0 56px 40px;
		overflow: hidden;
		border-radius: 160px 12px 12px;
		background: var(--landing-navy);
		box-shadow: 0 28px 60px rgba(17, 45, 74, 0.2);
	}

	.image-frame::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 58%, rgba(10, 32, 54, 0.25));
		content: '';
	}

	.image-frame img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.hero-visual:hover .image-frame img {
		transform: scale(1.025);
	}

	.batch-card {
		position: absolute;
		z-index: 2;
		right: -28px;
		bottom: 10px;
		display: flex;
		width: min(390px, calc(100% - 12px));
		align-items: center;
		gap: 12px;
		padding: 18px;
		border-radius: 12px;
		background: white;
		box-shadow: 0 18px 46px rgba(17, 45, 74, 0.2);
	}

	.status-dot {
		width: 10px;
		height: 10px;
		flex: 0 0 auto;
		border-radius: 50%;
		background: #4e8b62;
		box-shadow: 0 0 0 6px #eaf3ec;
		animation: status-pulse 2.8s ease-out infinite;
	}

	.batch-card div {
		min-width: 0;
	}

	.batch-card p,
	.batch-card strong {
		display: block;
		margin: 0;
	}

	.batch-card p {
		color: var(--landing-muted);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.batch-card strong {
		margin-top: 3px;
		color: var(--landing-navy);
		font-size: 14px;
	}

	.batch-card a {
		display: grid;
		width: 38px;
		height: 38px;
		margin-left: auto;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 50%;
		background: var(--landing-gold);
		color: var(--landing-navy);
		font-weight: 900;
		text-decoration: none;
	}

	.visual-note {
		position: absolute;
		z-index: 2;
		top: 38px;
		left: 0;
		display: grid;
		padding: 14px 18px;
		border-radius: 8px;
		background: var(--landing-gold);
		color: var(--landing-navy-deep);
		box-shadow: 0 12px 30px rgba(17, 45, 74, 0.14);
	}

	.visual-note strong {
		font: 700 25px Georgia, serif;
	}

	.visual-note span {
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	.promise-strip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 32px;
		padding-block: 24px;
		border-top: 1px solid var(--landing-line);
		border-bottom: 1px solid var(--landing-line);
		opacity: 0;
		animation: fade-up 620ms 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	.promise-strip p {
		margin: 0;
		color: var(--landing-navy);
		font: 500 20px Georgia, serif;
	}

	.promise-strip div {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 12px 28px;
	}

	.promise-strip span {
		color: var(--landing-muted);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.section {
		padding-block: 88px;
	}

	.section-heading {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
		align-items: end;
		gap: 64px;
		margin-bottom: 44px;
	}

	.section-heading h2,
	.experience-copy h2,
	.business-intro h2,
	.final-cta h2 {
		font-size: clamp(38px, 4.2vw, 58px);
		line-height: 1.06;
	}

	.section-heading > p,
	.experience-lede,
	.business-copy > p,
	.final-cta > div > p:last-child {
		margin: 0;
		color: var(--landing-muted);
		font-size: 15px;
		line-height: 1.75;
	}

	.subject-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-top: 1px solid var(--landing-line);
		border-left: 1px solid var(--landing-line);
	}

	.subject-item {
		display: grid;
		min-height: 150px;
		grid-template-columns: auto 1fr auto;
		gap: 22px;
		align-items: start;
		padding: 28px;
		border-right: 1px solid var(--landing-line);
		border-bottom: 1px solid var(--landing-line);
		background: rgba(255, 253, 250, 0.52);
		transition:
			background-color 180ms ease,
			box-shadow 180ms ease;
	}

	.subject-item:hover {
		position: relative;
		z-index: 1;
		background: var(--landing-paper);
		box-shadow: 0 12px 30px rgba(17, 45, 74, 0.08);
	}

	.subject-code {
		color: #8a6813;
		font-size: 10px;
		font-weight: 800;
	}

	.subject-item h3 {
		margin: -4px 0 8px;
		color: var(--landing-navy);
		font: 500 23px Georgia, serif;
		letter-spacing: -0.025em;
	}

	.subject-item p {
		max-width: 390px;
		margin: 0;
		color: var(--landing-muted);
		font-size: 13px;
		line-height: 1.55;
	}

	.subject-arrow {
		color: var(--landing-line);
		font-size: 18px;
		transition:
			color 160ms ease,
			transform 160ms ease;
	}

	.subject-item:hover .subject-arrow {
		transform: translate(3px, -3px);
		color: var(--landing-gold);
	}

	.experience-section {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
		min-height: 720px;
		background: var(--landing-navy-deep);
	}

	.experience-gallery {
		position: relative;
		min-height: 720px;
	}

	.experience-gallery figure {
		position: absolute;
		margin: 0;
		overflow: hidden;
	}

	.experience-gallery img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.experience-gallery:hover img {
		transform: scale(1.025);
	}

	.gallery-main {
		inset: 0 15% 90px -100vw;
	}

	.gallery-main img {
		object-position: right center;
	}

	.gallery-secondary {
		right: 0;
		bottom: 48px;
		width: 43%;
		height: 260px;
		border: 8px solid var(--landing-navy-deep);
	}

	.gallery-caption {
		position: absolute;
		z-index: 2;
		right: 43%;
		bottom: 0;
		max-width: 300px;
		margin: 0;
		padding: 18px 22px;
		background: var(--landing-gold);
		color: var(--landing-navy-deep);
		font: 500 16px/1.4 Georgia, serif;
	}

	.experience-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 64px clamp(52px, 5vw, 72px);
	}

	.eyebrow-light {
		color: #f5d776;
	}

	.experience-copy h2,
	.business-intro h2 {
		color: white;
	}

	.experience-lede {
		max-width: 510px;
		margin-top: 22px;
		color: #b7c6d2;
	}

	.learning-steps {
		margin: 34px 0 0;
		padding: 0;
		list-style: none;
	}

	.learning-steps li {
		display: grid;
		grid-template-columns: 40px 1fr;
		gap: 18px;
		padding: 22px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		transition: padding-left 180ms ease;
	}

	.learning-steps li:hover {
		padding-left: 6px;
	}

	.learning-steps > li > span {
		color: var(--landing-gold);
		font-size: 10px;
		font-weight: 800;
	}

	.learning-steps h3 {
		margin: -4px 0 6px;
		color: white;
		font-size: 16px;
	}

	.learning-steps p {
		max-width: 440px;
		margin: 0;
		color: #aebdca;
		font-size: 12px;
		line-height: 1.6;
	}

	.audience-section {
		padding: 88px 0 40px;
	}

	.audience-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1px;
		background: var(--landing-line);
		border: 1px solid var(--landing-line);
	}

	.audience-grid article {
		min-height: 225px;
		padding: 28px;
		background: var(--landing-paper);
	}

	.audience-grid article > span {
		color: #8a6813;
		font-size: 10px;
		font-weight: 800;
	}

	.audience-grid h3 {
		margin: 48px 0 12px;
		color: var(--landing-navy);
		font: 500 22px/1.2 Georgia, serif;
		letter-spacing: -0.02em;
	}

	.audience-grid p {
		margin: 0;
		color: var(--landing-muted);
		font-size: 12px;
		line-height: 1.55;
	}

	.legal-section {
		padding: 40px 0;
	}

	.legal-heading {
		margin-bottom: 34px;
	}

	.legal-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.legal-card {
		position: relative;
		display: flex;
		min-height: 300px;
		flex-direction: column;
		padding: 32px;
		overflow: hidden;
		border: 1px solid var(--landing-line);
		border-radius: 12px;
		background:
			linear-gradient(135deg, rgba(233, 185, 54, 0.08), transparent 36%),
			var(--landing-paper);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;
	}

	.legal-card::before {
		position: absolute;
		inset: 0 0 auto;
		height: 4px;
		background: var(--landing-navy);
		content: '';
	}

	.legal-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 18px 38px rgba(17, 45, 74, 0.1);
	}

	.legal-card-heading {
		display: grid;
		grid-template-columns: 46px 1fr;
		gap: 16px;
		align-items: start;
	}

	.legal-seal {
		display: grid;
		width: 46px;
		height: 46px;
		place-items: center;
		border: 1px solid rgba(17, 45, 74, 0.18);
		border-radius: 50%;
		background: var(--landing-gold-soft);
		color: var(--landing-navy);
		font-size: 18px;
		font-weight: 900;
	}

	.legal-label {
		margin: 0 0 7px;
		color: #80600e;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.legal-card h3 {
		margin: 0;
		color: var(--landing-navy);
		font: 500 24px/1.2 Georgia, serif;
		letter-spacing: -0.025em;
	}

	.legal-statement {
		max-width: 560px;
		margin: 24px 0 0;
		color: var(--landing-muted);
		font-size: 13px;
		line-height: 1.65;
	}

	.legal-meta {
		display: grid;
		gap: 13px;
		margin: auto 0 0;
		padding: 28px 0 0;
	}

	.legal-meta div {
		display: grid;
		grid-template-columns: 116px 1fr;
		gap: 16px;
	}

	.legal-meta dt {
		color: var(--landing-muted);
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.legal-meta dd {
		margin: 0;
		color: var(--landing-ink);
		font-size: 12px;
		line-height: 1.5;
	}


	.schedule-section {
		padding: 40px 0 88px;
	}

	.schedule-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr 1fr;
		gap: 16px;
	}

	.schedule-card {
		display: flex;
		min-height: 340px;
		flex-direction: column;
		padding: 30px;
		border: 1px solid var(--landing-line);
		border-radius: 12px;
		background: var(--landing-paper);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;
	}

	.schedule-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 18px 38px rgba(17, 45, 74, 0.11);
	}

	.schedule-card.featured {
		border-color: var(--landing-navy);
		background: var(--landing-navy);
		color: white;
		box-shadow: 0 18px 42px rgba(17, 45, 74, 0.16);
	}

	.schedule-label {
		margin: 0 0 34px;
		color: #8a6813;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.featured .schedule-label {
		color: #f5d776;
	}

	.schedule-card h3 {
		margin: 0 0 10px;
		color: var(--landing-navy);
		font: 500 26px Georgia, serif;
		letter-spacing: -0.025em;
	}

	.featured h3 {
		color: white;
	}

	.schedule-date {
		display: block;
		color: var(--landing-ink);
		font-size: 14px;
	}

	.featured .schedule-date {
		color: white;
	}

	.schedule-detail {
		margin: 7px 0 0;
		color: var(--landing-muted);
		font-size: 12px;
	}

	.featured .schedule-detail {
		color: #b7c6d2;
	}

	.schedule-price {
		margin: 26px 0 0;
	}

	.schedule-price strong,
	.schedule-price span {
		display: block;
	}

	.schedule-price strong {
		color: var(--landing-navy);
		font: 500 24px Georgia, serif;
	}

	.schedule-price span {
		margin-top: 3px;
		color: var(--landing-muted);
		font-size: 10px;
	}

	.schedule-card > a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
		padding-top: 20px;
		border-top: 1px solid var(--landing-line);
		color: var(--landing-navy);
		font-size: 13px;
		font-weight: 800;
		text-decoration: none;
	}

	.featured > a {
		border-color: rgba(255, 255, 255, 0.18);
		color: white;
	}

	.business-section {
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
		gap: 80px;
		padding: 72px;
		background: var(--landing-navy-deep);
		color: white;
	}

	.business-copy > p {
		color: #b7c6d2;
	}

	.business-copy ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px 24px;
		margin: 26px 0 32px;
		padding: 0;
		list-style: none;
	}

	.business-copy li {
		position: relative;
		padding-left: 18px;
		color: #d9e1e7;
		font-size: 12px;
	}

	.business-copy li::before {
		position: absolute;
		top: 0.7em;
		left: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--landing-gold);
		content: '';
	}

	.button-light {
		background: white;
		color: var(--landing-navy);
	}

	.final-cta {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 60px;
		padding-block: 88px;
	}

	.final-cta > div > p:last-child {
		margin-top: 18px;
	}

	.final-cta .button {
		flex: 0 0 auto;
	}

	.site-footer {
		border-top: 1px solid var(--landing-line);
	}

	.footer-inner {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 32px;
		padding-block: 36px;
	}

	.footer-inner > p {
		margin: 0;
		color: var(--landing-muted);
		font-size: 11px;
	}

	.footer-inner > div {
		display: flex;
		justify-content: flex-end;
		gap: 24px;
	}

	.footer-inner > div a {
		font-size: 11px;
	}

	a:focus-visible {
		outline: 3px solid var(--landing-gold);
		outline-offset: 4px;
	}

	@keyframes header-enter {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes visual-enter {
		from {
			opacity: 0;
			transform: translateY(18px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes status-pulse {
		0%,
		55%,
		100% {
			box-shadow: 0 0 0 6px #eaf3ec;
		}
		72% {
			box-shadow: 0 0 0 10px rgba(78, 139, 98, 0);
		}
	}

	@media (max-width: 1050px) {
		.hero {
			grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
			gap: 44px;
		}

		.hero-highlights {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		.hero-highlights span {
			display: none;
		}

		.audience-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.business-section {
			gap: 50px;
			padding: 56px;
		}
	}

	@media (max-width: 820px) {
		.hero,
		.promise-strip,
		.section,
		.experience-section,
		.business-section,
		.final-cta,
		.footer-inner {
			width: min(100% - 32px, 680px);
		}


		.hero {
			min-height: auto;
			grid-template-columns: 1fr;
			gap: 50px;
			padding-block: 54px 64px;
		}

		.hero-highlights {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.hero-highlights span {
			display: block;
		}

		.hero-visual {
			min-height: 520px;
		}

		.image-frame {
			inset: 0 24px 54px 24px;
		}

		.batch-card {
			right: 0;
		}

		.promise-strip {
			align-items: flex-start;
			flex-direction: column;
		}

		.promise-strip div {
			justify-content: flex-start;
		}

		.section {
			padding-block: 68px;
		}

		.audience-section {
			padding: 68px 0 32px;
		}

		.schedule-section {
			padding: 32px 0 68px;
		}

		.legal-section {
			padding: 32px 0;
		}

		.legal-grid {
			grid-template-columns: 1fr;
		}

		.legal-card {
			min-height: 310px;
		}

		.section-heading {
			grid-template-columns: 1fr;
			gap: 24px;
			margin-bottom: 34px;
		}

		.subject-list {
			grid-template-columns: 1fr;
		}

		.experience-section {
			display: flex;
			min-height: auto;
			flex-direction: column;
			padding-inline: 0;
		}

		.experience-gallery {
			width: 100%;
			min-height: 600px;
		}

		.gallery-main {
			inset: 0 0 82px;
		}

		.gallery-secondary {
			right: 16px;
		}

		.gallery-caption {
			right: 35%;
			left: 16px;
		}

		.experience-copy {
			padding: 64px 44px;
		}

		.schedule-grid {
			grid-template-columns: 1fr;
		}

		.schedule-card {
			min-height: 300px;
		}

		.business-section {
			grid-template-columns: 1fr;
			gap: 30px;
			padding: 56px 40px;
		}

		.final-cta {
			align-items: flex-start;
			flex-direction: column;
			padding-block: 68px;
		}

		.footer-inner {
			grid-template-columns: 1fr auto;
		}

		.footer-inner > p {
			display: none;
		}
	}

	@media (max-width: 560px) {
		.hero,
		.promise-strip,
		.section,
		.business-section,
		.final-cta,
		.footer-inner {
			width: calc(100% - 24px);
		}


		.brand-copy small {
			display: none;
		}

		.header-cta {
			min-height: 38px;
			gap: 8px;
			padding-inline: 13px;
		}

		.desktop-label {
			display: none;
		}

		.mobile-label {
			display: inline;
		}

		.hero {
			gap: 42px;
			padding-top: 44px;
		}


		.section.audience-section {
			padding: 56px 0 28px;
		}

		.section.schedule-section {
			padding: 28px 0 56px;
		}

		.section.legal-section {
			padding: 28px 0;
		}

		.legal-card {
			min-height: 0;
			padding: 24px;
		}

		.legal-card-heading {
			grid-template-columns: 40px 1fr;
			gap: 13px;
		}

		.legal-seal {
			width: 40px;
			height: 40px;
		}

		.legal-card h3 {
			font-size: 21px;
		}

		.legal-meta div {
			grid-template-columns: 1fr;
			gap: 3px;
		}


		.section-heading {
			margin-bottom: 30px;
		}


		.final-cta {
			padding-block: 56px;
		}

		.hero h1 {
			font-size: clamp(43px, 13vw, 60px);
		}

		.hero-lede {
			margin-top: 20px;
			font-size: 15px;
		}

		.hero-actions {
			align-items: flex-start;
			flex-direction: column;
			margin-top: 26px;
		}

		.hero-highlights {
			grid-template-columns: 1fr;
			margin-top: 34px;
		}

		.hero-highlights span {
			display: block;
		}

		.hero-visual {
			min-height: 430px;
		}

		.hero-visual::before {
			display: none;
		}

		.image-frame {
			inset: 0 0 48px;
			border-radius: 90px 10px 10px;
		}

		.visual-note {
			top: 22px;
			left: -4px;
		}

		.batch-card {
			right: 8px;
			width: calc(100% - 16px);
			padding: 14px;
		}

		.promise-strip {
			gap: 20px;
			padding-block: 22px;
		}

		.promise-strip div {
			display: grid;
			grid-template-columns: repeat(2, auto);
		}

		.section {
			padding-block: 56px;
		}

		.section-heading h2,
		.experience-copy h2,
		.business-intro h2,
		.final-cta h2 {
			font-size: 38px;
		}

		.subject-item {
			min-height: 0;
			grid-template-columns: 24px 1fr;
			gap: 14px;
			padding: 22px 18px;
		}

		.subject-arrow {
			display: none;
		}

		.subject-item h3 {
			font-size: 20px;
		}

		.experience-gallery {
			min-height: 480px;
		}

		.gallery-main {
			inset: 0 0 70px;
		}

		.gallery-secondary {
			right: 12px;
			bottom: 22px;
			width: 48%;
			height: 170px;
			border-width: 5px;
		}

		.gallery-caption {
			right: 42%;
			bottom: 0;
			left: 12px;
			padding: 14px;
			font-size: 13px;
		}

		.experience-copy {
			padding: 52px 28px;
		}

		.audience-grid {
			grid-template-columns: 1fr;
		}

		.audience-grid article {
			min-height: 180px;
			padding: 22px;
		}

		.audience-grid h3 {
			margin-top: 30px;
		}

		.schedule-card {
			min-height: 290px;
			padding: 24px;
		}

		.business-section {
			padding: 48px 24px;
		}

		.business-copy ul {
			grid-template-columns: 1fr;
		}

		.final-cta {
			gap: 34px;
		}

		.final-cta .button {
			width: 100%;
		}

		.footer-inner {
			grid-template-columns: 1fr;
		}

		.footer-inner > div {
			flex-wrap: wrap;
			justify-content: flex-start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}

		.landing-header,
		.hero-copy > *,
		.hero-visual,
		.promise-strip,
		.status-dot {
			opacity: 1;
			animation: none;
			transform: none;
		}

		.button,
		.button span,
		.header-cta,
		.header-cta > span:last-child,
		.image-frame img,
		.subject-item,
		.subject-arrow,
		.experience-gallery img,
		.learning-steps li,
		.schedule-card,
		.schedule-card > a span,
		.legal-card {
			transition: none;
		}
	}
</style>
