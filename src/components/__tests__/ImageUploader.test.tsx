import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ImageUploader from "../ImageUploader";

describe("ImageUploader", () => {
  it("renders drop zone", () => {
    render(<ImageUploader capsuleId="cap-1" imageCount={0} />);
    expect(screen.getByText(/Drop photos here/)).toBeInTheDocument();
  });

  it("shows remaining slot count", () => {
    render(<ImageUploader capsuleId="cap-1" imageCount={3} />);
    expect(screen.getByText(/7 of 10 slots left/)).toBeInTheDocument();
  });

  it("shows full state when max images reached", () => {
    render(<ImageUploader capsuleId="cap-1" imageCount={10} />);
    expect(screen.getByText(/Image album is full/)).toBeInTheDocument();
  });

  it("shows 10 of 10 when empty", () => {
    render(<ImageUploader capsuleId="cap-1" imageCount={0} />);
    expect(screen.getByText(/10 of 10 slots left/)).toBeInTheDocument();
  });

  it("renders file input with accept=image/*", () => {
    const { container } = render(
      <ImageUploader capsuleId="cap-1" imageCount={0} />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("accept", "image/*");
  });
});
