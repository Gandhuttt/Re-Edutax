/**
 * Peserta log in with their NPWP (15-16 digits). Staff accounts are not wajib pajak and have
 * no NPWP, so the username plugin also accepts a plain handle like `admin` for them.
 */
export const npwpPattern = /^\d{15,16}$/;
export const staffUsernamePattern = /^[a-zA-Z][a-zA-Z0-9._-]{2,31}$/;

export const isNpwp = (value: string) => npwpPattern.test(value);

export const isValidUsername = (value: string) => isNpwp(value) || staffUsernamePattern.test(value);

export const usernameMinLength = 3;
export const usernameMaxLength = 32;
