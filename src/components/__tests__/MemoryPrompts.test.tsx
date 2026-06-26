import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MemoryPrompts from "../MemoryPrompts";

describe("MemoryPrompts", () => {
  it("renders nothing when isOpen=false", () => {
    render(
      <MemoryPrompts onSelect={vi.fn()} isOpen={false} onToggle={vi.fn()} />
    );
    expect(screen.queryByText(/Try one of these/)).not.toBeInTheDocument();
  });

  it("renders prompts when isOpen=true", () => {
    render(
      <MemoryPrompts onSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} />
    );
    expect(screen.getByText(/Try one of these/)).toBeInTheDocument();
    expect(
      screen.getByText(/Summer afternoons at grandma's house/)
    ).toBeInTheDocument();
  });

  it("renders all 12 prompts", () => {
    render(
      <MemoryPrompts onSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} />
    );
    const buttons = screen.getAllByRole("button");
    // 12 prompt buttons + 1 close button + 1 "Stuck?" button
    expect(buttons.length).toBeGreaterThanOrEqual(12);
  });

  it("calls onSelect and onToggle on prompt click", async () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryPrompts onSelect={onSelect} isOpen={true} onToggle={onToggle} />
    );

    await user.click(
      screen.getByText(/Summer afternoons at grandma's house/)
    );
    expect(onSelect).toHaveBeenCalledWith(
      "Summer afternoons at grandma's house"
    );
    expect(onToggle).toHaveBeenCalled();
  });

  it("calls onToggle when close button clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryPrompts onSelect={vi.fn()} isOpen={true} onToggle={onToggle} />
    );

    // Find the "Stuck?" toggle button (first button)
    const stuckButton = screen.getByText("Stuck?");
    await user.click(stuckButton);
    expect(onToggle).toHaveBeenCalled();
  });
});
