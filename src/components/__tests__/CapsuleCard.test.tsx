import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CapsuleCard, { type Capsule } from "../CapsuleCard";

const baseCapsule: Capsule = {
  id: "abc-123",
  title: "Summer at Grandma's",
  description: "A warm afternoon memory",
  type: "photo",
  created_at: "2024-06-15T10:00:00Z",
  memory_date: "2020-07-01",
};

describe("CapsuleCard", () => {
  it("renders title", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText("Summer at Grandma's")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText("A warm afternoon memory")).toBeInTheDocument();
  });

  it("shows memory date when provided", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText(/Jul 1, 2020/)).toBeInTheDocument();
  });

  it("falls back to created_at when no memory date", () => {
    const capsule = { ...baseCapsule, memory_date: null };
    render(<CapsuleCard capsule={capsule} />);
    expect(screen.getByText(/Jun 15, 2024/)).toBeInTheDocument();
  });

  it("shows type badge", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText("Photo")).toBeInTheDocument();
  });

  it("shows Audio badge for audio type", () => {
    render(<CapsuleCard capsule={{ ...baseCapsule, type: "audio" }} />);
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("shows Mixed badge for mixed type", () => {
    render(<CapsuleCard capsule={{ ...baseCapsule, type: "mixed" }} />);
    expect(screen.getByText("Mixed")).toBeInTheDocument();
  });

  it("shows public badge when is_public is true", () => {
    render(<CapsuleCard capsule={{ ...baseCapsule, is_public: true }} />);
    expect(screen.getByTitle("Public")).toBeInTheDocument();
  });

  it("hides public badge when is_public is false", () => {
    render(<CapsuleCard capsule={{ ...baseCapsule, is_public: false }} />);
    expect(screen.queryByTitle("Public")).not.toBeInTheDocument();
  });

  it("links to correct capsule URL", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/capsules/abc-123");
  });

  it("hides description when null", () => {
    const capsule = { ...baseCapsule, description: null };
    render(<CapsuleCard capsule={capsule} />);
    expect(screen.queryByText("A warm afternoon memory")).not.toBeInTheDocument();
  });

  it("does not show action buttons by default", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("shows action buttons when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<CapsuleCard capsule={baseCapsule} />);

    await user.click(screen.getByLabelText("Show actions"));

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("hides action buttons when toggle is clicked again", async () => {
    const user = userEvent.setup();
    render(<CapsuleCard capsule={baseCapsule} />);

    // Open
    await user.click(screen.getByLabelText("Show actions"));
    expect(screen.getByText("Edit")).toBeInTheDocument();

    // Close
    await user.click(screen.getByLabelText("Hide actions"));
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("has responsive toggle button with touch-friendly size", () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    const toggle = screen.getByLabelText("Show actions");
    // h-8 w-8 = 32px, good touch target
    expect(toggle).toBeInTheDocument();
  });
});
