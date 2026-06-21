import Link from "next/link";

export interface Capsule {
  id: string;
  title: string;
  description: string | null;
  type: "audio" | "photo" | "mixed";
  created_at: string;
  memory_date: string | null;
}

const typeConfig = {
  audio: {
    label: "Audio",
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  photo: {
    label: "Photo",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  mixed: {
    label: "Mixed",
    bg: "bg-purple-100",
    text: "text-purple-800",
  },
} as const;

export default function CapsuleCard({ capsule }: { capsule: Capsule }) {
  const config = typeConfig[capsule.type];

  const displayDate = capsule.memory_date
    ? new Date(capsule.memory_date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
          {capsule.title}
        </h3>
        <span
          className={`shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
      </div>

      {capsule.description && (
        <p className="mt-2 text-sm text-muted line-clamp-2 leading-relaxed">
          {capsule.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        {displayDate ? (
          <span>{displayDate}</span>
        ) : (
          <span>
            {new Date(capsule.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  );
}
