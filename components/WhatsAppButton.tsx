"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Enter your WhatsApp number here: include the country code, without + and without the leading 0
// Example: 0300 1234567  ->  923001234567
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923493032515";
const MESSAGE = "Hello! I would like some information about your products.";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [showBubble, setShowBubble] = useState(false);

  // Show "Message us" after a short delay (unless it was already closed)
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("wa-bubble-closed") === "1";
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setShowBubble(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function closeBubble() {
    setShowBubble(false);
    try {
      sessionStorage.setItem("wa-bubble-closed", "1");
    } catch {}
  }

  // Don't show on the admin panel
  if (pathname.startsWith("/admin")) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-4 z-50 flex items-center gap-3 sm:bottom-6 sm:right-6">
      {showBubble && (
        <div className="relative">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-lg ring-1 ring-black/5"
          >
            Message us <span aria-hidden>👋</span>
          </a>
          <button
            type="button"
            onClick={closeBubble}
            aria-label="Close"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 shadow hover:bg-neutral-300"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105 hover:shadow-xl"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="white" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}