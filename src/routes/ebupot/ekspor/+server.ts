import {
	buildCsv,
	buildPrintHtml,
	buildXlsx,
	ExportError,
	loadExportTable,
	newNonce,
	parseExportIds
} from '$lib/server/ebupot/export';
import type { BpExportFormat } from '$lib/server/ebupot/export';
import type { BpLifecycleKind } from '$lib/helpers/bp-parity';
import type { RequestHandler } from './$types';

const KINDS: Record<string, BpLifecycleKind> = { bp21: 'bp21', bp26: 'bp26', bpa1: 'bpa1', bpa2: 'bpa2' };
const FORMATS: Record<string, BpExportFormat> = { csv: 'csv', xlsx: 'xlsx', print: 'print' };

const text = (status: number, message: string) =>
	new Response(message, {
		status,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'private, no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});

export const GET: RequestHandler = async ({ locals, url }) => {
	const owner = locals.user?.username;
	if (!owner) return text(401, 'Belum login');

	const jenis = Object.hasOwn(KINDS, url.searchParams.get('jenis') ?? '')
		? KINDS[url.searchParams.get('jenis')!]
		: undefined;
	const format = Object.hasOwn(FORMATS, url.searchParams.get('format') ?? '')
		? FORMATS[url.searchParams.get('format')!]
		: undefined;
	if (!jenis) return text(400, 'Parameter jenis harus bp21, bp26, bpa1, atau bpa2');
	if (!format) return text(400, 'Parameter format harus csv, xlsx, atau print');

	try {
		const ids = parseExportIds(url.searchParams.get('ids'));
		const rows = await loadExportTable(owner, jenis, ids);
		const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
		const base = `${jenis}-simulasi-${stamp}`;
		const common = {
			'Cache-Control': 'private, no-store',
			'X-Content-Type-Options': 'nosniff'
		};

		if (format === 'csv') {
			return new Response(buildCsv(rows), {
				headers: {
					...common,
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="${base}.csv"`
				}
			});
		}

		if (format === 'xlsx') {
			const body = await buildXlsx(rows, jenis);
			return new Response(body, {
				headers: {
					...common,
					'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					'Content-Disposition': `attachment; filename="${base}.xlsx"`
				}
			});
		}

		const nonce = newNonce();
		return new Response(buildPrintHtml(rows, jenis, nonce), {
			headers: {
				...common,
				'Content-Type': 'text/html; charset=utf-8',
				'Content-Security-Policy': `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`
			}
		});
	} catch (e) {
		if (e instanceof ExportError) return text(e.status, e.message);
		throw e;
	}
};
