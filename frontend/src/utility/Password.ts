// src/utility/Password.ts

export default function validatePassword(password: string): string | null {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("at least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("1 lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("1 uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("1 number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("1 special character (!@#$%^&*)");
  }

  if (errors.length > 0) {
    return "Password must contain " + errors.join(", ");
  }

  return null;
}
