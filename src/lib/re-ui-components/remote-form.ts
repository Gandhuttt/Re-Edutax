import type {
	RemoteFormField,
	RemoteFormFieldValue,
	RemoteFormIssue,
} from "@sveltejs/kit";
import { isHttpError } from "@sveltejs/kit";

export type ReUiRemoteField<
	Value extends RemoteFormFieldValue = RemoteFormFieldValue,
> = RemoteFormField<Value>;

export type ReUiRemoteFormEnhanceInstance = {
	readonly element: HTMLFormElement;
	submit(): Promise<boolean>;
};

/** The form element attributes and pending state shared by root and `.for(id)` remote forms. */
export type ReUiRemoteForm = {
	method: "POST";
	action: string;
	readonly pending: number;
	enhance(
		callback: (
			form: ReUiRemoteFormEnhanceInstance,
		) => void | PromiseLike<void>,
	): {
		method: "POST";
		action: string;
		[attachment: symbol]: (node: HTMLFormElement) => void;
	};
	[attachment: symbol]: (node: HTMLFormElement) => void;
};

export type ReUiRemoteFailure = {
	message: string;
	status?: number;
	referenceId?: string;
};

const defaultFailureMessage =
	"Layanan sedang mengalami gangguan. Coba simpan kembali beberapa saat lagi.";

/** Converts a rejected remote submission into safe, displayable form feedback. */
export function remoteFailureFrom(
	cause: unknown,
	fallbackMessage = defaultFailureMessage,
): ReUiRemoteFailure {
	if (!isHttpError(cause)) return { message: fallbackMessage };

	const body = cause.body as App.Error;
	const referenceId =
		typeof body.referenceId === "string" ? body.referenceId : undefined;
	return {
		message:
			cause.status < 500 &&
			typeof body.message === "string" &&
			body.message.trim()
				? body.message
				: fallbackMessage,
		status: cause.status,
		referenceId,
	};
}

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
