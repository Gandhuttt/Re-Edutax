import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";

import {
  createTaxpayerProfile,
  getTaxpayerProfileByUserId,
  type CreateTaxpayerProfileInput,
} from "$lib/server/taxpayer-profile";

function isCreateTaxpayerProfileInput(value: unknown): value is CreateTaxpayerProfileInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.userId === "string" &&
    typeof payload.npwp === "string" &&
    typeof payload.nama === "string" &&
    typeof payload.kategoriWpCode === "string"
  );
}

function isAuthorized(request: Request) {
  const internalApiSecret = env.INTERNAL_API_SECRET;
  const providedSecret = request.headers.get("x-internal-api-secret");

  return Boolean(internalApiSecret && providedSecret === internalApiSecret);
}

export const GET = async ({ request, url }) => {
  if (!isAuthorized(request)) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ message: "userId is required" }, { status: 400 });
  }

  const profile = await getTaxpayerProfileByUserId(userId);

  if (!profile) {
    return json({ message: "Taxpayer profile not found" }, { status: 404 });
  }

  return json(profile);
};

export const POST = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  if (!isCreateTaxpayerProfileInput(payload)) {
    return json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    const profile = await createTaxpayerProfile(payload);
    return json(profile, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create taxpayer profile";
    return json({ message }, { status: 400 });
  }
};
