import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareButton from "../ShareButton";

const mockUpdate = vi.fn().mockResolvedValue({ error: null });
const mockRefresh = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: "user-123" } },
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      update: mockUpdate,
      eq: vi.fn().mockReturnThis(),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("ShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Make Public when private", () => {
    render(
      <ShareButton capsuleId="cap-1" isPublic={false} shareToken="token123" />
    );
    expect(screen.getByText("Make Public")).toBeInTheDocument();
  });

  it("shows Make Private when public", () => {
    render(
      <ShareButton capsuleId="cap-1" isPublic={true} shareToken="token123" />
    );
    expect(screen.getByText("Make Private")).toBeInTheDocument();
  });

  it("shows share URL input when public", () => {
    render(
      <ShareButton capsuleId="cap-1" isPublic={true} shareToken="token123" />
    );
    const input = screen.getByLabelText("Share link") as HTMLInputElement;
    expect(input.value).toContain("/share/token123");
  });

  it("hides share URL when private", () => {
    render(
      <ShareButton capsuleId="cap-1" isPublic={false} shareToken="token123" />
    );
    expect(screen.queryByLabelText("Share link")).not.toBeInTheDocument();
  });

  it("shows Copy button when public", () => {
    render(
      <ShareButton capsuleId="cap-1" isPublic={true} shareToken="token123" />
    );
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });
});
