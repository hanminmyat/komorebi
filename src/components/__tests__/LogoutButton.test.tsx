import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "../LogoutButton";

const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    vi.stubGlobal("location", { href: "http://localhost:3000/dashboard" });
  });

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

  it("redirects to / via window.location.href after sign out", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);
    await user.click(screen.getByText("Sign out"));
    expect(window.location.href).toBe("/");
  });
});
