<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import Accordion from '$lib/components/AccordionItem.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import Table from '$lib/components/Table.svelte';
	import Induk from './components/Induk/_Induk.svelte';
	import L1 from './components/L1/_L1.svelte';
	import L2 from './components/L2/_L2.svelte';
	import L3 from './components/L3/_L3.svelte';
	import L4 from './components/L4/_L4.svelte';
	import L5 from './components/L5/_L5.svelte';
	import L6 from './components/L6/_L6.svelte';
	import L7 from './components/L7/_L7.svelte';
	import L8 from './components/L8/_L8.svelte';
	import L9 from './components/L9/_L9.svelte';
	import L10A from './components/L10-A/_L10A.svelte';
	import L10B from './components/L10-B/_L10B.svelte';
	import L10C from './components/L10-C/_L10C.svelte';
	import L10D from './components/L10-D/_L10D.svelte';
	import L11A from './components/L11-A/_L11A.svelte';
	import L11B from './components/L11-B/_L11B.svelte';
	import L13A from './components/L13-A/_L13A.svelte';
	import L13B from './components/L13-B/_L13B.svelte';
	import L13C from './components/L13-C/_L13C.svelte';
	import L14 from './components/L14/_L14.svelte';
	import { getSptPphBadan } from './getSptPphBadan.remote';
	import { getOpiniAuditor } from './components/Induk/getOpiniAuditor.remote';
	import { getSektorUsaha } from './components/Induk/getSektorUsaha.remote';
	import { getNegara } from './components/L2/getNegara.remote';
	import { getKodeKoreksiFiskal } from './components/L1/getKodeKoreksiFiskal.remote';
	import { getLampiran1LabaRugiTemplates } from './components/L1/getLampiran1LabaRugiTemplates.remote';
	import { getLampiran1NeracaTemplates } from './components/L1/getLampiran1NeracaTemplates.remote';
	import { getJenisPenghasilanKreditPajakLuarNegeri } from './components/L3/getJenisPenghasilanKreditPajakLuarNegeri.remote';
	import { getMataUang } from './components/L3/getMataUang.remote';
	import { getJenisPajakDipotongDipungut } from './components/L3/getJenisPajakDipotongDipungut.remote';
	import { getObjekPajak } from './components/L4/getObjekPajak.remote';
	import { getJenisPenghasilanBukanObjekPajak } from './components/L4/getJenisPenghasilanBukanObjekPajak.remote';
	import { hitungFasilitas31E } from './components/L8/fasilitas31e';
	import { computeLabaRugiRows } from './components/L1/labaRugiRollup';
	import { computeIndukDEF, computePenghasilanKenaPajak } from './components/Induk/computeIndukDEF';
	import { getJenisHarta } from './components/L9/getJenisHarta.remote';
	import { getMetodePenyusutan } from './components/L9/getMetodePenyusutan.remote';
	import { getBentukHubungan } from './components/L10-A/getBentukHubungan.remote';
	import { getJenisTransaksi } from './components/L10-A/getJenisTransaksi.remote';
	import { getMetodeHargaTransfer } from './components/L10-A/getMetodeHargaTransfer.remote';
	import { saveSptPphBadan } from './saveSptPphBadan.remote';

	const {
		readonly,
		spt,
		lampiran1,
		lampiran2,
		lampiran3,
		lampiran4,
		lampiran5,
		lampiran6,
		lampiran7,
		lampiran8,
		lampiran9,
		lampiran10a,
		lampiran10b,
		lampiran10c,
		lampiran10d,
		lampiran13b
	} = await getSptPphBadan();
	const opiniAuditorOptions = await getOpiniAuditor();
	const sektorUsahaOptions = await getSektorUsaha();
	const negaraOptions = await getNegara();
	const kodeKoreksiFiskalOptions = await getKodeKoreksiFiskal();
	const lampiran1LabaRugiTemplates = await getLampiran1LabaRugiTemplates();
	const lampiran1NeracaTemplates = await getLampiran1NeracaTemplates();
	const jenisPenghasilanKreditPajakLuarNegeriOptions = await getJenisPenghasilanKreditPajakLuarNegeri();
	const mataUangOptions = await getMataUang();
	const jenisPajakDipotongDipungutOptions = await getJenisPajakDipotongDipungut();
	const objekPajakOptions = await getObjekPajak();
	const jenisPenghasilanBukanObjekPajakOptions = await getJenisPenghasilanBukanObjekPajak();
	const jenisHartaOptions = await getJenisHarta();
	const metodePenyusutanOptions = await getMetodePenyusutan();
	const bentukHubunganOptions = await getBentukHubungan();
	const jenisTransaksiOptions = await getJenisTransaksi();
	const metodeHargaTransferOptions = await getMetodeHargaTransfer();
	const saveForm = saveSptPphBadan.for(spt.id);

	const lampiran1LabaRugiTemplatesBySektor = new Map<
		string,
		{ lampiranKode: string | null; rows: typeof lampiran1LabaRugiTemplates }
	>();
	for (const row of lampiran1LabaRugiTemplates) {
		const entry = lampiran1LabaRugiTemplatesBySektor.get(row.sektorUsahaKode) ?? {
			lampiranKode: row.lampiranKode,
			rows: []
		};
		entry.rows.push(row);
		lampiran1LabaRugiTemplatesBySektor.set(row.sektorUsahaKode, entry);
	}

	const lampiran1NeracaTemplatesBySektor = new Map<string, { rows: typeof lampiran1NeracaTemplates }>();
	for (const row of lampiran1NeracaTemplates) {
		const entry = lampiran1NeracaTemplatesBySektor.get(row.sektorUsahaKode) ?? { rows: [] };
		entry.rows.push(row);
		lampiran1NeracaTemplatesBySektor.set(row.sektorUsahaKode, entry);
	}

	let sektorUsaha = $state(spt.sektorUsahaKode ?? '');

	let labaRugi = $state(
		lampiran1.nilai.map((row) => ({
			id: row.id,
			akunId: row.akunId,
			nilaiKomersial: row.nilaiKomersial,
			nonObjekPajak: row.nonObjekPajak,
			dikenakanPphFinal: row.dikenakanPphFinal,
			penyesuaianFiskalPositif: row.penyesuaianFiskalPositif,
			penyesuaianFiskalNegatif: row.penyesuaianFiskalNegatif,
			kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
		}))
	);

	let neraca = $state(
		lampiran1.neraca.map((row) => ({
			id: row.id,
			akunId: row.akunId,
			nilai: row.nilai
		}))
	);

	let l2a = $state(
		lampiran2.pemegangSaham.map((row) => ({
			id: row.id,
			nama: row.nama,
			alamat: row.alamat,
			negara: row.negaraKode ?? '',
			npwp: row.npwp,
			jabatan: row.jabatan,
			nilaiModal: row.nilaiModal,
			persentase: row.persentase,
			dividen: row.dividen
		}))
	);
	let l2b = $state(
		lampiran2.penyertaanModal.map((row) => ({
			id: row.id,
			nama: row.nama,
			negara: row.negaraKode ?? '',
			npwp: row.npwp,
			modalNilai: row.modalNilai,
			modalPersen: row.modalPersen,
			utangNilai: row.utangNilai,
			utangTahun: row.utangTahun ?? 0,
			utangBunga: row.utangBunga,
			piutangNilai: row.piutangNilai,
			piutangTahun: row.piutangTahun ?? 0,
			piutangBunga: row.piutangBunga
		}))
	);

	let l3a = $state(
		lampiran3.penghasilanLuarNegeri.map((row) => ({
			id: row.id,
			namaPemberiPenghasilan: row.namaPemberiPenghasilan,
			negara: row.negaraKode,
			tanggal: row.tanggal,
			jenisPenghasilan: row.jenisPenghasilanKode,
			penghasilanNeto: row.penghasilanNeto,
			pphLuarNegeri: row.pphLuarNegeri,
			mataUang: row.mataUangKode,
			pphLuarNegeriMataUangAsing: row.pphLuarNegeriMataUangAsing,
			kreditPajakYangDapatDikreditkan: row.kreditPajakYangDapatDikreditkan,
			keterangan: row.keterangan
		}))
	);

	let l3aPengembalianPengurangan = $state(lampiran3.pengembalianPenguranganPphLuarNegeriTahunSebelumnya);

	let l3b = $state(
		lampiran3.pphDipotong.map((row) => ({
			id: row.id,
			namaPemotongPemungut: row.namaPemotongPemungut,
			npwp: row.npwp,
			jenisPajak: row.jenisPajakKode,
			dpp: row.dpp,
			pph: row.pph,
			nomorBukti: row.nomorBukti,
			tanggalBukti: row.tanggalBukti
		}))
	);

	let l4a = $state(
		lampiran4.penghasilanFinal.map((row) => ({
			id: row.id,
			npwpPemotongPemungutPenyetor: row.npwpPemotongPemungutPenyetor,
			namaPemotongPemungutPenyetor: row.namaPemotongPemungutPenyetor,
			objekPajak: row.objekPajakKode,
			dasarPengenaanPajak: row.dasarPengenaanPajak,
			tarif: row.tarif,
			pphFinalTerutang: row.pphFinalTerutang,
			nomorBuktiPotong: row.nomorBuktiPotong,
			tanggalBuktiPotong: row.tanggalBuktiPotong ?? '',
			keterangan: row.keterangan
		}))
	);

	let l4b = $state(
		lampiran4.bukanObjekPajak.map((row) => ({
			id: row.id,
			jenisPenghasilan: row.jenisPenghasilanKode,
			sumberPenghasilan: row.sumberPenghasilan,
			penghasilanBruto: row.penghasilanBruto
		}))
	);

	let l5a = $state(
		lampiran5.tku.map((t) => ({
			id: t.id,
			nitku: t.nitku,
			nama: t.nama,
			alamat: t.alamat,
			kelurahan: t.kelurahan,
			kecamatan: t.kecamatan,
			kabupaten: t.kabupaten,
			provinsi: t.provinsi,
			bulanan: Array.from({ length: 12 }, (_, i) => {
				const bulan = i + 1;
				const existing = lampiran5.bulanan.find((b) => b.tkuId === t.id && b.bulan === bulan);
				return {
					bulan,
					jumlahPeredaranBruto: existing?.jumlahPeredaranBruto ?? 0
				};
			})
		}))
	);

	let l5bDipotong = $state(
		Array.from({ length: 12 }, (_, i) => {
			const bulan = i + 1;
			const existing = lampiran5.dipotongBulanan.find((b) => b.bulan === bulan);
			return { bulan, nilai: existing?.nilai ?? 0 };
		})
	);

	let l6DasarAngsuran = $state(lampiran6.dasarAngsuran);
	let l6KompensasiKerugian = $state(lampiran6.kompensasiKerugian);
	let l6PphTerutang = $state(lampiran6.pphTerutang);
	let l6KreditPajakTahunLalu = $state(lampiran6.kreditPajakTahunLalu);
	let l6KompensasiKerugianTouched = $state(false);
	let l6PphTerutangTouched = $state(false);

	let l7 = $state(lampiran7.map((row) => ({ ...row })));

	let l8JumlahPeredaranBruto = $state(lampiran8.jumlahPeredaranBruto);

	let l9 = $state(
		lampiran9.rows.map((row) => ({
			id: row.id,
			kelompokPenyusutan: row.kelompokPenyusutan,
			jenisHarta: row.jenisHartaKode,
			kodeHarta: row.kodeHarta,
			bulanTahunPerolehan: row.bulanTahunPerolehan,
			hargaPerolehan: row.hargaPerolehan,
			nilaiSisaBukuFiskalAwalTahun: row.nilaiSisaBukuFiskalAwalTahun,
			metodePenyusutanKomersial: row.metodePenyusutanKomersial,
			metodePenyusutanFiskal: row.metodePenyusutanFiskal,
			penyusutanAmortisasiFiskalTahunIni: row.penyusutanAmortisasiFiskalTahunIni,
			penyusutanAmortisasiKomersialTahunIni: row.penyusutanAmortisasiKomersialTahunIni,
			akumulasiPenyusutanAmortisasiFiskal: row.akumulasiPenyusutanAmortisasiFiskal,
			nilaiSisaBukuFiskalAkhirTahun: row.nilaiSisaBukuFiskalAkhirTahun,
			keterangan: row.keterangan
		}))
	);

	let l9AJumlahPenyusutanKomersial = $state(lampiran9.jumlahPenyusutanKomersialA);
	let l9BJumlahPenyusutanKomersial = $state(lampiran9.jumlahPenyusutanKomersialB);
	let l9CJumlahAmortisasiKomersial = $state(lampiran9.jumlahAmortisasiKomersialC);

	let l10a = $state(
		lampiran10a.map((row) => ({
			id: row.id,
			nama: row.nama,
			npwpTin: row.npwpTin,
			negara: row.negaraKode,
			bentukHubungan: row.bentukHubunganKode,
			kegiatanUsaha: row.kegiatanUsaha,
			jenisTransaksi: row.jenisTransaksiKode,
			nilaiTransaksi: row.nilaiTransaksi,
			metodePenentuanHargaTransfer: row.metodePenentuanHargaTransferKode,
			alasanPenggunaanMetode: row.alasanPenggunaanMetode
		}))
	);

	let l10bHubunganA = $state(Boolean(lampiran10b.hubunganA));
	let l10bHubunganB = $state(Boolean(lampiran10b.hubunganB));
	let l10bHubunganC = $state(Boolean(lampiran10b.hubunganC));
	let l10bHubunganD = $state(Boolean(lampiran10b.hubunganD));
	let l10bTransaksiA = $state(Boolean(lampiran10b.transaksiA));
	let l10bTransaksiB = $state(Boolean(lampiran10b.transaksiB));
	let l10bTransaksiC = $state(Boolean(lampiran10b.transaksiC));
	let l10bDokumentasiA = $state(Boolean(lampiran10b.dokumentasiA));
	let l10bDokumentasiB = $state(Boolean(lampiran10b.dokumentasiB));
	let l10bDokumentasiC = $state(Boolean(lampiran10b.dokumentasiC));
	let l10bDokumentasiD = $state(Boolean(lampiran10b.dokumentasiD));
	let l10bDokumentasiE = $state(Boolean(lampiran10b.dokumentasiE));
	let l10bDokumenA = $state(Boolean(lampiran10b.dokumenA));
	let l10bDokumenB = $state(Boolean(lampiran10b.dokumenB));
	let l10bDokumenC = $state(Boolean(lampiran10b.dokumenC));

	let l10c = $state(
		lampiran10c.rows.map((row) => ({
			id: row.id,
			namaMitraTransaksi: row.namaMitraTransaksi,
			jenisTransaksi: row.jenisTransaksiKode,
			negara: row.negaraKode,
			nilaiTransaksi: row.nilaiTransaksi
		}))
	);

	let l10cDitentukanPrinsip = $state(Boolean(lampiran10c.ditentukanPrinsip));

	let l10dDokumenIndukA = $state(Boolean(lampiran10d.dokumenIndukA));
	let l10dDokumenIndukB = $state(Boolean(lampiran10d.dokumenIndukB));
	let l10dDokumenIndukC = $state(Boolean(lampiran10d.dokumenIndukC));
	let l10dDokumenIndukD = $state(Boolean(lampiran10d.dokumenIndukD));
	let l10dDokumenIndukE = $state(Boolean(lampiran10d.dokumenIndukE));
	let l10dDokumenLokalA = $state(Boolean(lampiran10d.dokumenLokalA));
	let l10dDokumenLokalB = $state(Boolean(lampiran10d.dokumenLokalB));
	let l10dDokumenLokalC = $state(Boolean(lampiran10d.dokumenLokalC));
	let l10dDokumenLokalD = $state(Boolean(lampiran10d.dokumenLokalD));
	let l10dDokumenLokalE = $state(Boolean(lampiran10d.dokumenLokalE));
	let l10dTanggalDokumenIndukTersedia = $state(lampiran10d.tanggalDokumenIndukTersedia);
	let l10dTanggalDokumenLokalTersedia = $state(lampiran10d.tanggalDokumenLokalTersedia);

	let l13bA = $state(
		lampiran13b.a.map((row) => ({
			id: row.id,
			perjanjianNomor: row.perjanjianNomor,
			perjanjianTanggal: row.perjanjianTanggal,
			mitraKegiatan: row.mitraKegiatan,
			keterangan: row.keterangan
		}))
	);

	let l13bB = $state(lampiran13b.b.map((row) => ({ ...row })));

	let l13bC = $state(
		lampiran13b.c.map((row) => ({
			id: row.id,
			nomorProposal: row.nomorProposal,
			jangkaWaktuDariTahun: row.jangkaWaktuDariTahun,
			jangkaWaktuSampaiTahun: row.jangkaWaktuSampaiTahun,
			jumlahBiaya: row.jumlahBiaya,
			tahunPerolehanHki: row.tahunPerolehanHki,
			persentaseFasilitasPajak: row.persentaseFasilitasPajak
		}))
	);

	let l13bDTermanfaatkanTahunSebelumnya = $state(lampiran13b.d.termanfaatkanTahunSebelumnya);

	let l6KompensasiKerugianAuto = $derived(
		l7.reduce((sum, row) => sum + Number(row.kompensasiTahunIni || 0), 0)
	);

	$effect(() => {
		if (!l6KompensasiKerugianTouched) {
			l6KompensasiKerugian = l6KompensasiKerugianAuto;
		}
	});

	let menerimaPenghasilanPp23 = $state(Boolean(spt.menerimaPenghasilanPp23));
	let hanyaPenghasilanPp23 = $state(Boolean(spt.hanyaPenghasilanPp23));
	let menerimaPenghasilanFinal = $state(Boolean(spt.menerimaPenghasilanFinal));
	let menerimaPenghasilanBukanObjekPajak = $state(Boolean(spt.menerimaPenghasilanBukanObjekPajak));
	let diaudit = $state(Boolean(spt.opiniAuditorKode));

	let d5FasilitasPenanamanModal = $state(Boolean(spt.d5FasilitasPenanamanModal));
	let d6FasilitasBrutoVokasi = $state(Boolean(spt.d6FasilitasBrutoVokasi));
	let d8AdaKompensasiKerugian = $state(Boolean(spt.d8AdaKompensasiKerugian));
	let d10FasilitasBrutoLitbang = $state(Boolean(spt.d10FasilitasBrutoLitbang));
	let tarifPajak = $state(spt.tarifPajak ?? 'pasal_17_1_b');
	let persentaseTarifLainnya = $state(spt.persentaseTarifLainnya ?? 0);
	let e13AdaKreditPajakLuarNegeri = $state(Boolean(spt.e13AdaKreditPajakLuarNegeri));
	let e14AngsuranPph25TahunBerjalan = $state(spt.e14AngsuranPph25TahunBerjalan ?? 0);
	let e15StpPph25 = $state(spt.e15StpPph25 ?? 0);
	let e16FasilitasPenguranganPphTerutang = $state(Boolean(spt.e16FasilitasPenguranganPphTerutang));
	let f17bAdaSkPengangsuranPenundaan = $state(Boolean(spt.f17bAdaSkPengangsuranPenundaan));
	let f17bJumlahDiangsurDitunda = $state(spt.f17bJumlahDiangsurDitunda ?? 0);
	let f19aMetodePengembalian = $state(spt.f19aMetodePengembalian === 'pengembalian_pendahuluan');
	let g20WajibLaporAngsuranPph25 = $state(Boolean(spt.g20WajibLaporAngsuranPph25));

	let d4Live = $derived.by(() => {
		const template = lampiran1LabaRugiTemplatesBySektor.get(sektorUsaha)?.rows ?? [];
		const rows = computeLabaRugiRows(
			template,
			labaRugi.map((row) => ({
				akunId: row.akunId,
				nilaiKomersial: Number(row.nilaiKomersial),
				nonObjekPajak: Number(row.nonObjekPajak),
				dikenakanPphFinal: Number(row.dikenakanPphFinal),
				penyesuaianFiskalPositif: Number(row.penyesuaianFiskalPositif),
				penyesuaianFiskalNegatif: Number(row.penyesuaianFiskalNegatif),
				kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
			}))
		);
		return rows.find((row) => row.kode === '4800')?.nilaiFiskal ?? 0;
	});

	let d9Live = $derived(
		computePenghasilanKenaPajak({
			netoFiskalSebelumFasilitas: d4Live,
			d6FasilitasBrutoVokasi,
			l13bBNilai: l13bB.map((row) => Number(row.nilai)),
			d8AdaKompensasiKerugian,
			l7KompensasiTahunIni: l7.map((row) => Number(row.kompensasiTahunIni))
		}).d9
	);

	let l8PenghasilanKenaPajak = $derived(d9Live);

	let l8Hasil = $derived(hitungFasilitas31E(Number(l8JumlahPeredaranBruto || 0), Number(l8PenghasilanKenaPajak || 0)));

	$effect(() => {
		if (!l6PphTerutangTouched) {
			l6PphTerutang = l8Hasil.pphTerutangJumlah;
		}
	});

	let indukDEF = $derived(
		computeIndukDEF({
			netoFiskalSebelumFasilitas: d4Live,
			d6FasilitasBrutoVokasi,
			l13bBNilai: l13bB.map((row) => Number(row.nilai)),
			d8AdaKompensasiKerugian,
			l7KompensasiTahunIni: l7.map((row) => Number(row.kompensasiTahunIni)),
			d10FasilitasBrutoLitbang,
			l13bC: l13bC.map((row) => ({
				jumlahBiaya: Number(row.jumlahBiaya),
				persentaseFasilitasPajak: Number(row.persentaseFasilitasPajak)
			})),
			l13bDTermanfaatkanTahunSebelumnya: Number(l13bDTermanfaatkanTahunSebelumnya),
			tarifPajak: tarifPajak as 'pasal_17_1_b' | 'pasal_17_2b' | 'pasal_31e' | 'lainnya',
			persentaseTarifLainnya: Number(persentaseTarifLainnya),
			l8JumlahPeredaranBruto: Number(l8JumlahPeredaranBruto),
			l8PenghasilanKenaPajak: Number(l8PenghasilanKenaPajak),
			e13AdaKreditPajakLuarNegeri,
			l3aKreditPajak: l3a.map((row) => Number(row.kreditPajakYangDapatDikreditkan)),
			l3bPph: l3b.map((row) => Number(row.pph)),
			e14AngsuranPph25TahunBerjalan: Number(e14AngsuranPph25TahunBerjalan),
			e15StpPph25: Number(e15StpPph25),
			f17bAdaSkPengangsuranPenundaan,
			f17bJumlahDiangsurDitunda: Number(f17bJumlahDiangsurDitunda)
		})
	);

	let f18a = $derived(spt.pembetulanKe > 0 ? (spt.previousPphKurangLebihBayar ?? 0) : 0);
	let f18b = $derived(indukDEF.f17c - f18a);

	let h21aTransaksiHubunganIstimewa = $state(Boolean(spt.h21aTransaksiHubunganIstimewa));
	let h21bDokumenPenentuanHargaTransfer = $state(Boolean(spt.h21bDokumenPenentuanHargaTransfer));
	let h21cPenanamanModalAfiliasi = $state(Boolean(spt.h21cPenanamanModalAfiliasi));
	let h21dUtangPiutangAfiliasi = $state(Boolean(spt.h21dUtangPiutangAfiliasi));
	let h21ePenyusutanAmortisasiFiskal = $state(Boolean(spt.h21ePenyusutanAmortisasiFiskal));
	let h21fBiayaEntertainment = $state(Boolean(spt.h21fBiayaEntertainment));
	let h21gFasilitasPenanamanModalDaerahTertentu = $state(Boolean(spt.h21gFasilitasPenanamanModalDaerahTertentu));
	let h21hSisaLebihSaranaPrasarana = $state(Boolean(spt.h21hSisaLebihSaranaPrasarana));
	let h21iDividenLuarNegeri = $state(Boolean(spt.h21iDividenLuarNegeri));
	let pernyataanBenar = $state(false);
	let penandatangan = $state('wajib-pajak');
	let currentTab = $state({
		tab: 'Induk',
		title: ''
	});
	let saveError = $state('');

	const tabs = ['Induk', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10-A', 'L10-B', 'L10-C', 'L10-D', 'L11-A', 'L11-B', 'L13-A', 'L13-B', 'L13-C', 'L14'];
	const tabLabel = (tab: string) => {
		if (tab !== 'L1') return tab;
		const lampiranKode = lampiran1LabaRugiTemplatesBySektor.get(sektorUsaha)?.lampiranKode;
		return `L1${lampiranKode ? `-${lampiranKode}` : ''}`;
	};

	// Some lampiran only apply when the corresponding Induk question is answered "Ya" -
	// tabs without an entry here are always applicable. L2 is also conditional per Induk H
	// (21.c/21.d) but isn't gated here: that condition only applies to its "Bagian B"
	// sub-section, and gating the whole tab would also hide "Bagian A", which is
	// unconditional. L11-A/L13-A/L13-C/L14 are gated below even though L13-A/L14 are still
	// static stubs with no working save/get and L13-C doesn't exist as a component at all yet
	// - hiding a tab doesn't require the form behind it to be functional (see
	// spt_pph_badan_induk_def_status memory). L11-B ("Penghitungan Biaya Pinjaman" -
	// thin-cap/EBITDA interest limitation) has no gating question anywhere in Induk yet, so
	// it's left ungated (always visible) rather than guessed.
	const tabVisibility: Partial<Record<string, () => boolean>> = {
		L3: () => e13AdaKreditPajakLuarNegeri,
		L4: () => menerimaPenghasilanFinal || menerimaPenghasilanBukanObjekPajak,
		L5: () => menerimaPenghasilanPp23,
		L7: () => d8AdaKompensasiKerugian,
		'L13-B': () => d6FasilitasBrutoVokasi || d10FasilitasBrutoLitbang,
		'L10-A': () => h21aTransaksiHubunganIstimewa,
		'L10-B': () => h21aTransaksiHubunganIstimewa,
		'L10-C': () => h21aTransaksiHubunganIstimewa,
		'L10-D': () => h21bDokumenPenentuanHargaTransfer,
		L9: () => h21ePenyusutanAmortisasiFiskal,
		'L11-A': () => h21fBiayaEntertainment,
		'L13-A': () => d5FasilitasPenanamanModal || h21gFasilitasPenanamanModalDaerahTertentu,
		'L13-C': () => e16FasilitasPenguranganPphTerutang,
		L14: () => h21hSisaLebihSaranaPrasarana
	};

	let visibleTabs = $derived(tabs.filter((tab) => (tabVisibility[tab] ?? (() => true))()));

	$effect(() => {
		if (!visibleTabs.includes(currentTab.tab)) {
			currentTab.tab = 'Induk';
		}
	});
</script>

<div class="tw:w-full tw:p-10">
	<Card>
		{#snippet head()}
			<div class="tw:flex tw:w-full tw:items-center tw:justify-between">
				<span class="tw:text-2xl">SPT Tahunan PPh Badan</span>
				<span class="tw:text-sm">Tahun Pajak {spt.tahunPajak}</span>
			</div>
		{/snippet}
		{#snippet body()}
			<form
				novalidate
				onkeydown={(e) => {
					if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
						e.preventDefault();
					}
				}}
				{...saveForm.enhance(async (form) => {
					saveError = '';

					try {
						if (await form.submit()) {
							await tick();
							form.element.reset();
						} else {
							const issues = form.fields.allIssues();
							saveError = issues?.length
								? issues.map((issue) => issue.message).join('; ')
								: 'Periksa kembali data yang diisi.';
						}
					} catch (e) {
						console.error(e);
						saveError = isHttpError(e)
							? e.body.message
							: e instanceof Error
								? e.message
								: 'Gagal menyimpan SPT PPh Badan.';
					}
				})}
			>
				<input type="hidden" name="labaRugi" value={JSON.stringify(labaRugi)} />
				<input type="hidden" name="neraca" value={JSON.stringify(neraca)} />
				<input type="hidden" name="l2a" value={JSON.stringify(l2a)} />
				<input type="hidden" name="l2b" value={JSON.stringify(l2b)} />
				<input type="hidden" name="l3a" value={JSON.stringify(l3a)} />
				<input type="hidden" name="l3aPengembalianPengurangan" value={l3aPengembalianPengurangan} />
				<input type="hidden" name="l3b" value={JSON.stringify(l3b)} />
				<input type="hidden" name="l4a" value={JSON.stringify(l4a)} />
				<input type="hidden" name="l4b" value={JSON.stringify(l4b)} />
				<input type="hidden" name="l5a" value={JSON.stringify(l5a)} />
				<input type="hidden" name="l5bDipotong" value={JSON.stringify(l5bDipotong)} />
				<input type="hidden" name="l6DasarAngsuran" value={l6DasarAngsuran} />
				<input type="hidden" name="l6KompensasiKerugian" value={l6KompensasiKerugian} />
				<input type="hidden" name="l6PphTerutang" value={l6PphTerutang} />
				<input type="hidden" name="l6KreditPajakTahunLalu" value={l6KreditPajakTahunLalu} />
				<input type="hidden" name="l7" value={JSON.stringify(l7)} />
				<input type="hidden" name="l8JumlahPeredaranBruto" value={l8JumlahPeredaranBruto} />
				<input type="hidden" name="l8PenghasilanKenaPajak" value={l8PenghasilanKenaPajak} />
				<input type="hidden" name="l9" value={JSON.stringify(l9)} />
				<input type="hidden" name="l9AJumlahPenyusutanKomersial" value={l9AJumlahPenyusutanKomersial} />
				<input type="hidden" name="l9BJumlahPenyusutanKomersial" value={l9BJumlahPenyusutanKomersial} />
				<input type="hidden" name="l9CJumlahAmortisasiKomersial" value={l9CJumlahAmortisasiKomersial} />
				<input type="hidden" name="l10a" value={JSON.stringify(l10a)} />
				<input type="hidden" name="l10bHubunganA" value={l10bHubunganA} />
				<input type="hidden" name="l10bHubunganB" value={l10bHubunganB} />
				<input type="hidden" name="l10bHubunganC" value={l10bHubunganC} />
				<input type="hidden" name="l10bHubunganD" value={l10bHubunganD} />
				<input type="hidden" name="l10bTransaksiA" value={l10bTransaksiA} />
				<input type="hidden" name="l10bTransaksiB" value={l10bTransaksiB} />
				<input type="hidden" name="l10bTransaksiC" value={l10bTransaksiC} />
				<input type="hidden" name="l10bDokumentasiA" value={l10bDokumentasiA} />
				<input type="hidden" name="l10bDokumentasiB" value={l10bDokumentasiB} />
				<input type="hidden" name="l10bDokumentasiC" value={l10bDokumentasiC} />
				<input type="hidden" name="l10bDokumentasiD" value={l10bDokumentasiD} />
				<input type="hidden" name="l10bDokumentasiE" value={l10bDokumentasiE} />
				<input type="hidden" name="l10bDokumenA" value={l10bDokumenA} />
				<input type="hidden" name="l10bDokumenB" value={l10bDokumenB} />
				<input type="hidden" name="l10bDokumenC" value={l10bDokumenC} />
				<input type="hidden" name="l10c" value={JSON.stringify(l10c)} />
				<input type="hidden" name="l10cDitentukanPrinsip" value={l10cDitentukanPrinsip} />
				<input type="hidden" name="l10dDokumenIndukA" value={l10dDokumenIndukA} />
				<input type="hidden" name="l10dDokumenIndukB" value={l10dDokumenIndukB} />
				<input type="hidden" name="l10dDokumenIndukC" value={l10dDokumenIndukC} />
				<input type="hidden" name="l10dDokumenIndukD" value={l10dDokumenIndukD} />
				<input type="hidden" name="l10dDokumenIndukE" value={l10dDokumenIndukE} />
				<input type="hidden" name="l10dDokumenLokalA" value={l10dDokumenLokalA} />
				<input type="hidden" name="l10dDokumenLokalB" value={l10dDokumenLokalB} />
				<input type="hidden" name="l10dDokumenLokalC" value={l10dDokumenLokalC} />
				<input type="hidden" name="l10dDokumenLokalD" value={l10dDokumenLokalD} />
				<input type="hidden" name="l10dDokumenLokalE" value={l10dDokumenLokalE} />
				<input type="hidden" name="l10dTanggalDokumenIndukTersedia" value={l10dTanggalDokumenIndukTersedia} />
				<input type="hidden" name="l10dTanggalDokumenLokalTersedia" value={l10dTanggalDokumenLokalTersedia} />
				<input type="hidden" name="l13bA" value={JSON.stringify(l13bA)} />
				<input type="hidden" name="l13bB" value={JSON.stringify(l13bB)} />
				<input type="hidden" name="l13bC" value={JSON.stringify(l13bC)} />
				<input type="hidden" name="l13bDTermanfaatkanTahunSebelumnya" value={l13bDTermanfaatkanTahunSebelumnya} />
				<input type="hidden" name="d5FasilitasPenanamanModal" value={d5FasilitasPenanamanModal} />
				<input type="hidden" name="d6FasilitasBrutoVokasi" value={d6FasilitasBrutoVokasi} />
				<input type="hidden" name="d8AdaKompensasiKerugian" value={d8AdaKompensasiKerugian} />
				<input type="hidden" name="d10FasilitasBrutoLitbang" value={d10FasilitasBrutoLitbang} />
				<input type="hidden" name="tarifPajak" value={tarifPajak} />
				<input type="hidden" name="persentaseTarifLainnya" value={persentaseTarifLainnya} />
				<input type="hidden" name="e13AdaKreditPajakLuarNegeri" value={e13AdaKreditPajakLuarNegeri} />
				<input type="hidden" name="e14AngsuranPph25TahunBerjalan" value={e14AngsuranPph25TahunBerjalan} />
				<input type="hidden" name="e15StpPph25" value={e15StpPph25} />
				<input type="hidden" name="e16FasilitasPenguranganPphTerutang" value={e16FasilitasPenguranganPphTerutang} />
				<input type="hidden" name="f17bAdaSkPengangsuranPenundaan" value={f17bAdaSkPengangsuranPenundaan} />
				<input type="hidden" name="f17bJumlahDiangsurDitunda" value={f17bJumlahDiangsurDitunda} />
				<input
					type="hidden"
					name="f19aMetodePengembalian"
					value={f19aMetodePengembalian ? 'pengembalian_pendahuluan' : 'pemeriksaan'}
				/>
				<input type="hidden" name="g20WajibLaporAngsuranPph25" value={g20WajibLaporAngsuranPph25} />
				<input type="hidden" name="h21aTransaksiHubunganIstimewa" value={h21aTransaksiHubunganIstimewa} />
				<input type="hidden" name="h21bDokumenPenentuanHargaTransfer" value={h21bDokumenPenentuanHargaTransfer} />
				<input type="hidden" name="h21cPenanamanModalAfiliasi" value={h21cPenanamanModalAfiliasi} />
				<input type="hidden" name="h21dUtangPiutangAfiliasi" value={h21dUtangPiutangAfiliasi} />
				<input type="hidden" name="h21ePenyusutanAmortisasiFiskal" value={h21ePenyusutanAmortisasiFiskal} />
				<input type="hidden" name="h21fBiayaEntertainment" value={h21fBiayaEntertainment} />
				<input
					type="hidden"
					name="h21gFasilitasPenanamanModalDaerahTertentu"
					value={h21gFasilitasPenanamanModalDaerahTertentu}
				/>
				<input type="hidden" name="h21hSisaLebihSaranaPrasarana" value={h21hSisaLebihSaranaPrasarana} />
				<input type="hidden" name="h21iDividenLuarNegeri" value={h21iDividenLuarNegeri} />
				<header class="tw:mb-5">
					<nav class="tw:overflow-x-auto tw:border-b tw:border-[#A9A9A9]">
						<ul class="tw:m-0! tw:flex tw:min-w-max tw:flex-row tw:p-0!">
							{#each visibleTabs as tab}
								<li class:active-tab={currentTab.tab === tab}>
									<button type="button" onclick={() => (currentTab.tab = tab)}>{tabLabel(tab)}</button>
								</li>
							{/each}
						</ul>
					</nav>
				</header>

				<Induk
					bind:currentTab
					{spt}
					{readonly}
					bind:sektorUsaha
					bind:menerimaPenghasilanPp23
					bind:hanyaPenghasilanPp23
					bind:menerimaPenghasilanFinal
					bind:menerimaPenghasilanBukanObjekPajak
					{l4a}
					{l4b}
					computed={indukDEF}
					bind:d5FasilitasPenanamanModal
					bind:d6FasilitasBrutoVokasi
					bind:d8AdaKompensasiKerugian
					bind:d10FasilitasBrutoLitbang
					bind:tarifPajak
					bind:persentaseTarifLainnya
					bind:e13AdaKreditPajakLuarNegeri
					bind:e14AngsuranPph25TahunBerjalan
					bind:e15StpPph25
					bind:e16FasilitasPenguranganPphTerutang
					bind:f17bAdaSkPengangsuranPenundaan
					bind:f17bJumlahDiangsurDitunda
					bind:f19aMetodePengembalian
					{f18a}
					{f18b}
					bind:g20WajibLaporAngsuranPph25
					bind:h21aTransaksiHubunganIstimewa
					bind:h21bDokumenPenentuanHargaTransfer
					bind:h21cPenanamanModalAfiliasi
					bind:h21dUtangPiutangAfiliasi
					bind:h21ePenyusutanAmortisasiFiskal
					bind:h21fBiayaEntertainment
					bind:h21gFasilitasPenanamanModalDaerahTertentu
					bind:h21hSisaLebihSaranaPrasarana
					bind:h21iDividenLuarNegeri
				></Induk>

				<!-- Lampiran -->
				<div class="{currentTab.tab === "Induk" ? "tw:hidden" : ""}">
					<h2>{currentTab.title}</h2>

					<!-- Header -->
					<Card>
					{#snippet head()}
						<span class="tw:text-xl!">HEADER</span>
					{/snippet}
					{#snippet body()}
						<div>
							<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
							{#snippet head()}
								<tr class="tw:hidden">
									<td><Input hidden/></td>
								</tr>
							{/snippet}
							{#snippet body()}
								<tr>
									<td class="tw:w-[20rem]"><span>Tahun Pajak/Bagian Tahun Pajak</span></td>
									<td><Input type={"text"} value={spt.tahunPajak} disabled /></td>
								</tr>
								<tr>
									<td><span class="tw:mr-10">Nomor Identitas WP</span></td>
									<td><Input type={"text"} value={"00000000000000000"} disabled /></td>
								</tr>
							{/snippet}
							</Table>
						</div>
					{/snippet}
					</Card>
				</div>

				<L1
					bind:currentTab
					{sektorUsaha}
					templatesBySektor={lampiran1LabaRugiTemplatesBySektor}
					bind:labaRugi
					neracaTemplatesBySektor={lampiran1NeracaTemplatesBySektor}
					bind:neraca
					{readonly}
					{kodeKoreksiFiskalOptions}
				/>
				<L2 bind:currentTab bind:l2a bind:l2b {readonly} {negaraOptions}/>
				<L3
					bind:currentTab
					bind:l3a
					bind:l3aPengembalianPengurangan
					bind:l3b
					{readonly}
					{negaraOptions}
					jenisPenghasilanOptions={jenisPenghasilanKreditPajakLuarNegeriOptions}
					{mataUangOptions}
					jenisPajakOptions={jenisPajakDipotongDipungutOptions}
				/>
				<L4 bind:currentTab bind:l4a bind:l4b {readonly} {objekPajakOptions} jenisPenghasilanOptions={jenisPenghasilanBukanObjekPajakOptions}/>
				<L5 bind:currentTab bind:l5a bind:l5bDipotong {readonly}/>
				<L6
					bind:currentTab
					bind:dasarAngsuran={l6DasarAngsuran}
					bind:kompensasiKerugian={l6KompensasiKerugian}
					bind:pphTerutang={l6PphTerutang}
					bind:kreditPajakTahunLalu={l6KreditPajakTahunLalu}
					onKompensasiKerugianEdit={() => (l6KompensasiKerugianTouched = true)}
					onPphTerutangEdit={() => (l6PphTerutangTouched = true)}
					{readonly}
				/>
				<L7 bind:currentTab bind:l7 {readonly}/>
				<L8
					bind:currentTab
					bind:jumlahPeredaranBruto={l8JumlahPeredaranBruto}
					penghasilanKenaPajak={l8PenghasilanKenaPajak}
					{readonly}
				/>
				<L9
					bind:currentTab
					bind:l9
					bind:jumlahPenyusutanKomersialA={l9AJumlahPenyusutanKomersial}
					bind:jumlahPenyusutanKomersialB={l9BJumlahPenyusutanKomersial}
					bind:jumlahAmortisasiKomersialC={l9CJumlahAmortisasiKomersial}
					{readonly}
					{jenisHartaOptions}
					{metodePenyusutanOptions}
				/>
				<L10A
					bind:currentTab
					bind:l10a
					{readonly}
					{negaraOptions}
					{bentukHubunganOptions}
					{jenisTransaksiOptions}
					{metodeHargaTransferOptions}
				/>
				<L10B
					bind:currentTab
					bind:hubunganA={l10bHubunganA}
					bind:hubunganB={l10bHubunganB}
					bind:hubunganC={l10bHubunganC}
					bind:hubunganD={l10bHubunganD}
					bind:transaksiA={l10bTransaksiA}
					bind:transaksiB={l10bTransaksiB}
					bind:transaksiC={l10bTransaksiC}
					bind:dokumentasiA={l10bDokumentasiA}
					bind:dokumentasiB={l10bDokumentasiB}
					bind:dokumentasiC={l10bDokumentasiC}
					bind:dokumentasiD={l10bDokumentasiD}
					bind:dokumentasiE={l10bDokumentasiE}
					bind:dokumenA={l10bDokumenA}
					bind:dokumenB={l10bDokumenB}
					bind:dokumenC={l10bDokumenC}
					{readonly}
				/>
				<L10C
					bind:currentTab
					bind:l10c
					bind:ditentukanPrinsip={l10cDitentukanPrinsip}
					{readonly}
					{negaraOptions}
					{jenisTransaksiOptions}
				/>
				<L10D
					bind:currentTab
					bind:dokumenIndukA={l10dDokumenIndukA}
					bind:dokumenIndukB={l10dDokumenIndukB}
					bind:dokumenIndukC={l10dDokumenIndukC}
					bind:dokumenIndukD={l10dDokumenIndukD}
					bind:dokumenIndukE={l10dDokumenIndukE}
					bind:dokumenLokalA={l10dDokumenLokalA}
					bind:dokumenLokalB={l10dDokumenLokalB}
					bind:dokumenLokalC={l10dDokumenLokalC}
					bind:dokumenLokalD={l10dDokumenLokalD}
					bind:dokumenLokalE={l10dDokumenLokalE}
					bind:tanggalDokumenIndukTersedia={l10dTanggalDokumenIndukTersedia}
					bind:tanggalDokumenLokalTersedia={l10dTanggalDokumenLokalTersedia}
					{readonly}
				/>
				<L11A bind:currentTab/>
				<L11B bind:currentTab/>
				<L13A bind:currentTab/>
				<L13B
					bind:currentTab
					bind:l13bA
					bind:l13bB
					bind:l13bC
					bind:l13bDTermanfaatkanTahunSebelumnya
					penghasilanKenaPajakSebelumFasilitas={indukDEF.litbangCapBase}
					{readonly}
				/>
				<L13C bind:currentTab/>
				<L14 bind:currentTab/>

				{#if saveError}
					<div class="tw:mt-4">
						<Alert bg={'#dc2626'}>
							{#snippet head()}
								<span class="tw:text-white">!</span>
							{/snippet}
							{#snippet body()}
								<span class="tw:text-white">{saveError}</span>
							{/snippet}
						</Alert>
					</div>
				{/if}

				{#if !readonly}
					<div class="tw:mt-4 tw:flex tw:gap-2">
						<Button type="submit" name="action" value="Simpan Konsep" color="var(--color-secondary)"><span class="tw:text-white">Simpan Konsep</span></Button>
						<Button type="submit" name="action" value="Simpan Lapor" color="var(--color-secondary)"><span class="tw:text-white">Simpan Lapor</span></Button>
					</div>
				{/if}
			</form>
		{/snippet}
	</Card>
</div>

<style>
	nav button {
		padding: 1rem;
	}

	nav li {
		position: relative;
	}

	nav li::before {
		bottom: 0;
		left: 0;
		height: 1px;
		width: 0;
		background-color: brown;
		content: '';
		position: absolute;
		transition: 300ms;
	}

	nav li:hover::before,
	nav li.active-tab::before {
		width: 100%;
	}
</style>
