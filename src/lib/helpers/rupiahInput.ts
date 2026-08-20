export function formatRupiah(value: number | undefined): string {
	return value ? value.toLocaleString('id-ID') : '';
}

/**
 * Same, but a computed zero stays a visible "0" instead of collapsing to an
 * empty box. Editable fields want the blank — it is what an untouched input
 * looks like, and what a taxpayer clearing the field types their way back to.
 * Read-only cells do not: their zero is an answer. Coretax renders these as
 * `p-inputNumber mode="decimal"` and patches a literal 0 into them (e.g.
 * `checkedChkH1` writing `valueH1: 0`), so a blank there reads as "not yet
 * calculated" for a figure that has in fact been calculated.
 */
export function formatRupiahDerived(value: number | undefined): string {
	return value === undefined || Number.isNaN(value) ? '' : value.toLocaleString('id-ID');
}

/**
 * Reformats a rupiah-style text input on every keystroke while keeping the
 * cursor at the same digit position, instead of letting it jump to the end.
 */
export function applyRupiahInput(e: Event): number {
	const target = e.target as HTMLInputElement;
	const cursorPos = target.selectionStart ?? target.value.length;
	const digitsBeforeCursor = target.value.slice(0, cursorPos).replace(/\D/g, '').length;

	const digits = target.value.replace(/\D/g, '');
	const num = digits ? Number(digits) : 0;
	const formatted = formatRupiah(num);

	target.value = formatted;

	let newPos = 0;
	let count = 0;
	if (digitsBeforeCursor > 0) {
		newPos = formatted.length;
		for (let i = 0; i < formatted.length; i++) {
			if (/\d/.test(formatted[i])) {
				count++;
				if (count === digitsBeforeCursor) {
					newPos = i + 1;
					break;
				}
			}
		}
	}
	target.setSelectionRange(newPos, newPos);

	return num;
}
