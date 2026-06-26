import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteCapsuleButton from "../DeleteCapsuleButton";

const mockDelete = vi.fn();
const mockRemove = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === "media_items") {
        return {
          select: () => ({
            eq: () => ({
              data: [
                { url: "user-id/cap-id/123.jpg", type: "image" },
                { url: "user-id/cap-id/456.webm", type: "audio" },
              ],
              error: null,
            }),
          }),
          delete: () => ({
            eq: mockDelete.mockResolvedValue({ error: null }),
          }),
        };
      }
      return {
        delete: () => ({
          eq: mockDelete.mockResolvedValue({ error: null }),
        }),
      };
    },
    storage: {
      from: () => ({
        remove: mockRemove.mockResolvedValue({ data: null, error: null }),
      }),
    },
  }),
}));

describe("DeleteCapsuleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal("location", { href: "http://localhost:3000/capsules/abc-123" });
  });

  it("renders Delete button", () => {
    render(<DeleteCapsuleButton capsuleId="cap-1" />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows confirmation dialog on click", async () => {
    const user = userEvent.setup();
    render(<DeleteCapsuleButton capsuleId="cap-1" />);
    await user.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalledWith(
      "Delete this capsule? This cannot be undone."
    );
  });

  it("does not delete when confirmation cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<DeleteCapsuleButton capsuleId="cap-1" />);
    await user.click(screen.getByText("Delete"));
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("redirects to dashboard via window.location.href after delete", async () => {
    const user = userEvent.setup();
    render(<DeleteCapsuleButton capsuleId="cap-1" />);
    await user.click(screen.getByText("Delete"));
    await vi.waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });
});
