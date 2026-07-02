import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  KATEGORI_WP_MASTER,
  JENIS_WP_MASTER,
  refJenisWp,
  refKategoriWp,
} from "./schema.ts";

const databaseUrl = process.env.DATABASE_URL || "local.db";
const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite);

async function seed() {
  await db
    .insert(refJenisWp)
    .values(JENIS_WP_MASTER.map((item) => ({ ...item, isActive: true })))
    .onConflictDoUpdate({
      target: refJenisWp.code,
      set: {
        name: refJenisWp.name,
        isActive: true,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(refKategoriWp)
    .values(KATEGORI_WP_MASTER.map((item) => ({ ...item, isActive: true })))
    .onConflictDoUpdate({
      target: refKategoriWp.code,
      set: {
        jenisWpCode: refKategoriWp.jenisWpCode,
        name: refKategoriWp.name,
        isActive: true,
        updatedAt: new Date(),
      },
    });

  console.log(
    `Seeded ${JENIS_WP_MASTER.length} jenis_wp and ${KATEGORI_WP_MASTER.length} kategori_wp into ${databaseUrl}`
  );
}

seed()
  .catch((error) => {
    console.error("Failed to seed taxpayer reference data");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    sqlite.close();
  });
