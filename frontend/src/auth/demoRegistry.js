/**
 * demoRegistry.js
 *
 * Fake Aadhaar identities for hackathon demo.
 * These are entirely fictional — not connected to UIDAI.
 * All Aadhaar numbers start with "9999" per demo convention.
 */

export const DEMO_REGISTRY = {
  "9999 1111 0001": {
    name: "Murugan Selvam",
    dob: "1972-06-14",
    gender: "Male",
    otp: "123456",
    photo: null,
  },
  "9999 2222 0002": {
    name: "Divya Krishnamurthy",
    dob: "2001-03-22",
    gender: "Female",
    otp: "234567",
    photo: null,
  },
  "9999 3333 0003": {
    name: "Rafiq Ansari",
    dob: "1985-11-09",
    gender: "Male",
    otp: "345678",
    photo: null,
  },
};

/** Normalise raw input to "XXXX XXXX XXXX" canonical form */
export function normaliseAadhaar(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 12) return null;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}

/** Return registry entry or null */
export function lookupAadhaar(raw) {
  const canonical = normaliseAadhaar(raw);
  if (!canonical) return null;
  return DEMO_REGISTRY[canonical] ?? null;
}

/** Verify OTP (trim only) */
export function verifyOtp(raw, otp) {
  const entry = lookupAadhaar(raw);
  if (!entry) return false;
  return entry.otp === otp.trim();
}
