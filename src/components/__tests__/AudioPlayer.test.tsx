import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AudioPlayer from "../AudioPlayer";

// Mock HTMLAudioElement
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

beforeEach(() => {
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(mockPlay);
  vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(mockPause);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AudioPlayer", () => {
  it("renders play button initially", () => {
    render(<AudioPlayer src="https://example.com/audio.webm" />);
    expect(
      screen.getByRole("button", { name: /play recording/i })
    ).toBeInTheDocument();
  });

  it("toggles to pause on click", async () => {
    const user = userEvent.setup();
    render(<AudioPlayer src="https://example.com/audio.webm" />);

    await user.click(screen.getByRole("button", { name: /play recording/i }));
    expect(mockPlay).toHaveBeenCalled();
  });

  it("has accessible slider role", () => {
    render(<AudioPlayer src="https://example.com/audio.webm" />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("shows time display", () => {
    render(<AudioPlayer src="https://example.com/audio.webm" />);
    // Two time displays: current time and duration
    const times = screen.getAllByText("0:00");
    expect(times.length).toBe(2);
  });

  it("renders audio element with src", () => {
    const { container } = render(
      <AudioPlayer src="https://example.com/audio.webm" />
    );
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute("src", "https://example.com/audio.webm");
  });
});
