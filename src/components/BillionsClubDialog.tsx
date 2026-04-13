import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { useAppDispatch } from "@/store";
import { setClips } from "@/store/createVideoSlice";
import type { ClipData } from "@/store/createVideoSlice";
import type { ApiTitle, ApiArtist, ApiAlbum, ViewMode, SortDir, DrillDown, RawDrilledTitle, TitleArtistRef, AlbumRef } from "@/utils/billionsClub.types";
import { TITLE_HEADERS, ARTIST_HEADERS, ALBUM_HEADERS } from "@/utils/billionsClub.types";
import { fetchTitles, fetchArtists, fetchAlbums, fetchArtist, fetchAlbum } from "@/utils/api/billionsClub";
import BillionsClubBrowse from "./BillionsClubBrowse";
import BillionsClubSelection from "./BillionsClubSelection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeClip(title: ApiTitle): ClipData {
  return {
    id: "",
    idStyle: { border: 2, color: "0xFFFFFF", font: "dejavu", size: 50 },
    claude: false,
    title: title.name,
    url: "",
    start_time: "00:00:00",
    duration: 5,
    titleStyle: { animation: "none", border: 2, color: "0xFFFFFF", font: "inter-semibold", position: "left", size: 45 },
    subtitle: "",
    subtitleStyle: { animation: "none", border: 2, color: "0xFFFFFF", font: "inter-semibold", position: "left", size: 45 },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillionsClubDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();

  const [view, setView]               = useState<ViewMode>("titles");
  const [previousView, setPreviousView] = useState<ViewMode>("titles");
  const [drillDown, setDrillDown]     = useState<DrillDown | null>(null);
  const [loading, setLoading]         = useState(false);

  const [titles,  setTitles]  = useState<ApiTitle[]>([]);
  const [artists, setArtists] = useState<ApiArtist[]>([]);
  const [albums,  setAlbums]  = useState<ApiAlbum[]>([]);

  const [search,      setSearch]      = useState("");
  const [sortKey,     setSortKey]     = useState("streams");
  const [sortDir,     setSortDir]     = useState<SortDir>("desc");
  const [selected,    setSelected]    = useState<ApiTitle[]>([]);
  const [labelFormat, setLabelFormat] = useState("title-streams");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        if (drillDown) {
          const json = drillDown.type === "artist"
            ? await fetchArtist(drillDown.id)
            : await fetchAlbum(drillDown.id);
          if (cancelled) return;
          const rawTitles: RawDrilledTitle[]    = json.titles ?? [];
          const titlesArtists: TitleArtistRef[] = json.titles_artists ?? [];
          const albumsList: AlbumRef[]          = json.albums ?? [];
          setTitles(rawTitles.map((t) => ({
            ...t,
            album_name: drillDown.type === "album" ? (json.album?.title ?? "") : (albumsList.find((a) => a.id === t.album_id)?.title ?? ""),
            artists: titlesArtists.filter((ta) => ta.title_id === t.id).map((ta) => ({ id: ta.artist_id, artist_name: ta.artist_name })),
          })));
        } else if (view === "titles") {
          const json = await fetchTitles();
          if (!cancelled) setTitles(json);
        } else if (view === "artists") {
          const json = await fetchArtists();
          if (!cancelled) setArtists(json);
        } else {
          const json = await fetchAlbums();
          if (!cancelled) setAlbums(json);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [open, view, drillDown]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleViewChange = (v: ViewMode) => {
    setView(v); setDrillDown(null); setSearch("");
    setSortKey(v === "titles" ? "streams" : "total_tracks");
    setSortDir("desc");
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleDrillDown = (type: "artist" | "album", id: number, name: string) => {
    setPreviousView(view);
    setView(type === "artist" ? "artists" : "albums");
    setDrillDown({ type, id, name });
    setSearch(""); setSortKey("streams"); setSortDir("desc");
  };

  const handleBack = () => {
    setView(previousView); setDrillDown(null); setSearch("");
    setSortKey(previousView === "titles" ? "streams" : "total_tracks");
    setSortDir("desc");
  };

  const toggle = (title: ApiTitle) => {
    setSelected((prev) =>
      prev.find((t) => t.id === title.id) ? prev.filter((t) => t.id !== title.id) : [...prev, title]
    );
  };

  const handleConfirm = () => {
    const formatTitle = (t: ApiTitle) => {
      const artist  = t.artists.map((a) => a.artist_name).join(", ");
      const streams = (t.streams_count / 1_000_000_000).toFixed(2) + "b";
      if (labelFormat === "title-artist-streams") return `${t.name} - ${artist} (${streams})`;
      if (labelFormat === "title-streams")        return `${t.name} (${streams})`;
      return t.name;
    };
    dispatch(setClips(selected.map((t) => ({ ...makeClip(t), title: formatTitle(t) }))));
    onOpenChange(false);
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const showingTitles = view === "titles" || drillDown !== null;
  const q = search.toLowerCase();

  const titleRows = useMemo(() => {
    if (!showingTitles) return [];
    return [...titles]
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.artists.some((a) => a.artist_name.toLowerCase().includes(q)))
      .map((t) => ({ id: t.id, name: t.name, artist: t.artists.map((a) => a.artist_name).join(", "), album: t.album_name ?? "", streams: t.streams_count, _raw: t }))
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "streams") return (a.streams - b.streams) * dir;
        return (a[sortKey as "name" | "artist" | "album"] ?? "").localeCompare(b[sortKey as "name" | "artist" | "album"] ?? "") * dir;
      });
  }, [titles, q, sortKey, sortDir, showingTitles]);

  const artistRows = useMemo(() => {
    if (view !== "artists" || drillDown) return [];
    return [...artists]
      .filter((a) => !q || a.artist_name.toLowerCase().includes(q))
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "total_tracks") return (a.total_tracks - b.total_tracks) * dir;
        return a.artist_name.localeCompare(b.artist_name) * dir;
      });
  }, [artists, q, sortKey, sortDir, view, drillDown]);

  const albumRows = useMemo(() => {
    if (view !== "albums" || drillDown) return [];
    return [...albums]
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.artists.some((ar) => ar.artist_name.toLowerCase().includes(q)))
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "release_year") return (a.release_year - b.release_year) * dir;
        if (sortKey === "total_tracks") return (a.total_tracks - b.total_tracks) * dir;
        return a.title.localeCompare(b.title) * dir;
      });
  }, [albums, q, sortKey, sortDir, view, drillDown]);

  const currentHeaders = showingTitles ? TITLE_HEADERS : view === "artists" ? ARTIST_HEADERS : ALBUM_HEADERS;
  const isEmpty = showingTitles ? titleRows.length === 0 : view === "artists" ? artistRows.length === 0 : albumRows.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[85dvw] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Billions Club Data</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] h-[70vh] min-h-0">
          <BillionsClubBrowse
            view={view}
            drillDown={drillDown}
            previousView={previousView}
            loading={loading}
            search={search}
            sortKey={sortKey}
            sortDir={sortDir}
            titleRows={titleRows}
            artistRows={artistRows}
            albumRows={albumRows}
            selected={selected}
            currentHeaders={currentHeaders}
            showingTitles={showingTitles}
            isEmpty={isEmpty}
            onViewChange={handleViewChange}
            onSearchChange={setSearch}
            onSort={handleSort}
            onDrillDown={handleDrillDown}
            onBack={handleBack}
            onToggle={toggle}
          />

          <Separator orientation="vertical" />

          <BillionsClubSelection
            selected={selected}
            labelFormat={labelFormat}
            onLabelFormatChange={setLabelFormat}
            onToggle={toggle}
            onClear={() => setSelected([])}
            onCancel={() => onOpenChange(false)}
            onConfirm={handleConfirm}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
