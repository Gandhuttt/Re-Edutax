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

// Tears down any open modal without waiting for its hide transition, for use on
// client-side navigation.
//
// Bootstrap keeps two things outside the modal element itself: a
// `.modal-backdrop` div appended to `<body>`, and the scroll lock it applies to
// `<body>` (the `modal-open` class plus inline overflow/padding). Neither lives
// in SvelteKit's routed DOM, and Bootstrap only removes them when it hides the
// modal itself. A modal whose submit navigates -- "Buat SPT" on /konsep, which
// redirects to the SPT it just created -- therefore strands both on top of the
// destination page: the content is there but the backdrop swallows every click
// and the page cannot scroll, so it reads as frozen until a reload.
//
// `hide()` alone does not fix it, because its cleanup runs after a ~150ms fade
// and the element is gone by then. So dispose the instance (which drops the
// backdrop synchronously) and reset the body ourselves.
export async function dismissBsModalsForNavigation() {
	const open = [...document.querySelectorAll('.modal.show')];
	if (open.length === 0) return;

	const { Modal } = (await import('bootstrap/dist/js/bootstrap.bundle.min.js')) as unknown as {
		Modal: { getInstance(el: Element): { dispose(): void } | null };
	};

	for (const el of open) {
		Modal.getInstance(el)?.dispose();
		el.classList.remove('show');
		el.setAttribute('aria-hidden', 'true');
		el.removeAttribute('aria-modal');
		el.removeAttribute('role');
		(el as HTMLElement).style.display = 'none';
	}

	// Disposing drops the backdrop it owns, but a modal opened declaratively and
	// never hidden can leave one behind, so sweep for strays too.
	for (const backdrop of document.querySelectorAll('.modal-backdrop')) backdrop.remove();

	document.body.classList.remove('modal-open');
	document.body.style.removeProperty('overflow');
	document.body.style.removeProperty('padding-right');
}
