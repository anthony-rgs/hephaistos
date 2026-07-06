export interface VideoResult {
  type: string;
  videoId: string;
  title: string;
  author: string;
  authorVerified: boolean;
  lengthSeconds: number;
  viewCountText: string;
  publishedText: string;
  videoThumbnails: { url: string; quality: string }[];
}

function thumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoResultItem({
  video,
  selected,
  onSelect,
}: {
  video: VideoResult;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      tabIndex={-1}
      onClick={onSelect}
      className={`flex items-center gap-2.5 rounded-lg p-2 text-left transition-colors ${
        selected
          ? "bg-violet-400/10 ring-1 ring-violet-400/30"
          : "hover:bg-violet-400/5"
      }`}
    >
      <div className="relative shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted">
        <img
          src={thumbnail(video.videoId)}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-mono px-0.5 rounded">
          {formatDuration(video.lengthSeconds)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs font-medium leading-snug line-clamp-2">{video.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {video.author}
          {video.authorVerified && <span className="ml-1">✓</span>}
        </p>
        <p className="text-[10px] text-muted-foreground">{video.viewCountText}</p>
      </div>
    </button>
  );
}
