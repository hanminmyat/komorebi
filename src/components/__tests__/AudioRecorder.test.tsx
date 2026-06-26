import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AudioRecorder from "../AudioRecorder";

describe("AudioRecorder", () => {
  it("shows record button initially", () => {
    render(<AudioRecorder capsuleId="cap-1" audioCount={0} />);
    expect(screen.getByText(/Record a voice memory/)).toBeInTheDocument();
  });

  it("shows duration info", () => {
    render(<AudioRecorder capsuleId="cap-1" audioCount={0} />);
    expect(screen.getByText(/1–3 min/)).toBeInTheDocument();
  });

  it("shows full state when max audio reached", () => {
    render(<AudioRecorder capsuleId="cap-1" audioCount={1} />);
    expect(screen.getByText(/Recording already saved/)).toBeInTheDocument();
  });

  it("has accessible record button", () => {
    render(<AudioRecorder capsuleId="cap-1" audioCount={0} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
