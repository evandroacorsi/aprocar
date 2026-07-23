import { TURNSTILE_SITE_KEY } from "@/lib/security";
import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileProps = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
};

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";

const loadTurnstileScript = () => {
  if (document.getElementById(TURNSTILE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = TURNSTILE_SCRIPT_ID;
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

export function Turnstile({ onVerify, onExpire, theme = "light" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const reactId = useId();

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  }, [onExpire, onVerify]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    loadTurnstileScript();

    let cancelled = false;
    const interval = window.setInterval(() => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme,
        callback: (token) => onVerifyRef.current(token),
        "expired-callback": () => {
          onVerifyRef.current("");
          onExpireRef.current?.();
        },
        "error-callback": () => {
          onVerifyRef.current("");
          onExpireRef.current?.();
        },
      });

      window.clearInterval(interval);
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [reactId, theme]);

  if (!TURNSTILE_SITE_KEY) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        Cloudflare Turnstile nao configurado. Preencha `VITE_TURNSTILE_SITE_KEY`.
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
