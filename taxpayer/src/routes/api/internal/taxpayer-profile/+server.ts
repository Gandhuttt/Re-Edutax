import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";

import { getTaxpayerProfileByUserId } from "$lib/server/taxpayer-profile";

export const GET = async ({ request, url }) => {
  const internalApiSecret = env.INTERNAL_API_SECRET;
  const providedSecret = request.headers.get("x-internal-api-secret");

  if (!internalApiSecret || providedSecret !== internalApiSecret) {
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
