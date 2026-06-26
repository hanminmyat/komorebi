import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MediaAlbum, { type MediaItem } from "../MediaAlbum";

const mockCreateSignedUrl = vi.fn().mockResolvedValue({
  data: { signedUrl: "https://example.com/signed/image.jpg" },
  error: null,
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        createSignedUrl: mockCreateSignedUrl,
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

const mockItems: MediaItem[] = [
  { id: "1", type: "image", url: "user/cap/1.jpg", order_index: 0 },
  { id: "2", type: "audio", url: "user/cap/2.webm", order_index: 1 },
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

  it("generates signed URLs for items", () => {
    render(<MediaAlbum items={mockItems} capsuleId="cap-1" />);
    expect(mockCreateSignedUrl).toHaveBeenCalled();
  });
});
