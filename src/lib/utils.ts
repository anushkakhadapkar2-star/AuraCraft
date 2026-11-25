import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates 1-2 letter initials from a user's full name or email.
 * E.g., "anushka khadapkar" -> "AK", "Developer Admin" -> "DA", "Anushka" -> "A".
 */
export function getInitials(name?: string | null, email?: string | null, fallback = "A"): string {
  const cleanName = name?.trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() || fallback;
  }

  if (email?.trim()) {
    const userPart = email.trim().split("@")[0];
    const parts = userPart.split(/[._\s-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() || fallback;
  }

  return fallback;
}

