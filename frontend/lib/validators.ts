const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** Returns the list of unmet password rules (empty when the password is valid). */
export function getPasswordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[A-Za-z]/.test(password)) issues.push("a letter");
  if (!/\d/.test(password)) issues.push("a number");
  if (new TextEncoder().encode(password).length > 72) issues.push("no more than 72 bytes");
  return issues;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Enter a password";
  const issues = getPasswordIssues(password);
  if (issues.length === 0) return undefined;
  return `Password needs ${issues.join(", ")}`;
}

/** Score from 0 (empty) to 4 (strong). */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.max(1, score);
}
