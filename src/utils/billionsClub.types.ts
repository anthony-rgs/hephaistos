export interface ApiTitle {
  id: number;
  name: string;
  album_id: number;
  album_name: string;
  streams_count: number;
  track_time: string;
  cover_url: string;
  iframe: string;
  artists: { id: number; artist_name: string }[];
}

export interface ApiArtist {
  id: number;
  artist_name: string;
  artist_img: string;
  monthly_listeners: number;
  total_tracks: number;
}

export interface ApiAlbum {
  id: number;
  title: string;
  cover_url: string;
  release_year: number;
  total_tracks: number;
  artists: { artist_id: number; artist_name: string }[];
}

export interface RawDrilledTitle {
  id: number;
  name: string;
  album_id: number;
  streams_count: number;
  track_time: string;
  cover_url: string;
  iframe: string;
  updated_at?: string;
}

export interface TitleArtistRef {
  title_id: number;
  artist_id: number;
  artist_name: string;
}

export interface AlbumRef {
  id: number;
  title: string;
}

export interface DrilledResponse {
  titles: RawDrilledTitle[];
  titles_artists: TitleArtistRef[];
  albums?: AlbumRef[];
  album?: { title: string };
  artist?: ApiArtist;
  artists?: { id: number; artist_name: string; artist_img: string }[];
}

export type ViewMode = "titles" | "artists" | "albums";
export type SortDir = "asc" | "desc";

export interface DrillDown {
  type: "artist" | "album";
  id: number;
  name: string;
}

export interface ColHeader {
  key: string;
  label: string;
  align: "left" | "right";
}

export const TITLE_HEADERS: ColHeader[] = [
  { key: "name",    label: "Titre",   align: "left"  },
  { key: "artist",  label: "Artiste", align: "left"  },
  { key: "album",   label: "Album",   align: "left"  },
  { key: "streams", label: "Streams", align: "right" },
];

export const ARTIST_HEADERS: ColHeader[] = [
  { key: "artist_name",  label: "Artiste", align: "left"  },
  { key: "total_tracks", label: "Titres",  align: "right" },
];

export const ALBUM_HEADERS: ColHeader[] = [
  { key: "title",        label: "Album",   align: "left"  },
  { key: "artists",      label: "Artiste", align: "left"  },
  { key: "release_year", label: "Année",   align: "right" },
  { key: "total_tracks", label: "Titres",  align: "right" },
];

export function formatStreams(n: number): string {
  return n.toLocaleString("fr-FR");
}
