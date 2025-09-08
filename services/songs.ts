import { apiFetch } from "./api";

export async function getRecentSongs(limit = "10") {
  return apiFetch("tracks", {
    order: "popularity_week",
    limit,
  });
}
