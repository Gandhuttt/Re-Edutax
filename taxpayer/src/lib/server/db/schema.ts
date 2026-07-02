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

export const taxpayerIndividualDetail = sqliteTable(
  "taxpayer_individual_detail",
  {
    taxpayerId: text("taxpayer_id")
      .primaryKey()
      .references(() => taxpayerProfile.id, { onDelete: "cascade" }),
    tempatLahir: text("tempat_lahir"),
    tanggalLahir: text("tanggal_lahir"),
    statusPernikahan: text("status_pernikahan"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }
);

export const taxpayerEntityDetail = sqliteTable(
  "taxpayer_entity_detail",
  {
    taxpayerId: text("taxpayer_id")
      .primaryKey()
      .references(() => taxpayerProfile.id, { onDelete: "cascade" }),
    tanggalPendirian: text("tanggal_pendirian"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }
);

export const taxpayerContact = sqliteTable(
  "taxpayer_contact",
  {
    taxpayerId: text("taxpayer_id")
      .primaryKey()
      .references(() => taxpayerProfile.id, { onDelete: "cascade" }),
    email: text("email"),
    noHp: text("no_hp"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }
);

export const taxpayerAddress = sqliteTable(
  "taxpayer_address",
  {
    taxpayerId: text("taxpayer_id")
      .primaryKey()
      .references(() => taxpayerProfile.id, { onDelete: "cascade" }),
    alamatLengkap: text("alamat_lengkap"),
    kota: text("kota"),
    kodePos: text("kode_pos"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }
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
  individualDetail: one(taxpayerIndividualDetail, {
    fields: [taxpayerProfile.id],
    references: [taxpayerIndividualDetail.taxpayerId],
  }),
  entityDetail: one(taxpayerEntityDetail, {
    fields: [taxpayerProfile.id],
    references: [taxpayerEntityDetail.taxpayerId],
  }),
  contact: one(taxpayerContact, {
    fields: [taxpayerProfile.id],
    references: [taxpayerContact.taxpayerId],
  }),
  address: one(taxpayerAddress, {
    fields: [taxpayerProfile.id],
    references: [taxpayerAddress.taxpayerId],
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

export const taxpayerIndividualDetailRelations = relations(
  taxpayerIndividualDetail,
  ({ one }) => ({
    taxpayerProfile: one(taxpayerProfile, {
      fields: [taxpayerIndividualDetail.taxpayerId],
      references: [taxpayerProfile.id],
    }),
  })
);

export const taxpayerEntityDetailRelations = relations(
  taxpayerEntityDetail,
  ({ one }) => ({
    taxpayerProfile: one(taxpayerProfile, {
      fields: [taxpayerEntityDetail.taxpayerId],
      references: [taxpayerProfile.id],
    }),
  })
);

export const taxpayerContactRelations = relations(taxpayerContact, ({ one }) => ({
  taxpayerProfile: one(taxpayerProfile, {
    fields: [taxpayerContact.taxpayerId],
    references: [taxpayerProfile.id],
  }),
}));

export const taxpayerAddressRelations = relations(taxpayerAddress, ({ one }) => ({
  taxpayerProfile: one(taxpayerProfile, {
    fields: [taxpayerAddress.taxpayerId],
    references: [taxpayerProfile.id],
  }),
}));

export const taxpayerNitkuRelations = relations(taxpayerNitku, ({ one }) => ({
  taxpayerProfile: one(taxpayerProfile, {
    fields: [taxpayerNitku.taxpayerId],
    references: [taxpayerProfile.id],
  }),
}));
