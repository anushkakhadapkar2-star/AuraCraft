import React from "react";

/**
 * Official Google Pay Brand Icon
 */
export function GooglePayLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
      <g transform="translate(12, 12)">
        <path
          d="M23.49 12.28c0-.85-.08-1.68-.22-2.47H12v4.67h6.44c-.28 1.48-1.12 2.74-2.39 3.59v2.98h3.87c2.26-2.09 3.57-5.17 3.57-8.77z"
          fill="#4285F4"
        />
        <path
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-2.98c-1.07.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.08C3.25 21.35 7.34 24 12 24z"
          fill="#34A853"
        />
        <path
          d="M5.28 14.33c-.25-.72-.38-1.49-.38-2.33s.13-1.61.38-2.33V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.08z"
          fill="#FBBC05"
        />
        <path
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.65 1.27 6.59l4.01 3.08c.95-2.84 3.6-4.92 6.72-4.92z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

/**
 * Official PhonePe Brand Icon
 * Features PhonePe's signature royal purple background (#5F259F) and white 'पे' ligature
 */
export function PhonePeLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#5F259F" />
      <path
        d="M72 47.5H60V41C60 38.2 57.8 36 55 36H42.5L58 17.5C59 16.3 58.8 14.5 57.5 13.5C56.2 12.5 54.4 12.7 53.4 14L34.5 36.8C33.7 37.8 33.5 39.2 34 40.4C34.5 41.6 35.6 42.4 37 42.4H47.5V47.5H35C33.3 47.5 32 48.8 32 50.5C32 52.2 33.3 53.5 35 53.5H47.5V61.5C47.5 70 54.5 77 63 77C71.5 77 78.5 70 78.5 61.5V51.5C78.5 49.3 76.5 47.5 74 47.5H72ZM68.5 61.5C68.5 64.5 66 67 63 67C60 67 57.5 64.5 57.5 61.5V53.5H68.5V61.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Official NPCI Unified Payments Interface (UPI) Brand Icon
 * Features the signature dual forward chevrons (Orange & Green) and bold italic UPI typography
 */
export function UpiLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="3" />
      {/* Dual forward-leaning chevrons */}
      <g transform="translate(18, 14)">
        {/* Left Orange Chevron */}
        <polygon points="12,2 26,2 14,32 0,32" fill="#ED752E" />
        {/* Right Green Chevron */}
        <polygon points="34,2 48,2 36,32 22,32" fill="#097939" />
      </g>
      <text
        x="50"
        y="80"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="27"
        fontStyle="italic"
        fill="#2D3748"
        letterSpacing="1.5"
      >
        UPI
      </text>
    </svg>
  );
}

/**
 * Official Paytm Brand Icon
 */
export function PaytmLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#002E6E" />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#00BAF2"
        letterSpacing="0.5"
      >
        Paytm
      </text>
    </svg>
  );
}

/**
 * Horizontal Combined UPI Payment Ribbon Badge
 */
export function UpiHorizontalBadge({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <GooglePayLogo className="w-5 h-5 shadow-2xs" />
      <PhonePeLogo className="w-5 h-5 shadow-2xs" />
      <PaytmLogo className="w-5 h-5 shadow-2xs" />
      <UpiLogo className="w-5 h-5 shadow-2xs" />
    </div>
  );
}
