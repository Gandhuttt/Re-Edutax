import { json } from "@sveltejs/kit";

import { getTaxpayerProfileByUserId } from "$lib/server/taxpayer-profile";

export const GET = async ({ url }) => {
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
