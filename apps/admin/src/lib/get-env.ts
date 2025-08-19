// src/config/get-env.ts
export function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing environment variable: ${name}`);
      return ''; // Return empty string in development
    }
    throw new Error(`Cannot find environment variable: ${name}`);
  }
  return val;
}