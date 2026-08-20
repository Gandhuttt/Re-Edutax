// Every Ya/Tidak row on the Induk renders a hint chip whose text depends on the
// answer. The hint is not a static helper: it is a per-answer routing message,
// so it belongs in the answer option data rather than as a field-level label.
//
// Transcribed verbatim from the live form, captured in
// docs/ui-reference/coretax/spt-1770-induk/HINTS.md. Two inconsistencies in
// DJP's own copy are preserved deliberately rather than normalised:
//
//   - lampiran naming: "lampiran I Bagian D" (roman) vs "lampiran 1 Bagian E"
//     (arabic) vs "Lampiran 4 Bagian A" (capitalised)
//   - spelling: "silahkan" on most rows, "silakan" on 14b and 14c
//
// Do not tidy these up. If our own labels should read differently that is a
// separate decision, made once, not by drifting the transcription.

export interface Hint {
	ya: string;
	tidak: string;
}

export const HINTS = {
	b1a: {
		ya: 'Ya, silahkan mengisi lampiran I Bagian D',
		tidak: 'Tidak, silahkan lanjut pertanyaan berikutnya'
	},
	b1b1: {
		ya: 'Ya, lanjutkan ke pertanyaan selanjutnya',
		tidak: 'Tidak, lanjutkan ke pertanyaan 1c'
	},
	b1c: {
		ya: 'Ya, silahkan mengisi lampiran 3A-4 Bagian B',
		tidak: 'Tidak, lanjutkan ke pertanyaan 1d'
	},
	b1d: {
		ya: 'Ya, silahkan mengisi lampiran 2 Bagian C',
		tidak: 'Tidak, silahkan lanjut pertanyaan berikutnya'
	},
	c3: {
		ya: 'Ya, silahkan mengisi lampiran 5 Bagian A dan/atau B',
		tidak: 'Tidak, silahkan lanjut pertanyaan berikutnya'
	},
	c8: {
		ya: 'Ya, silahkan mengisi lampiran 5 Bagian C',
		tidak: 'Tidak, silahkan lanjut pertanyaan berikutnya'
	},
	d10a: {
		ya: 'Ya, silahkan mengisi lampiran 1 Bagian E',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	d10d: {
		ya: 'Ya, lengkapi bagian ini dengan jumlah pengembalian/pengurangan yang Anda terima',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	h13a: {
		// Not navigation: this states how the value is computed, and the formula is
		// implemented as angsuranPph25TahunDepan in hitungPphOrangPribadi.ts.
		//
		// The 12 is a placeholder. Coretax builds this string as
		// notif13aLabel + numberOfMonth + notif13aFormula, so the divisor is the
		// period length; H.svelte overrides `ya` with the real one.
		ya: 'Ya, Angsuran PPh Pasal 25 adalah 1/12 x ((9) – (10)(a))',
		tidak: 'Tidak, silahkan lanjut pertanyaan berikutnya'
	},
	h13b: {
		ya: 'Ya, silahkan mengisi Lampiran 4 Bagian A',
		tidak: 'Tidak, silahkan lanjut pertanyaan berikutnya'
	},
	h13c: {
		ya: 'Ya, angsuran PPh Pasal 25 saya adalah 0.75% dari penghasilan bruto setiap bulan dari masing-masing tempat usaha.',
		tidak: 'Tidak, tidak ada kewajiban untuk membayar angsuran pajak penghasilan Pasal 25'
	},
	i14b: {
		ya: 'Ya, silakan mengisi lampiran 1 Bagian B',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	i14c: {
		ya: 'Ya, silakan mengisi lampiran 2 Bagian A',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	i14d: {
		ya: 'Ya, silahkan mengisi lampiran 2 Bagian B',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	// 14.e and 14.f are answerable only under the gates documented in I.svelte,
	// so these chips were missing for as long as both rows were hardcoded
	// disabled. Text taken from the Coretax bundle, where the pair sits directly
	// between 14.d's and 14.g's; HINTS_DISABLED repeats the `tidak` string.
	i14e: {
		ya: 'Ya, silahkan mengisi lampiran 3C',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	i14f: {
		ya: 'Ya, silahkan mengisi lampiran 3D',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	},
	i14g: {
		// Routes nowhere; it is a compliance reminder rather than navigation.
		ya: 'Pastikan Anda sudah menyampaikan laporan realisasi investasi secara terpisah.',
		tidak: 'Tidak, lanjutkan ke pertanyaan berikutnya'
	}
} as const satisfies Record<string, Hint>;

// Rows that are disabled yet still assert an answer in their hint. 11b is the
// clearest case: neither Ya nor Tidak can be selected, but the chip reads as a
// stated Tidak.
export const HINTS_DISABLED = {
	e11b: 'Tidak. Saya tidak memilikinya',
	i14e: 'Tidak, lanjutkan ke pertanyaan berikutnya',
	i14f: 'Tidak, lanjutkan ke pertanyaan berikutnya',
	ja: 'Tidak, jenis pembukuan adalah Pembukuan Sederhana.',
	jb: 'Tidak ada berkas yang perlu dilampirkan',
	jc: 'Tidak ada berkas yang perlu dilampirkan'
} as const;
