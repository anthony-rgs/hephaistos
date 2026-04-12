import type { ApiTitle, ApiArtist, ApiAlbum, DrilledResponse } from "@/utils/billionsClub.types";

const BASE_URL = import.meta.env.VITE_BILLIONS_CLUB_API_URL ?? "https://api.spotify-billions.club";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`billionsClub API error ${res.status}: ${path}`);
  return res.json();
}

export const fetchTitles  = ()        => get<ApiTitle[]>("/titles");
export const fetchArtists = ()        => get<ApiArtist[]>("/artists");
export const fetchAlbums  = ()        => get<ApiAlbum[]>("/albums");
export const fetchArtist  = (id: number) => get<DrilledResponse>(`/artists/${id}`);
export const fetchAlbum   = (id: number) => get<DrilledResponse>(`/albums/${id}`);
export const fetchMetaTracks = ()     => get<unknown>("/meta/tracks");
