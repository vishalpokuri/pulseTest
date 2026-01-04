export function checkEmail(email: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(email);
}

export function checkPassword(password: string): boolean {
  return password.length >= 6;
}

export function checkPasswordMatch(password: string, confirm: string): boolean {
  return password === confirm;
}