import { env } from "$env/dynamic/private";

export type TaxpayerProfileLookup = {
  id: string;
  userId: string;
  npwp: string;
  nama: string;
  statusWp: string | null;
  kategoriWp: {
    code: string;
    name: string;
  };
  jenisWp: {
    code: string;
    name: string;
  };
};

export class TaxpayerLookupError extends Error {
  status: number;
  code: string;

  constructor(message: string, options: { status: number; code: string }) {
    super(message);
    this.name = "TaxpayerLookupError";
    this.status = options.status;
    this.code = options.code;
  }
}

export async function getTaxpayerProfileByUserId(
  userId: string
): Promise<TaxpayerProfileLookup | null> {
  if (!env.TAXPAYER_SERVICE_URL) {
    throw new TaxpayerLookupError("TAXPAYER_SERVICE_URL is not set", {
      status: 500,
      code: "TAXPAYER_SERVICE_URL_MISSING",
    });
  }

  if (!env.INTERNAL_API_SECRET) {
    throw new TaxpayerLookupError("INTERNAL_API_SECRET is not set", {
      status: 500,
      code: "INTERNAL_API_SECRET_MISSING",
    });
  }

  const url = new URL("/api/internal/taxpayer-profile", env.TAXPAYER_SERVICE_URL);
  url.searchParams.set("userId", userId);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        "x-internal-api-secret": env.INTERNAL_API_SECRET,
      },
    });
  } catch {
    throw new TaxpayerLookupError("Failed to reach taxpayer service", {
      status: 503,
      code: "TAXPAYER_SERVICE_UNREACHABLE",
    });
  }

  if (response.status === 404) {
    return null;
  }

  if (response.status === 401) {
    throw new TaxpayerLookupError("Taxpayer service rejected internal request", {
      status: 502,
      code: "TAXPAYER_SERVICE_UNAUTHORIZED",
    });
  }

  if (!response.ok) {
    throw new TaxpayerLookupError(
      `Taxpayer lookup failed with status ${response.status}`,
      {
        status: 503,
        code: "TAXPAYER_LOOKUP_FAILED",
      }
    );
  }

  return (await response.json()) as TaxpayerProfileLookup;
}
