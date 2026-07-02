import { eq } from "drizzle-orm";

import { db } from "./db";
import {
  refJenisWp,
  refKategoriWp,
  taxpayerAddress,
  taxpayerContact,
  taxpayerEntityDetail,
  taxpayerIndividualDetail,
  taxpayerProfile,
} from "./db/schema";

export type CreateTaxpayerProfileInput = {
  userId: string;
  npwp: string;
  nama: string;
  kategoriWpCode: string;
  kluKode?: string | null;
  kppTerdaftar?: string | null;
  statusWp?: string | null;
  individualDetail?: {
    tempatLahir?: string | null;
    tanggalLahir?: string | null;
    statusPernikahan?: string | null;
  } | null;
  entityDetail?: {
    tanggalPendirian?: string | null;
  } | null;
  contact?: {
    email?: string | null;
    noHp?: string | null;
  } | null;
  address?: {
    alamatLengkap?: string | null;
    kota?: string | null;
    kodePos?: string | null;
  } | null;
};

export type TaxpayerProfileLookup = {
  id: string;
  userId: string;
  npwp: string;
  nama: string;
  kluKode: string | null;
  kppTerdaftar: string | null;
  statusWp: string | null;
  kategoriWp: {
    code: string;
    name: string;
  };
  jenisWp: {
    code: string;
    name: string;
  };
  individualDetail: {
    tempatLahir: string | null;
    tanggalLahir: string | null;
    statusPernikahan: string | null;
  } | null;
  entityDetail: {
    tanggalPendirian: string | null;
  } | null;
  contact: {
    email: string | null;
    noHp: string | null;
  } | null;
  address: {
    alamatLengkap: string | null;
    kota: string | null;
    kodePos: string | null;
  } | null;
};

export async function createTaxpayerProfile(input: CreateTaxpayerProfileInput) {
  const existingCategory = await db
    .select({
      code: refKategoriWp.code,
    })
    .from(refKategoriWp)
    .where(eq(refKategoriWp.code, input.kategoriWpCode))
    .get();

  if (!existingCategory) {
    throw new Error(`Invalid kategoriWpCode: ${input.kategoriWpCode}`);
  }

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(taxpayerProfile)
      .values({
        userId: input.userId,
        npwp: input.npwp,
        nama: input.nama,
        kategoriWpCode: input.kategoriWpCode,
        kluKode: input.kluKode ?? null,
        kppTerdaftar: input.kppTerdaftar ?? null,
        statusWp: input.statusWp ?? "AKTIF",
      })
      .returning({
        id: taxpayerProfile.id,
      });

    const taxpayerId = inserted[0]?.id;

    if (!taxpayerId) {
      throw new Error("Failed to create taxpayer profile");
    }

    if (input.individualDetail) {
      await tx.insert(taxpayerIndividualDetail).values({
        taxpayerId,
        tempatLahir: input.individualDetail.tempatLahir ?? null,
        tanggalLahir: input.individualDetail.tanggalLahir ?? null,
        statusPernikahan: input.individualDetail.statusPernikahan ?? null,
      });
    }

    if (input.entityDetail) {
      await tx.insert(taxpayerEntityDetail).values({
        taxpayerId,
        tanggalPendirian: input.entityDetail.tanggalPendirian ?? null,
      });
    }

    if (input.contact) {
      await tx.insert(taxpayerContact).values({
        taxpayerId,
        email: input.contact.email ?? null,
        noHp: input.contact.noHp ?? null,
      });
    }

    if (input.address) {
      await tx.insert(taxpayerAddress).values({
        taxpayerId,
        alamatLengkap: input.address.alamatLengkap ?? null,
        kota: input.address.kota ?? null,
        kodePos: input.address.kodePos ?? null,
      });
    }
  });

  return getTaxpayerProfileByUserId(input.userId);
}

export async function getTaxpayerProfileByUserId(
  userId: string
): Promise<TaxpayerProfileLookup | null> {
  const row = await db
    .select({
      id: taxpayerProfile.id,
      userId: taxpayerProfile.userId,
      npwp: taxpayerProfile.npwp,
      nama: taxpayerProfile.nama,
      kluKode: taxpayerProfile.kluKode,
      kppTerdaftar: taxpayerProfile.kppTerdaftar,
      statusWp: taxpayerProfile.statusWp,
      kategoriWpCode: refKategoriWp.code,
      kategoriWpName: refKategoriWp.name,
      jenisWpCode: refJenisWp.code,
      jenisWpName: refJenisWp.name,
      tempatLahir: taxpayerIndividualDetail.tempatLahir,
      tanggalLahir: taxpayerIndividualDetail.tanggalLahir,
      statusPernikahan: taxpayerIndividualDetail.statusPernikahan,
      tanggalPendirian: taxpayerEntityDetail.tanggalPendirian,
      email: taxpayerContact.email,
      noHp: taxpayerContact.noHp,
      alamatLengkap: taxpayerAddress.alamatLengkap,
      kota: taxpayerAddress.kota,
      kodePos: taxpayerAddress.kodePos,
    })
    .from(taxpayerProfile)
    .innerJoin(refKategoriWp, eq(taxpayerProfile.kategoriWpCode, refKategoriWp.code))
    .innerJoin(refJenisWp, eq(refKategoriWp.jenisWpCode, refJenisWp.code))
    .leftJoin(
      taxpayerIndividualDetail,
      eq(taxpayerProfile.id, taxpayerIndividualDetail.taxpayerId)
    )
    .leftJoin(taxpayerEntityDetail, eq(taxpayerProfile.id, taxpayerEntityDetail.taxpayerId))
    .leftJoin(taxpayerContact, eq(taxpayerProfile.id, taxpayerContact.taxpayerId))
    .leftJoin(taxpayerAddress, eq(taxpayerProfile.id, taxpayerAddress.taxpayerId))
    .where(eq(taxpayerProfile.userId, userId))
    .get();

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.userId,
    npwp: row.npwp,
    nama: row.nama,
    kluKode: row.kluKode,
    kppTerdaftar: row.kppTerdaftar,
    statusWp: row.statusWp,
    kategoriWp: {
      code: row.kategoriWpCode,
      name: row.kategoriWpName,
    },
    jenisWp: {
      code: row.jenisWpCode,
      name: row.jenisWpName,
    },
    individualDetail:
      row.tempatLahir !== null ||
      row.tanggalLahir !== null ||
      row.statusPernikahan !== null
        ? {
            tempatLahir: row.tempatLahir,
            tanggalLahir: row.tanggalLahir,
            statusPernikahan: row.statusPernikahan,
          }
        : null,
    entityDetail:
      row.tanggalPendirian !== null
        ? {
            tanggalPendirian: row.tanggalPendirian,
          }
        : null,
    contact:
      row.email !== null || row.noHp !== null
        ? {
            email: row.email,
            noHp: row.noHp,
          }
        : null,
    address:
      row.alamatLengkap !== null || row.kota !== null || row.kodePos !== null
        ? {
            alamatLengkap: row.alamatLengkap,
            kota: row.kota,
            kodePos: row.kodePos,
          }
        : null,
  };
}
