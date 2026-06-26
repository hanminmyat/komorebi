"use client";

import Link from "next/link";
import { useState } from "react";
import EditCapsuleButton from "./EditCapsuleButton";
import DeleteCapsuleButton from "./DeleteCapsuleButton";

export interface Capsule {
  id: string;
  title: string;
  description: string | null;
  type: "audio" | "photo" | "mixed";
  created_at: string;
  memory_date: string | null;
  is_public?: boolean;
  share_token?: string;
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
  const [showActions, setShowActions] = useState(false);
  const config = typeConfig[capsule.type];

  const displayDate = capsule.memory_date
    ? new Date(capsule.memory_date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="group relative rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:p-5">
      {/* Toggle button — always in top-right corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowActions(!showActions);
        }}
        className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-foreground sm:right-3 sm:top-3"
        aria-label={showActions ? "Hide actions" : "Show actions"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {showActions ? (
            <>
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </>
          )}
        </svg>
      </button>

      {/* Card content — clickable link, leaves room for toggle */}
      <Link href={`/capsules/${capsule.id}`} className="block pr-7 sm:pr-8">
        {/* Title + badges row */}
        <div className="flex items-start gap-2 sm:gap-3">
          <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
            {capsule.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {capsule.is_public && (
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary sm:text-xs" title="Public">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3 sm:w-3">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
            )}
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium sm:px-2 sm:text-xs ${config.bg} ${config.text}`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {capsule.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">
            {capsule.description}
          </p>
        )}

        {/* Date */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted sm:mt-3 sm:gap-2 sm:text-xs">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-primary sm:h-3.5 sm:w-3.5"
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

      {/* Action buttons — stacked on mobile, inline on sm+ */}
      {showActions && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
          <EditCapsuleButton
            capsuleId={capsule.id}
            title={capsule.title}
            description={capsule.description}
          />
          <DeleteCapsuleButton capsuleId={capsule.id} />
        </div>
      )}
    </div>
  );
}
