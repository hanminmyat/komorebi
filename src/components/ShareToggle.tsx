"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ShareToggleProps {
  capsuleId: string;
  isPublic: boolean;
  shareToken: string;
}

export default function ShareToggle({
  capsuleId,
  isPublic,
  shareToken,
}: ShareToggleProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`;

  const togglePublic = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("capsules")
      .update({ is_public: !isPublic })
      .eq("id", capsuleId)
      .eq("user_id", user.id);

    if (!error) {
      router.refresh();
    }
    setLoading(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback: copy via temporary textarea
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {/* Toggle button */}
      <button
        onClick={togglePublic}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50"
      >
        {isPublic ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-500"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
        {loading ? "..." : isPublic ? "Public" : "Private"}
      </button>

      {/* Share link (when public) */}
      {isPublic && (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
            <span className="max-w-[180px] truncate px-2.5 py-1.5 text-xs text-muted sm:max-w-[240px]">
              {shareUrl}
            </span>
            <button
              onClick={copyLink}
              className="border-l border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied
                </span>
              ) : (
                "Copy"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
