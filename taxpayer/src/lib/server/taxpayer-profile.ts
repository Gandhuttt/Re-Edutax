import { eq } from "drizzle-orm";

import { db } from "./db";
import { refJenisWp, refKategoriWp, taxpayerProfile } from "./db/schema";

export type TaxpayerProfileLookup = {
  id: string;
  userId: string;
  npwp: string;
  nama: string;
  statusWp: string | null;
  kategoriWp: {
    code: string;
    name: string;
  };
  jenisWp: {
    code: string;
    name: string;
  };
};

export async function getTaxpayerProfileByUserId(
  userId: string
): Promise<TaxpayerProfileLookup | null> {
  const row = await db
    .select({
      id: taxpayerProfile.id,
      userId: taxpayerProfile.userId,
      npwp: taxpayerProfile.npwp,
      nama: taxpayerProfile.nama,
      statusWp: taxpayerProfile.statusWp,
      kategoriWpCode: refKategoriWp.code,
      kategoriWpName: refKategoriWp.name,
      jenisWpCode: refJenisWp.code,
      jenisWpName: refJenisWp.name,
    })
    .from(taxpayerProfile)
    .innerJoin(refKategoriWp, eq(taxpayerProfile.kategoriWpCode, refKategoriWp.code))
    .innerJoin(refJenisWp, eq(refKategoriWp.jenisWpCode, refJenisWp.code))
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
    statusWp: row.statusWp,
    kategoriWp: {
      code: row.kategoriWpCode,
      name: row.kategoriWpName,
    },
    jenisWp: {
      code: row.jenisWpCode,
      name: row.jenisWpName,
    },
  };
}
