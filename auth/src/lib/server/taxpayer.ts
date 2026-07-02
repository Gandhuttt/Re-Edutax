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

export async function getTaxpayerProfileByUserId(
  userId: string
): Promise<TaxpayerProfileLookup | null> {
  if (!env.TAXPAYER_SERVICE_URL) {
    throw new Error("TAXPAYER_SERVICE_URL is not set");
  }

  if (!env.INTERNAL_API_SECRET) {
    throw new Error("INTERNAL_API_SECRET is not set");
  }

  const url = new URL("/api/internal/taxpayer-profile", env.TAXPAYER_SERVICE_URL);
  url.searchParams.set("userId", userId);

  const response = await fetch(url, {
    headers: {
      "x-internal-api-secret": env.INTERNAL_API_SECRET,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Taxpayer lookup failed with status ${response.status}`);
  }

  return (await response.json()) as TaxpayerProfileLookup;
}
