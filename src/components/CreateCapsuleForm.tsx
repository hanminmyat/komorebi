"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MemoryPrompts from "@/components/MemoryPrompts";

const typeOptions = [
  {
    value: "audio" as const,
    label: "Audio",
    description: "Record voices & stories",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
  },
  {
    value: "photo" as const,
    label: "Photo",
    description: "Collect pictures & images",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
  {
    value: "mixed" as const,
    label: "Mixed",
    description: "Photos + recordings together",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export default function CreateCapsuleForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"audio" | "photo" | "mixed">("audio");
  const [memoryDate, setMemoryDate] = useState("");
  const [dateUnknown, setDateUnknown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("capsules")
      .insert({
        title,
        description: description || null,
        type,
        user_id: user.id,
        memory_date: dateUnknown ? null : memoryDate || null,
      })
      .select()
      .single();

    if (insertError) {
      setError("Failed to create capsule. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/capsules/${data.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 sm:p-4">
          {error}
        </div>
      )}

      {/* Step 1: When did the memory happen? */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-foreground">
              When did this memory happen?
            </p>
            <p className="text-sm text-muted">
              The actual date of the memory, not today
            </p>
          </div>
        </div>

        {!dateUnknown && (
          <div>
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {!memoryDate && (
              <p className="mt-2 text-xs text-muted flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="16" y2="12" />
                  <line x1="12" x2="12.01" y1="8" y2="8" />
                </svg>
                Pick a date, or skip if you don&apos;t remember
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setDateUnknown(!dateUnknown)}
          className={`mt-3 text-sm transition-colors ${
            dateUnknown
              ? "text-primary font-medium"
              : "text-muted hover:text-foreground"
          }`}
        >
          {dateUnknown
            ? "Actually, I remember the date"
            : "I don't remember the exact date"}
        </button>
      </div>

      {/* Step 2: What's the memory? */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <svg
              width="20"
              height="20"
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
          </div>
          <div>
            <p className="font-medium text-foreground">
              What&apos;s the memory?
            </p>
            <p className="text-sm text-muted">
              Give it a title that captures the story
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g., Summer afternoons at Grandma's house"
            className="flex-1 min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted/50 placeholder:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          <MemoryPrompts
            isOpen={promptsOpen}
            onToggle={() => setPromptsOpen(!promptsOpen)}
            onSelect={(p) => setTitle(p)}
          />
        </div>

        {title.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            {title.length} character{title.length !== 1 && "s"}
          </p>
        )}

        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Tell us a little more about this memory..."
          className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted/50 placeholder:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-muted">
          Optional · Add context like who was there, where it happened, why it matters
        </p>
      </div>

      {/* Step 3: What kind of memory? */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-foreground">
              What kind of memory?
            </p>
            <p className="text-sm text-muted">
              Choose how you want to preserve it
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all sm:gap-2 sm:p-4 ${
                type === option.value
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/30 hover:bg-surface"
              }`}
            >
              <div
                className={`${
                  type === option.value
                    ? "text-primary"
                    : "text-muted"
                } [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-7 sm:[&>svg]:w-7`}
              >
                {option.icon}
              </div>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  type === option.value
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {option.label}
              </span>
              <span className="hidden text-xs text-muted sm:block">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            Creating...
          </span>
        ) : (
          "Create Memory Capsule"
        )}
      </button>
    </form>
  );
}
