export default function PreviewFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      {children}
    </div>
  );
}
