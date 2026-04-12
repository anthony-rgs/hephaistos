import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { ApiTitle, ApiArtist, ApiAlbum, ViewMode, SortDir, DrillDown, ColHeader } from "@/utils/billionsClub.types";
import { formatStreams } from "@/utils/billionsClub.types";

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDownIcon className="size-3 opacity-40" />;
  return dir === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />;
}

// ─── TitleRows ────────────────────────────────────────────────────────────────

interface TitleRow {
  id: number;
  name: string;
  artist: string;
  album: string;
  streams: number;
  _raw: ApiTitle;
}

function TitleRows({
  rows,
  selected,
  onToggle,
  onDrillDown,
  sortKey,
  sortDir,
  onSort,
  headers,
}: {
  rows: TitleRow[];
  selected: ApiTitle[];
  onToggle: (t: ApiTitle) => void;
  onDrillDown: (type: "artist" | "album", id: number, name: string) => void;
  sortKey: string;
  sortDir: SortDir;
  onSort: (key: string) => void;
  headers: ColHeader[];
}) {
  return (
    <>
      <thead className="sticky top-0 bg-background border-b">
        <tr className="text-muted-foreground">
          <th className="w-8 py-2" />
          {headers.map((h) => (
            <th
              key={h.key}
              className={`py-2 pr-3 cursor-pointer select-none hover:text-foreground ${h.align === "right" ? "text-right" : "text-left"}`}
              onClick={() => onSort(h.key)}
            >
              <span className="inline-flex items-center gap-1">
                {h.label}
                <SortIcon active={sortKey === h.key} dir={sortDir} />
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-border/50 hover:bg-muted/50 cursor-pointer"
            onClick={() => onToggle(row._raw)}
          >
            <td className="py-2 pl-1">
              <Checkbox
                checked={selected.some((t) => t.id === row.id)}
                onCheckedChange={() => onToggle(row._raw)}
                onClick={(e) => e.stopPropagation()}
              />
            </td>
            <td className="py-2 pr-3 font-medium max-w-36 truncate">{row.name}</td>
            <td className="py-2 pr-3 max-w-28 truncate">
              <span className="flex flex-wrap gap-x-1">
                {row._raw.artists.map((a, i) => (
                  <button
                    key={a.id}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                    onClick={(e) => { e.stopPropagation(); onDrillDown("artist", a.id, a.artist_name); }}
                  >
                    {a.artist_name}{i < row._raw.artists.length - 1 ? "," : ""}
                  </button>
                ))}
              </span>
            </td>
            <td className="py-2 pr-3 max-w-28 truncate">
              <button
                className="text-muted-foreground hover:text-foreground hover:underline truncate max-w-full text-left"
                onClick={(e) => { e.stopPropagation(); onDrillDown("album", row._raw.album_id, row.album); }}
              >
                {row.album}
              </button>
            </td>
            <td className="py-2 text-right tabular-nums text-muted-foreground">{formatStreams(row.streams)}</td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

// ─── ArtistRows ───────────────────────────────────────────────────────────────

function ArtistRows({
  rows,
  onDrillDown,
  sortKey,
  sortDir,
  onSort,
  headers,
}: {
  rows: ApiArtist[];
  onDrillDown: (type: "artist" | "album", id: number, name: string) => void;
  sortKey: string;
  sortDir: SortDir;
  onSort: (key: string) => void;
  headers: ColHeader[];
}) {
  return (
    <>
      <thead className="sticky top-0 bg-background border-b">
        <tr className="text-muted-foreground">
          {headers.map((h) => (
            <th key={h.key} className={`py-2 pr-3 cursor-pointer select-none hover:text-foreground ${h.align === "right" ? "text-right" : "text-left"}`} onClick={() => onSort(h.key)}>
              <span className="inline-flex items-center gap-1">{h.label}<SortIcon active={sortKey === h.key} dir={sortDir} /></span>
            </th>
          ))}
          <th className="w-6" />
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr key={a.id} className="border-b border-border/50 hover:bg-muted/50 cursor-pointer" onClick={() => onDrillDown("artist", a.id, a.artist_name)}>
            <td className="py-2 pr-3 font-medium">{a.artist_name}</td>
            <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{a.total_tracks}</td>
            <td className="py-2 text-muted-foreground"><ChevronRightIcon className="size-3.5 ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

// ─── AlbumRows ────────────────────────────────────────────────────────────────

function AlbumRows({
  rows,
  onDrillDown,
  sortKey,
  sortDir,
  onSort,
  headers,
}: {
  rows: ApiAlbum[];
  onDrillDown: (type: "artist" | "album", id: number, name: string) => void;
  sortKey: string;
  sortDir: SortDir;
  onSort: (key: string) => void;
  headers: ColHeader[];
}) {
  return (
    <>
      <thead className="sticky top-0 bg-background border-b">
        <tr className="text-muted-foreground">
          {headers.map((h) => (
            <th key={h.key} className={`py-2 pr-3 cursor-pointer select-none hover:text-foreground ${h.align === "right" ? "text-right" : "text-left"}`} onClick={() => onSort(h.key)}>
              <span className="inline-flex items-center gap-1">{h.label}<SortIcon active={sortKey === h.key} dir={sortDir} /></span>
            </th>
          ))}
          <th className="w-6" />
        </tr>
      </thead>
      <tbody>
        {rows.map((al) => (
          <tr key={al.id} className="border-b border-border/50 hover:bg-muted/50 cursor-pointer" onClick={() => onDrillDown("album", al.id, al.title)}>
            <td className="py-2 pr-3 font-medium max-w-36 truncate">{al.title}</td>
            <td className="py-2 pr-3 max-w-28 truncate">
              <span className="flex flex-wrap gap-x-1">
                {al.artists.map((a, i) => (
                  <button
                    key={a.artist_id}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                    onClick={(e) => { e.stopPropagation(); onDrillDown("artist", a.artist_id, a.artist_name); }}
                  >
                    {a.artist_name}{i < al.artists.length - 1 ? "," : ""}
                  </button>
                ))}
              </span>
            </td>
            <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{al.release_year}</td>
            <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{al.total_tracks}</td>
            <td className="py-2 text-muted-foreground"><ChevronRightIcon className="size-3.5 ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

// ─── BillionsClubBrowse ───────────────────────────────────────────────────────

export default function BillionsClubBrowse({
  view,
  drillDown,
  previousView,
  loading,
  search,
  sortKey,
  sortDir,
  titleRows,
  artistRows,
  albumRows,
  selected,
  currentHeaders,
  showingTitles,
  isEmpty,
  onViewChange,
  onSearchChange,
  onSort,
  onDrillDown,
  onBack,
  onToggle,
}: {
  view: ViewMode;
  drillDown: DrillDown | null;
  previousView: ViewMode;
  loading: boolean;
  search: string;
  sortKey: string;
  sortDir: SortDir;
  titleRows: TitleRow[];
  artistRows: ApiArtist[];
  albumRows: ApiAlbum[];
  selected: ApiTitle[];
  currentHeaders: ColHeader[];
  showingTitles: boolean;
  isEmpty: boolean;
  onViewChange: (v: ViewMode) => void;
  onSearchChange: (s: string) => void;
  onSort: (key: string) => void;
  onDrillDown: (type: "artist" | "album", id: number, name: string) => void;
  onBack: () => void;
  onToggle: (t: ApiTitle) => void;
}) {
  const backLabel = previousView === "titles" ? "Titres" : previousView === "artists" ? "Artistes" : "Albums";

  return (
    <div className="flex flex-col min-h-0 p-4 gap-3">
      <div className="flex gap-2 items-center">
        {drillDown ? (
          <Button size="sm" variant="ghost" className="shrink-0 gap-1 px-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
            <ChevronLeftIcon className="size-3.5" />
            {backLabel}
          </Button>
        ) : (
          <Select value={view} onValueChange={(v) => onViewChange(v as ViewMode)}>
            <SelectTrigger size="sm" className="w-32 shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="titles">Titres</SelectItem>
              <SelectItem value="artists">Artistes</SelectItem>
              <SelectItem value="albums">Albums</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Input placeholder="Rechercher..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="h-8 text-xs" />
      </div>

      {drillDown && <p className="text-xs font-semibold text-foreground truncate">{drillDown.name}</p>}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-xs">
            {showingTitles && (
              <TitleRows rows={titleRows} selected={selected} onToggle={onToggle} onDrillDown={onDrillDown} sortKey={sortKey} sortDir={sortDir} onSort={onSort} headers={currentHeaders} />
            )}
            {view === "artists" && !drillDown && (
              <ArtistRows rows={artistRows} onDrillDown={onDrillDown} sortKey={sortKey} sortDir={sortDir} onSort={onSort} headers={currentHeaders} />
            )}
            {view === "albums" && !drillDown && (
              <AlbumRows rows={albumRows} onDrillDown={onDrillDown} sortKey={sortKey} sortDir={sortDir} onSort={onSort} headers={currentHeaders} />
            )}
            {isEmpty && (
              <tbody>
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Aucun résultat</td></tr>
              </tbody>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
