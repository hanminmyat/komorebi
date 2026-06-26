import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "../LogoutButton";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe("LogoutButton", () => {
  it("renders Sign out text", () => {
    render(<LogoutButton />);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("calls supabase.auth.signOut on click", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);
    await user.click(screen.getByText("Sign out"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects to / after sign out", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);
    await user.click(screen.getByText("Sign out"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("calls router.refresh after sign out", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);
    await user.click(screen.getByText("Sign out"));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
