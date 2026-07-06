export default function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="w-4 h-px bg-violet-400" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
          {eyebrow}
        </span>
      </div>
      <h3 className="text-base font-semibold tracking-tight leading-none">{title}</h3>
    </div>
  );
}
