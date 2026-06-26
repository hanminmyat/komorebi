import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MediaAlbum, { type MediaItem } from "../MediaAlbum";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
    from: () => ({
      delete: () => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// URLs are now pre-signed server-side, so items arrive with full signed URLs
const mockItems: MediaItem[] = [
  { id: "1", type: "image", url: "https://example.supabase.co/storage/v1/object/sign/images/user/cap/1.jpg?token=abc", order_index: 0 },
  { id: "2", type: "audio", url: "https://example.supabase.co/storage/v1/object/sign/audio/user/cap/2.webm?token=def", order_index: 1 },
];

describe("MediaAlbum", () => {
  it("renders empty state when no items", () => {
    render(<MediaAlbum items={[]} capsuleId="cap-1" />);
    expect(screen.getByText("This album is empty")).toBeInTheDocument();
  });

  it("renders items when provided", () => {
    render(<MediaAlbum items={mockItems} capsuleId="cap-1" />);
    expect(screen.getByText("Voice Recording")).toBeInTheDocument();
    expect(screen.getByAltText("Capsule photo")).toBeInTheDocument();
  });

  it("shows delete buttons when not readOnly", () => {
    render(<MediaAlbum items={mockItems} capsuleId="cap-1" readOnly={false} />);
    expect(screen.getByLabelText("Remove photo from album")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove audio from album")).toBeInTheDocument();
  });

  it("hides delete buttons when readOnly", () => {
    render(<MediaAlbum items={mockItems} capsuleId="cap-1" readOnly={true} />);
    expect(screen.queryByLabelText("Remove photo from album")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Remove audio from album")).not.toBeInTheDocument();
  });

  it("uses pre-signed URLs from items directly", () => {
    render(<MediaAlbum items={mockItems} capsuleId="cap-1" />);
    const img = screen.getByAltText("Capsule photo") as HTMLImageElement;
    expect(img.src).toContain("sign/images/user/cap/1.jpg");
  });
});
