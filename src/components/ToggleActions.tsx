"use client";

import { useState } from "react";
import EditCapsuleButton from "./EditCapsuleButton";
import DeleteCapsuleButton from "./DeleteCapsuleButton";
import ShareToggle from "./ShareToggle";

interface ToggleActionsProps {
  capsule: {
    id: string;
    title: string;
    description: string | null;
    is_public?: boolean;
    share_token?: string;
  };
}

export default function ToggleActions({ capsule }: ToggleActionsProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      {/* Absolute toggle in top-right */}
      <button
        onClick={() => setShowActions(!showActions)}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-foreground"
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

      {/* Collapsible actions panel */}
      {showActions && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <EditCapsuleButton
                capsuleId={capsule.id}
                title={capsule.title}
                description={capsule.description}
              />
              <DeleteCapsuleButton capsuleId={capsule.id} />
            </div>
            <ShareToggle
              capsuleId={capsule.id}
              isPublic={capsule.is_public ?? false}
              shareToken={capsule.share_token ?? ""}
            />
          </div>
        </div>
      )}
    </>
  );
}
