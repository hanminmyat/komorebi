"use client";

const memoryPrompts = [
  "Summer afternoons at grandma's house",
  "A recipe that's been in the family",
  "The story of how my parents met",
  "My favorite childhood tradition",
  "A moment that changed everything",
  "The day we moved to a new city",
  "What dad taught me about life",
  "A trip that became family legend",
  "Something I wish I'd asked sooner",
  "The sound of home I'll never forget",
  "A photograph that says everything",
  "The best advice I was ever given",
];

interface MemoryPromptsProps {
  onSelect: (prompt: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function MemoryPrompts({
  onSelect,
  isOpen,
  onToggle,
}: MemoryPromptsProps) {
  const handleSelect = (prompt: string) => {
    onSelect(prompt);
    onToggle();
  };

  return (
    <div className="relative mt-1 sm:mt-0">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-medium transition-all sm:h-12 ${
          isOpen
            ? "border-primary bg-primary/5 text-primary"
            : "border-dashed border-border text-muted hover:border-primary/40 hover:text-primary hover:bg-surface"
        }`}
        title="Need inspiration?"
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
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
        Stuck?
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />

          <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-border bg-background p-1 shadow-2xl shadow-black/10 sm:left-0 sm:right-auto sm:w-80">
            <div className="mb-1 flex items-center justify-between px-3 pt-2 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Try one of these
              </p>
              <button
                type="button"
                onClick={onToggle}
                className="rounded-md p-0.5 text-muted transition-colors hover:text-foreground"
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
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>

            <p className="mb-2 px-3 text-xs leading-relaxed text-muted">
              Click a prompt to fill the title, then make it your own.
            </p>

            <div className="max-h-48 overflow-y-auto sm:max-h-56">
              {memoryPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSelect(prompt)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm leading-relaxed text-foreground transition-colors hover:bg-surface hover:text-primary"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
