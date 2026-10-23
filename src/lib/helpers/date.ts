const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long' });

export function formatMonth(month: number) {
	if (!Number.isInteger(month) || month < 1 || month > 12) return '';

	return monthFormatter.format(new Date(2026, month - 1, 1));
}

// Fixed to Asia/Jakarta so the server render and the browser agree, whatever the
// timezone of the Worker or the visitor.
const dibuatFormatter = new Intl.DateTimeFormat('id-ID', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Asia/Jakarta'
});

export function formatTanggalWaktu(value: Date) {
	return dibuatFormatter.format(value);
}
