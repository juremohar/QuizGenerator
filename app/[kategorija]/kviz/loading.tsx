export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
      <span
        className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
        role="status"
        aria-hidden="true"
      />
      <span>Pripravljam kviz …</span>
    </div>
  );
}
