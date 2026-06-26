// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Spy on the only window action Spotlight uses, so the test stays isolated from
// the windows store / viewport chain.
const { openWindowCentered } = vi.hoisted(() => ({
  openWindowCentered: vi.fn(),
}));

vi.mock("@/hooks/useWindows", () => ({
  useWindows: () => ({ openWindowCentered }),
}));

// next/image's optimizer isn't available under vitest — render a plain img.
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: unknown; alt: string }) => {
    const resolved =
      typeof src === "string"
        ? src
        : ((src as { src?: string } | null)?.src ?? "");
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolved} alt={alt} />;
  },
}));

import { Spotlight } from "@/components/spotlight";
import { ALL_APPS } from "@/lib/apps";

describe("Spotlight", () => {
  beforeEach(() => {
    openWindowCentered.mockClear();
  });

  it("lists every app and filters the list by query", async () => {
    render(<Spotlight onClose={vi.fn()} />);

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(ALL_APPS.length);

    await userEvent.type(screen.getByRole("combobox"), "terminal");

    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent(/terminal/i);
  });

  it("shows an empty state with no matching apps", async () => {
    render(<Spotlight onClose={vi.fn()} />);

    await userEvent.type(screen.getByRole("combobox"), "zzzznope");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/no apps found/i)).toBeInTheDocument();
  });

  it("moves the active option with the arrow keys", () => {
    render(<Spotlight onClose={vi.fn()} />);
    const input = screen.getByRole("combobox");

    expect(screen.getAllByRole("option")[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.keyDown(input, { key: "ArrowDown" });
    let options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("opens the highlighted app on Enter and closes", () => {
    const onClose = vi.fn();
    render(<Spotlight onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });

    expect(openWindowCentered).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<Spotlight onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
