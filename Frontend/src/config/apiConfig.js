// ─── NexaMart API Config ────────────────────────────────────────────────────
// DOMAIN_URL is intentionally empty ("") so all paths are relative to the
// current origin. This means:
//   • In development  → CRA proxy (package.json "proxy") forwards /api/* to
//                        http://localhost:5000
//   • In production   → Express serves /api/* directly (same origin)
//   • Cloudflare      → Tunnel points to http://localhost:5000; no CORS needed
// ─────────────────────────────────────────────────────────────────────────────
export const DOMAIN_URL = "";   // same origin — never hardcode localhost here
export const API_URL = "/api";  // relative path — works dev + prod + Cloudflare

export default { API_URL, DOMAIN_URL };
