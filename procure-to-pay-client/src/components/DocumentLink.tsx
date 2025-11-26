interface Props {
  label: string;
  url?: string;
}

export const DocumentLink = ({ label, url }: Props) => {
  if (!url) {
    return (
      <button className="rounded-lg border border-dashed border-slate-200 px-4 py-2 text-sm text-slate-400" disabled>
        {label} unavailable
      </button>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
    >
      {label}
    </a>
  );
};
