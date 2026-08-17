// Closes a Bootstrap modal opened via `data-bs-toggle="modal"`, from JS,
// after client-side validation passes. Badan's own modals never need this
// (they don't validate, so Simpan can carry `data-bs-dismiss="modal"`
// unconditionally); OP's grids validate on Simpan, so the dismiss has to be
// conditional instead of declarative.
export async function closeBsModal(id: string) {
	const { Modal } = (await import('bootstrap/dist/js/bootstrap.bundle.min.js')) as unknown as {
		Modal: { getOrCreateInstance(el: Element): { hide(): void } };
	};
	const el = document.getElementById(id);
	if (el) Modal.getOrCreateInstance(el).hide();
}
