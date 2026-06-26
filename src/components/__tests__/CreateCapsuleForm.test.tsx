import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateCapsuleForm from "../CreateCapsuleForm";

const mockPush = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      }),
    },
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: () => ({
          single: mockSingle.mockResolvedValue({
            data: { id: "new-capsule-id" },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("CreateCapsuleForm", () => {
  it("renders title input", () => {
    render(<CreateCapsuleForm />);
    expect(screen.getByPlaceholderText(/Summer afternoons/)).toBeInTheDocument();
  });

  it("renders description textarea", () => {
    render(<CreateCapsuleForm />);
    expect(screen.getByPlaceholderText(/Tell us a little more/)).toBeInTheDocument();
  });

  it("renders type selection buttons", () => {
    render(<CreateCapsuleForm />);
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Mixed")).toBeInTheDocument();
  });

  it("title has maxLength=200", () => {
    render(<CreateCapsuleForm />);
    expect(screen.getByPlaceholderText(/Summer afternoons/)).toHaveAttribute(
      "maxLength",
      "200"
    );
  });

  it("description has maxLength=2000", () => {
    render(<CreateCapsuleForm />);
    expect(screen.getByPlaceholderText(/Tell us a little more/)).toHaveAttribute(
      "maxLength",
      "2000"
    );
  });

  it("renders submit button", () => {
    render(<CreateCapsuleForm />);
    expect(
      screen.getByRole("button", { name: /create memory capsule/i })
    ).toBeInTheDocument();
  });

  it("validates required title", async () => {
    const user = userEvent.setup();
    render(<CreateCapsuleForm />);
    await user.click(
      screen.getByRole("button", { name: /create memory capsule/i })
    );
    // HTML validation will prevent form submission
    const titleInput = screen.getByPlaceholderText(/Summer afternoons/);
    expect(titleInput).toBeRequired();
  });
});
