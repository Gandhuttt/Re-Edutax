import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	mata_uang_spt_pph_badan,
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { getLampiranL1 } from './components/L1/getLampiranL1.server';
import { getLampiranL2 } from './components/L2/getLampiranL2.server';
import { getLampiranL3 } from './components/L3/getLampiranL3.server';
import { getLampiranL4 } from './components/L4/getLampiranL4.server';
import { getLampiranL5 } from './components/L5/getLampiranL5.server';
import { getLampiranL6 } from './components/L6/getLampiranL6.server';
import { getLampiranL7 } from './components/L7/getLampiranL7.server';
import { getLampiranL8 } from './components/L8/getLampiranL8.server';
import { getLampiranL9 } from './components/L9/getLampiranL9.server';
import { getLampiranL10A } from './components/L10-A/getLampiranL10A.server';
import { getLampiranL10B } from './components/L10-B/getLampiranL10B.server';
import { getLampiranL10C } from './components/L10-C/getLampiranL10C.server';
import { getLampiranL10D } from './components/L10-D/getLampiranL10D.server';
import { getLampiranL13B } from './components/L13-B/getLampiranL13B.server';

export const getSptPphBadan = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.url.searchParams.get('id');

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'SPT PPh Badan tidak dipilih');
	}

	const [spt] = await db
		.select({
			id: spt_pph_badan.id,
			npwp: spt_pph_badan.npwp,
			tahunPajak: spt_pph_badan.tahunPajak,
			pembetulanKe: spt_pph_badan.pembetulanKe,
			statusSpt: spt_pph_badan.statusSpt,
			statusDraft: spt_pph_badan.statusDraft,
			periodePembukuanMulai: spt_pph_badan.periodePembukuanMulai,
			periodePembukuanSelesai: spt_pph_badan.periodePembukuanSelesai,
			metodePembukuan: spt_pph_badan.metodePembukuan,
			mataUangKode: mata_uang_spt_pph_badan.kode,
			sektorUsahaKode: sektor_usaha_spt_pph_badan.kode,
			diaudit: spt_pph_badan.diaudit,
			opiniAuditorKode: opini_auditor_spt_pph_badan.kode,
			npwpKantorAkuntanPublik: spt_pph_badan.npwpKantorAkuntanPublik,
			namaKantorAkuntanPublik: spt_pph_badan.namaKantorAkuntanPublik,
			menerimaPenghasilanPp23: spt_pph_badan.menerimaPenghasilanPp23,
			hanyaPenghasilanPp23: spt_pph_badan.hanyaPenghasilanPp23,
			menerimaPenghasilanFinal: spt_pph_badan.menerimaPenghasilanFinal,
			menerimaPenghasilanBukanObjekPajak: spt_pph_badan.menerimaPenghasilanBukanObjekPajak,
			penghasilanNetoFiskalSebelumFasilitas: spt_pph_badan.penghasilanNetoFiskalSebelumFasilitas,
			d5FasilitasPenanamanModal: spt_pph_badan.d5FasilitasPenanamanModal,
			d6FasilitasBrutoVokasi: spt_pph_badan.d6FasilitasBrutoVokasi,
			d8AdaKompensasiKerugian: spt_pph_badan.d8AdaKompensasiKerugian,
			d10FasilitasBrutoLitbang: spt_pph_badan.d10FasilitasBrutoLitbang,
			tarifPajak: spt_pph_badan.tarifPajak,
			persentaseTarifLainnya: spt_pph_badan.persentaseTarifLainnya,
			e13AdaKreditPajakLuarNegeri: spt_pph_badan.e13AdaKreditPajakLuarNegeri,
			e14AngsuranPph25TahunBerjalan: spt_pph_badan.e14AngsuranPph25TahunBerjalan,
			e15StpPph25: spt_pph_badan.e15StpPph25,
			e16FasilitasPenguranganPphTerutang: spt_pph_badan.e16FasilitasPenguranganPphTerutang,
			f17bAdaSkPengangsuranPenundaan: spt_pph_badan.f17bAdaSkPengangsuranPenundaan,
			f17bJumlahDiangsurDitunda: spt_pph_badan.f17bJumlahDiangsurDitunda,
			f19aMetodePengembalian: spt_pph_badan.f19aMetodePengembalian,
			g20WajibLaporAngsuranPph25: spt_pph_badan.g20WajibLaporAngsuranPph25,
			h21aTransaksiHubunganIstimewa: spt_pph_badan.h21aTransaksiHubunganIstimewa,
			h21bDokumenPenentuanHargaTransfer: spt_pph_badan.h21bDokumenPenentuanHargaTransfer,
			h21cPenanamanModalAfiliasi: spt_pph_badan.h21cPenanamanModalAfiliasi,
			h21dUtangPiutangAfiliasi: spt_pph_badan.h21dUtangPiutangAfiliasi,
			h21ePenyusutanAmortisasiFiskal: spt_pph_badan.h21ePenyusutanAmortisasiFiskal,
			h21fBiayaEntertainment: spt_pph_badan.h21fBiayaEntertainment,
			h21gFasilitasPenanamanModalDaerahTertentu: spt_pph_badan.h21gFasilitasPenanamanModalDaerahTertentu,
			h21hSisaLebihSaranaPrasarana: spt_pph_badan.h21hSisaLebihSaranaPrasarana,
			h21iDividenLuarNegeri: spt_pph_badan.h21iDividenLuarNegeri,
			pphKurangLebihBayar: spt_pph_badan.pphKurangLebihBayar,
			lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya:
				spt_pph_badan.lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya
		})
		.from(spt_pph_badan)
		.innerJoin(mata_uang_spt_pph_badan, eq(spt_pph_badan.mataUangPembukuanId, mata_uang_spt_pph_badan.id))
		.leftJoin(sektor_usaha_spt_pph_badan, eq(spt_pph_badan.sektorUsahaId, sektor_usaha_spt_pph_badan.id))
		.leftJoin(opini_auditor_spt_pph_badan, eq(spt_pph_badan.opiniAuditorId, opini_auditor_spt_pph_badan.id))
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	const [
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
		lampiran13b,
		previousVersion
	] = await Promise.all([
		getLampiranL1(id),
		getLampiranL2(id),
		getLampiranL3(id, spt.lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya),
		getLampiranL4(id),
		getLampiranL5(id),
		getLampiranL6(id),
		getLampiranL7(id, spt.tahunPajak),
		getLampiranL8(id),
		getLampiranL9(id),
		getLampiranL10A(id),
		getLampiranL10B(id),
		getLampiranL10C(id),
		getLampiranL10D(id),
		getLampiranL13B(id),
		spt.pembetulanKe > 0
			? db
					.select({ pphKurangLebihBayar: spt_pph_badan.pphKurangLebihBayar })
					.from(spt_pph_badan)
					.where(
						and(
							eq(spt_pph_badan.npwp, spt.npwp),
							eq(spt_pph_badan.tahunPajak, spt.tahunPajak),
							eq(spt_pph_badan.pembetulanKe, spt.pembetulanKe - 1)
						)
					)
					.limit(1)
					.then((rows) => rows[0] ?? null)
			: Promise.resolve(null)
	]);

	return {
		readonly: spt.statusDraft !== 'konsep',
		spt: { ...spt, previousPphKurangLebihBayar: previousVersion?.pphKurangLebihBayar ?? null },
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
	};
});
