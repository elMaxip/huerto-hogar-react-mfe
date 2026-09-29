export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_FULLNAME_LENGTH = 3;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
