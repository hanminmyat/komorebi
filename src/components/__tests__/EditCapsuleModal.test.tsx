import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditCapsuleModal from "../EditCapsuleModal";

const mockUpdate = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      update: mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("EditCapsuleModal", () => {
  it("renders when isOpen=true", () => {
    render(
      <EditCapsuleModal
        capsuleId="123"
        currentTitle="Test Title"
        currentDescription="desc"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Edit Capsule")).toBeInTheDocument();
  });

  it("hidden when isOpen=false", () => {
    render(
      <EditCapsuleModal
        capsuleId="123"
        currentTitle="Test Title"
        currentDescription="desc"
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText("Edit Capsule")).not.toBeInTheDocument();
  });

  it("title has maxLength=200", () => {
    render(
      <EditCapsuleModal
        capsuleId="123"
        currentTitle="Test Title"
        currentDescription="desc"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Title/)).toHaveAttribute("maxLength", "200");
  });

  it("description has maxLength=2000", () => {
    render(
      <EditCapsuleModal
        capsuleId="123"
        currentTitle="Test Title"
        currentDescription="desc"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Description/)).toHaveAttribute(
      "maxLength",
      "2000"
    );
  });

  it("calls onClose on cancel", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <EditCapsuleModal
        capsuleId="123"
        currentTitle="Test Title"
        currentDescription="desc"
        isOpen={true}
        onClose={onClose}
      />
    );

    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("pre-fills title and description", () => {
    render(
      <EditCapsuleModal
        capsuleId="123"
        currentTitle="Pre-filled Title"
        currentDescription="Pre-filled desc"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Title/)).toHaveValue("Pre-filled Title");
    expect(screen.getByLabelText(/Description/)).toHaveValue(
      "Pre-filled desc"
    );
  });
});
