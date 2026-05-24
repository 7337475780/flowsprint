import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes cleanly and resolves utility conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely resolves an asset URL (avatars or files) by checking if it is an external URL,
 * or prepending the configured VITE_API_URL or falling back to local origin in production,
 * and localhost in development.
 */
export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL || '';
  const domain = apiBase ? apiBase.replace(/\/api\/?$/, '') : (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
  return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
}
