import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToggleActions from "../ToggleActions";

const baseCapsule = {
  id: "cap-1",
  title: "Test Capsule",
  description: "A test description",
  is_public: false,
  share_token: "tok-123",
};

describe("ToggleActions", () => {
  it("renders the toggle button", () => {
    render(<ToggleActions capsule={baseCapsule} />);
    expect(screen.getByLabelText("Show actions")).toBeInTheDocument();
  });

  it("shows 'Actions' text on the toggle button", () => {
    render(<ToggleActions capsule={baseCapsule} />);
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("does not show action buttons by default", () => {
    render(<ToggleActions capsule={baseCapsule} />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Private")).not.toBeInTheDocument();
  });

  it("shows Edit, Delete, and Share when toggled", async () => {
    const user = userEvent.setup();
    render(<ToggleActions capsule={baseCapsule} />);

    await user.click(screen.getByLabelText("Show actions"));

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("changes button label to Hide when expanded", async () => {
    const user = userEvent.setup();
    render(<ToggleActions capsule={baseCapsule} />);

    await user.click(screen.getByLabelText("Show actions"));

    expect(screen.getByLabelText("Hide actions")).toBeInTheDocument();
    expect(screen.getByText("Hide")).toBeInTheDocument();
  });

  it("collapses actions when toggled again", async () => {
    const user = userEvent.setup();
    render(<ToggleActions capsule={baseCapsule} />);

    await user.click(screen.getByLabelText("Show actions"));
    expect(screen.getByText("Edit")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Hide actions"));
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });
});
