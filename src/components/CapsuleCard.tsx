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
    bg: "bg-sky/15",
    text: "text-sky",
  },
  photo: {
    label: "Photo",
    bg: "bg-leaf/15",
    text: "text-leaf",
  },
  mixed: {
    label: "Mixed",
    bg: "bg-blossom/15",
    text: "text-blossom",
  },
} as const;

export default function CapsuleCard({ capsule }: { capsule: Capsule }) {
  const config = typeConfig[capsule.type];

  const displayDate = capsule.memory_date
    ? new Date(capsule.memory_date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="group block rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:p-5"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
          {capsule.title}
        </h3>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text} sm:px-2.5`}
        >
          {config.label}
        </span>
      </div>

      {capsule.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">
          {capsule.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-muted sm:mt-3">
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
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  );
}
