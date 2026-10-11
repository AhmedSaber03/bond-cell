export interface VerificationMeta {
  ip: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
}

/** Best-effort client metadata for verification logs (fails soft). */
export async function collectVerificationMeta(): Promise<VerificationMeta> {
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { ip: null, country: null, city: null, userAgent };
    }

    const data = (await response.json()) as {
      ip?: string;
      country_name?: string;
      city?: string;
      error?: boolean;
    };

    if (data.error) {
      return { ip: null, country: null, city: null, userAgent };
    }

    return {
      ip: data.ip ?? null,
      country: data.country_name ?? null,
      city: data.city ?? null,
      userAgent,
    };
  } catch {
    return { ip: null, country: null, city: null, userAgent };
  }
}
