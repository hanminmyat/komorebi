import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditCapsuleButton from "../EditCapsuleButton";

vi.mock("../EditCapsuleModal", () => ({
  default: ({
    isOpen,
    currentTitle,
    onClose,
  }: {
    isOpen: boolean;
    currentTitle: string;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <span>Editing: {currentTitle}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe("EditCapsuleButton", () => {
  it("renders Edit button", () => {
    render(
      <EditCapsuleButton
        capsuleId="123"
        title="Test Title"
        description="desc"
      />
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("opens modal on click", async () => {
    const user = userEvent.setup();
    render(
      <EditCapsuleButton
        capsuleId="123"
        title="Test Title"
        description="desc"
      />
    );

    await user.click(screen.getByText("Edit"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Editing: Test Title")).toBeInTheDocument();
  });

  it("closes modal when onClose called", async () => {
    const user = userEvent.setup();
    render(
      <EditCapsuleButton
        capsuleId="123"
        title="Test Title"
        description="desc"
      />
    );

    await user.click(screen.getByText("Edit"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    await user.click(screen.getByText("Close"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
