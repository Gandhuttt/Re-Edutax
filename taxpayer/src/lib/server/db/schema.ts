import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

export const JENIS_WP_MASTER = [
  { code: "ORANG_PRIBADI", name: "Orang Pribadi" },
  { code: "BADAN", name: "Badan" },
  { code: "BENDAHARA", name: "Bendahara" },
] as const;

export const KATEGORI_WP_MASTER = [
  { code: "OP_KARYAWAN", jenisWpCode: "ORANG_PRIBADI", name: "Orang Pribadi Karyawan" },
  { code: "OP_NON_KARYAWAN", jenisWpCode: "ORANG_PRIBADI", name: "Orang Pribadi Non-Karyawan" },
  { code: "OP_USAHAWAN", jenisWpCode: "ORANG_PRIBADI", name: "Orang Pribadi Usahawan" },
  { code: "PT", jenisWpCode: "BADAN", name: "Perseroan Terbatas" },
  { code: "CV", jenisWpCode: "BADAN", name: "Commanditaire Vennootschap" },
  { code: "FIRMA", jenisWpCode: "BADAN", name: "Firma" },
  { code: "YAYASAN", jenisWpCode: "BADAN", name: "Yayasan" },
  { code: "BUMN", jenisWpCode: "BADAN", name: "Badan Usaha Milik Negara" },
  { code: "BENDAHARA_PEMERINTAH", jenisWpCode: "BENDAHARA", name: "Bendahara Pemerintah" },
  { code: "BENDAHARA_INSTANSI", jenisWpCode: "BENDAHARA", name: "Bendahara Instansi" },
] as const;

export const refJenisWp = sqliteTable("ref_jenis_wp", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const refKategoriWp = sqliteTable(
  "ref_kategori_wp",
  {
    code: text("code").primaryKey(),
    jenisWpCode: text("jenis_wp_code")
      .notNull()
      .references(() => refJenisWp.code),
    name: text("name").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("refKategoriWp_jenisWpCode_idx").on(table.jenisWpCode)]
);

export const taxpayerProfile = sqliteTable(
  "taxpayer_profile",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    
    // Referensi ke user di modul auth
    userId: text("user_id").notNull().unique(),
    
    // Data Utama Wajib Pajak
    npwp: text("npwp").notNull().unique(), // Format 15 digit atau 16 digit (NIK untuk OP)
    nama: text("nama").notNull(),
    kategoriWpCode: text("kategori_wp_code")
      .notNull()
      .references(() => refKategoriWp.code),
    
    // Demografi Khusus
    tempatLahir: text("tempat_lahir"),
    tanggalLahir: text("tanggal_lahir"),
    tanggalPendirian: text("tanggal_pendirian"),
    statusPernikahan: text("status_pernikahan"),
    
    // Kontak & Alamat Utama (Alamat Domisili/Pusat)
    email: text("email"),
    noHp: text("no_hp"),
    alamatLengkap: text("alamat_lengkap"),
    kota: text("kota"),
    kodePos: text("kode_pos"),
    
    // Klasifikasi Perpajakan
    kluKode: text("klu_kode"), // Klasifikasi Lapangan Usaha Pusat
    kppTerdaftar: text("kpp_terdaftar"), // Kode KPP (misal "045")
    statusWp: text("status_wp").default("AKTIF"), // "AKTIF", "NON_EFEKTIF", "HAPUS"
    
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("taxpayer_userId_idx").on(table.userId),
    index("taxpayer_npwp_idx").on(table.npwp),
    index("taxpayer_kategoriWpCode_idx").on(table.kategoriWpCode),
  ]
);

// Tabel NITKU (Nomor Identitas Tempat Kegiatan Usaha)
// 1 Wajib Pajak (Entitas) bisa memiliki banyak NITKU (Pusat + Cabang)
export const taxpayerNitku = sqliteTable(
  "taxpayer_nitku",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    taxpayerId: text("taxpayer_id")
      .notNull()
      .references(() => taxpayerProfile.id, { onDelete: "cascade" }),
    
    nitku: text("nitku").notNull().unique(), // Nomor 22 digit standar Coretax
    isPusat: integer("is_pusat", { mode: "boolean" }).notNull().default(false),
    
    namaCabang: text("nama_cabang"),
    alamatCabang: text("alamat_cabang"),
    
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("taxpayerNitku_taxpayerId_idx").on(table.taxpayerId),
    index("taxpayerNitku_nitku_idx").on(table.nitku),
  ]
);

// Relasi untuk Drizzle ORM
export const taxpayerProfileRelations = relations(taxpayerProfile, ({ one, many }) => ({
  kategoriWp: one(refKategoriWp, {
    fields: [taxpayerProfile.kategoriWpCode],
    references: [refKategoriWp.code],
  }),
  nitkus: many(taxpayerNitku),
}));

export const refJenisWpRelations = relations(refJenisWp, ({ many }) => ({
  categories: many(refKategoriWp),
}));

export const refKategoriWpRelations = relations(refKategoriWp, ({ one, many }) => ({
  jenisWp: one(refJenisWp, {
    fields: [refKategoriWp.jenisWpCode],
    references: [refJenisWp.code],
  }),
  taxpayerProfiles: many(taxpayerProfile),
}));

export const taxpayerNitkuRelations = relations(taxpayerNitku, ({ one }) => ({
  taxpayerProfile: one(taxpayerProfile, {
    fields: [taxpayerNitku.taxpayerId],
    references: [taxpayerProfile.id],
  }),
}));
