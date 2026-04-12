import type { ApiTitle, ApiArtist, ApiAlbum, DrilledResponse } from "./billionsClub.types";

const MOCK_TITLES: ApiTitle[] = [
  { id: 1,  name: "God's Plan",      album_id: 1, album_name: "Scorpion",                       streams_count: 2800000000, track_time: "3:18", cover_url: "", iframe: "", artists: [{ id: 1, artist_name: "Drake" }] },
  { id: 2,  name: "One Dance",        album_id: 2, album_name: "Views",                          streams_count: 2600000000, track_time: "2:54", cover_url: "", iframe: "", artists: [{ id: 1, artist_name: "Drake" }] },
  { id: 3,  name: "Blinding Lights",  album_id: 3, album_name: "After Hours",                    streams_count: 4200000000, track_time: "3:20", cover_url: "", iframe: "", artists: [{ id: 2, artist_name: "The Weeknd" }] },
  { id: 4,  name: "Starboy",          album_id: 4, album_name: "Starboy",                        streams_count: 2900000000, track_time: "3:50", cover_url: "", iframe: "", artists: [{ id: 2, artist_name: "The Weeknd" }, { id: 3, artist_name: "Daft Punk" }] },
  { id: 5,  name: "Heartless",        album_id: 5, album_name: "808s & Heartbreak",              streams_count: 1940000000, track_time: "3:32", cover_url: "", iframe: "", artists: [{ id: 4, artist_name: "Kanye West" }] },
  { id: 6,  name: "Stronger",         album_id: 6, album_name: "Graduation",                     streams_count: 1760000000, track_time: "5:11", cover_url: "", iframe: "", artists: [{ id: 4, artist_name: "Kanye West" }] },
  { id: 7,  name: "Ni**as In Paris",  album_id: 7, album_name: "Watch the Throne",               streams_count: 1790000000, track_time: "3:38", cover_url: "", iframe: "", artists: [{ id: 4, artist_name: "Kanye West" }, { id: 1, artist_name: "Drake" }] },
  { id: 8,  name: "SICKO MODE",       album_id: 8, album_name: "Astroworld",                     streams_count: 2400000000, track_time: "5:12", cover_url: "", iframe: "", artists: [{ id: 5, artist_name: "Travis Scott" }] },
  { id: 9,  name: "Goosebumps",       album_id: 9, album_name: "Birds in the Trap Sing McKnight",streams_count: 1500000000, track_time: "4:03", cover_url: "", iframe: "", artists: [{ id: 5, artist_name: "Travis Scott" }] },
  { id: 10, name: "Lucid Dreams",     album_id: 10, album_name: "Goodbye & Good Riddance",       streams_count: 1600000000, track_time: "3:59", cover_url: "", iframe: "", artists: [{ id: 6, artist_name: "Juice WRLD" }] },
];

const MOCK_ARTISTS: ApiArtist[] = [
  { id: 1, artist_name: "Drake",        artist_img: "", monthly_listeners: 85000000,  total_tracks: 2 },
  { id: 2, artist_name: "The Weeknd",   artist_img: "", monthly_listeners: 110000000, total_tracks: 2 },
  { id: 4, artist_name: "Kanye West",   artist_img: "", monthly_listeners: 60000000,  total_tracks: 3 },
  { id: 5, artist_name: "Travis Scott", artist_img: "", monthly_listeners: 55000000,  total_tracks: 2 },
  { id: 6, artist_name: "Juice WRLD",   artist_img: "", monthly_listeners: 40000000,  total_tracks: 1 },
];

const MOCK_ALBUMS: ApiAlbum[] = [
  { id: 1,  title: "Scorpion",                     cover_url: "", release_year: 2018, total_tracks: 1, artists: [{ artist_id: 1, artist_name: "Drake" }] },
  { id: 2,  title: "Views",                         cover_url: "", release_year: 2016, total_tracks: 1, artists: [{ artist_id: 1, artist_name: "Drake" }] },
  { id: 3,  title: "After Hours",                   cover_url: "", release_year: 2020, total_tracks: 1, artists: [{ artist_id: 2, artist_name: "The Weeknd" }] },
  { id: 4,  title: "Starboy",                       cover_url: "", release_year: 2016, total_tracks: 1, artists: [{ artist_id: 2, artist_name: "The Weeknd" }] },
  { id: 5,  title: "808s & Heartbreak",             cover_url: "", release_year: 2008, total_tracks: 1, artists: [{ artist_id: 4, artist_name: "Kanye West" }] },
  { id: 6,  title: "Graduation",                    cover_url: "", release_year: 2007, total_tracks: 1, artists: [{ artist_id: 4, artist_name: "Kanye West" }] },
  { id: 7,  title: "Watch the Throne",              cover_url: "", release_year: 2011, total_tracks: 1, artists: [{ artist_id: 4, artist_name: "Kanye West" }, { artist_id: 1, artist_name: "Drake" }] },
  { id: 8,  title: "Astroworld",                    cover_url: "", release_year: 2018, total_tracks: 1, artists: [{ artist_id: 5, artist_name: "Travis Scott" }] },
  { id: 9,  title: "Birds in the Trap Sing McKnight", cover_url: "", release_year: 2016, total_tracks: 1, artists: [{ artist_id: 5, artist_name: "Travis Scott" }] },
  { id: 10, title: "Goodbye & Good Riddance",       cover_url: "", release_year: 2018, total_tracks: 1, artists: [{ artist_id: 6, artist_name: "Juice WRLD" }] },
];

export async function mockFetch(
  path: string,
): Promise<DrilledResponse | ApiTitle[] | ApiArtist[] | ApiAlbum[]> {
  await new Promise((r) => setTimeout(r, 150));

  if (path === "/titles")  return MOCK_TITLES;
  if (path === "/artists") return MOCK_ARTISTS;
  if (path === "/albums")  return MOCK_ALBUMS;

  const artistMatch = path.match(/^\/artists\/(\d+)$/);
  if (artistMatch) {
    const id     = Number(artistMatch[1]);
    const artist = MOCK_ARTISTS.find((a) => a.id === id);
    const titles = MOCK_TITLES.filter((t) => t.artists.some((a) => a.id === id));
    return {
      artist,
      albums: MOCK_ALBUMS.filter((al) => titles.some((t) => t.album_id === al.id)),
      titles: titles.map(({ artists: _, album_name: __, ...t }) => t),
      titles_artists: titles.flatMap((t) =>
        t.artists.map((a) => ({ title_id: t.id, artist_id: a.id, artist_name: a.artist_name }))
      ),
    };
  }

  const albumMatch = path.match(/^\/albums\/(\d+)$/);
  if (albumMatch) {
    const id    = Number(albumMatch[1]);
    const album = MOCK_ALBUMS.find((a) => a.id === id);
    const titles = MOCK_TITLES.filter((t) => t.album_id === id);
    return {
      album,
      artists: album?.artists.map((a) => ({ id: a.artist_id, artist_name: a.artist_name, artist_img: "" })) ?? [],
      titles: titles.map(({ artists: _, album_name: __, ...t }) => t),
      titles_artists: titles.flatMap((t) =>
        t.artists.map((a) => ({ title_id: t.id, artist_id: a.id, artist_name: a.artist_name }))
      ),
    };
  }

  throw new Error(`mockFetch: unknown path ${path}`);
}
