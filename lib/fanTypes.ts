export const FAN_TYPES = [
  { value: "inverter", label: "Inverter Fans" },
  { value: "ac", label: "AC Fans" },
  { value: "acdc", label: "AC/DC Fans" },
] as const;

export type FanTypeValue = (typeof FAN_TYPES)[number]["value"];

// naam se type pehchano
export function detectFanType(name: string): FanTypeValue {
  const n = name.toLowerCase();
  if (/\bac\s*[/\-_]?\s*dc\b/.test(n)) return "acdc"; // acdc, ac/dc, ac-dc, ac dc
  if (n.includes("invert")) return "inverter"; // inverter / invertor
  return "ac"; // sirf naam = AC
}

// admin mein type chuna ho to wahi, warna naam se
export function getFanType(m: { name: string; fanType?: string }): string {
  return m.fanType || detectFanType(m.name);
}

// converter: "Oval Gold 2500W" -> 2500
export function detectWatt(name: string): number | null {
  const m = name.match(/(\d{2,5})\s*(?:w\b|watts?\b)/i);
  return m ? Number(m[1]) : null;
}

// "12V", "12 Volt", "12V/24V", "12/24V", "12-24V"  ->  [12, 24]
const VOLT_RE =
  /((?:\d{1,3}(?:\.\d+)?\s*[/,&-]\s*)*\d{1,3}(?:\.\d+)?)\s*(?:v\b|volts?\b)/gi;
// "10A", "10 Amp", "10/20A"  ->  [10, 20]   (Ah / AC jaisi cheezein nahi pakadta)
const AMP_RE =
  /((?:\d{1,3}(?:\.\d+)?\s*[/,&-]\s*)*\d{1,3}(?:\.\d+)?)\s*(?:a\b|amps?\b|amperes?\b)/gi;

function numbersFrom(name: string, re: RegExp): number[] {
  const out = new Set<number>();
  for (const m of name.matchAll(re)) {
    for (const n of m[1].split(/[^\d.]+/)) {
      if (n) out.add(Number(n));
    }
  }
  return Array.from(out);
}

export const detectVolts = (name: string) => numbersFrom(name, VOLT_RE);
export const detectAmps = (name: string) => numbersFrom(name, AMP_RE);