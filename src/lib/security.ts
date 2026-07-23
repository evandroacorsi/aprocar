export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
export const isTurnstileConfigured = Boolean(TURNSTILE_SITE_KEY);
