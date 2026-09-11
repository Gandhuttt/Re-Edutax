import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
	if (url.hostname !== "localhost") {
		error(404, "Not found");
	}
};
