import { form, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

const RemoteSpecimenSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty("Nama wajib diisi.")),
	taxType: v.pipe(v.string(), v.nonEmpty("Jenis pajak wajib dipilih.")),
	filingDate: v.pipe(v.string(), v.isoDate("Tanggal tidak valid.")),
	grossIncome: v.pipe(v.string(), v.nonEmpty("Penghasilan bruto wajib diisi.")),
	notes: v.optional(v.string(), ""),
	accepted: v.optional(v.boolean(), false),
});

export const remoteSpecimen = form(RemoteSpecimenSchema, async (input) => {
	if (getRequestEvent().url.hostname !== "localhost") {
		error(404, "Not found");
	}

	return {
		message: `Data ${input.name} diterima sebagai spesimen lokal.`,
	};
});
