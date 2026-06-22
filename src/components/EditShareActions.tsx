"use client";

import { useState } from "react";
import EditCapsuleModal from "./EditCapsuleModal";
import ShareButton from "./ShareButton";

interface EditShareActionsProps {
  capsuleId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string;
}

export default function EditShareActions({
  capsuleId,
  title,
  description,
  isPublic,
  shareToken,
}: EditShareActionsProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      {/* Edit button */}
      <button
        onClick={() => setEditOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        Edit
      </button>

      {/* Share button */}
      <ShareButton
        capsuleId={capsuleId}
        isPublic={isPublic}
        shareToken={shareToken}
      />

      {/* Edit modal */}
      <EditCapsuleModal
        capsuleId={capsuleId}
        currentTitle={title}
        currentDescription={description}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
