import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "../Logo";

describe("Logo", () => {
  it("renders Komorebi text by default", () => {
    render(<Logo />);
    expect(screen.getByText("Komorebi")).toBeInTheDocument();
  });

  it("hides text when showText=false", () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText("Komorebi")).not.toBeInTheDocument();
  });

  it("wraps in link when href provided", () => {
    render(<Logo href="/dashboard" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("renders plain div without href", () => {
    render(<Logo />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders SVG icon", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
