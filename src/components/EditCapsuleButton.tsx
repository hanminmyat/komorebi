"use client";

import { useState } from "react";
import EditCapsuleModal from "./EditCapsuleModal";

interface EditCapsuleButtonProps {
  capsuleId: string;
  title: string;
  description: string | null;
}

export default function EditCapsuleButton({
  capsuleId,
  title,
  description,
}: EditCapsuleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        Edit
      </button>

      <EditCapsuleModal
        capsuleId={capsuleId}
        currentTitle={title}
        currentDescription={description}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
