import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileForm from "../ProfileForm";
import type { User } from "@supabase/supabase-js";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
} as User;

const mockProfile = {
  id: "user-123",
  full_name: "Test User",
  avatar_url: null,
};

const mockUpsert = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert.mockResolvedValue({ error: null }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("ProfileForm", () => {
  it("renders full name input", () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
  });

  it("renders email as read-only", () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);
    const emailInput = screen.getByLabelText(/Email/);
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("pre-fills full name", () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("Test User");
  });

  it("name has maxLength=100", () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);
    expect(screen.getByLabelText(/Full Name/)).toHaveAttribute(
      "maxLength",
      "100"
    );
  });

  it("shows user avatar initial", () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });
});
