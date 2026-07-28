const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long' });

export function formatMonth(month: number) {
	if (!Number.isInteger(month) || month < 1 || month > 12) return '';

	return monthFormatter.format(new Date(2026, month - 1, 1));
}
