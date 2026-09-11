import type {
	RemoteForm,
	RemoteFormField,
	RemoteFormFieldValue,
	RemoteFormIssue,
} from "@sveltejs/kit";

export type ReUiRemoteField<
	Value extends RemoteFormFieldValue = RemoteFormFieldValue,
> = RemoteFormField<Value>;

/** Accepts both a root remote form and an instance returned by `form.for(id)`. */
export type ReUiRemoteForm = Omit<RemoteForm<any, any>, "for">;

export function firstRemoteIssue(
	field?: ReUiRemoteField<any>,
): RemoteFormIssue | undefined {
	return field?.issues()?.[0];
}

export function remoteFieldName(
	field: ReUiRemoteField<any> | undefined,
	type: string,
	value?: unknown,
): string {
	if (!field) return "";
	const attributes =
		value === undefined
			? (field as any).as(type)
			: (field as any).as(type, value);
	return attributes.name;
}
