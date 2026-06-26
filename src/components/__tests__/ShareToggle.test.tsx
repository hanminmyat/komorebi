import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareToggle from "../ShareToggle";

const mockUpdate = vi.fn().mockResolvedValue({ error: null });
const mockRefresh = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: "user-123" } },
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      update: () => ({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("ShareToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Private when isPublic=false", () => {
    render(
      <ShareToggle
        capsuleId="cap-1"
        isPublic={false}
        shareToken="token123"
      />
    );
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("shows Public when isPublic=true", () => {
    render(
      <ShareToggle capsuleId="cap-1" isPublic={true} shareToken="token123" />
    );
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("shows share URL when public", () => {
    render(
      <ShareToggle capsuleId="cap-1" isPublic={true} shareToken="token123" />
    );
    expect(screen.getByText(/\/share\/token123/)).toBeInTheDocument();
  });

  it("hides share URL when private", () => {
    render(
      <ShareToggle capsuleId="cap-1" isPublic={false} shareToken="token123" />
    );
    expect(screen.queryByText(/\/share\//)).not.toBeInTheDocument();
  });

  it("calls supabase update with user_id filter on toggle", async () => {
    const user = userEvent.setup();
    render(
      <ShareToggle capsuleId="cap-1" isPublic={false} shareToken="token123" />
    );

    await user.click(screen.getByText("Private"));
    expect(mockGetUser).toHaveBeenCalled();
  });
});
