import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App.jsx";
import { canvasCalls } from "./test/setup.js";

describe("Laniakea static site", () => {
  it("renders the explorer on the home route", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: "The Colonization Horizon" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorer" })).toHaveAttribute("href", "/");
  });

  it("shows horizontal article links in the top menu", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(screen.getByRole("navigation", { name: "Project articles" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Colonization" })).toHaveAttribute("href", "/laniakea-colonization");
    expect(screen.getByRole("link", { name: "Compute Text" })).toHaveAttribute("href", "/laniakea-compute");
    expect(screen.queryByRole("link", { name: "Compute" })).not.toBeInTheDocument();
  });

  it("renders the colonization article route from Markdown", async () => {
    window.history.pushState({}, "", "/laniakea-colonization");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Laniakea Colonization" })).toBeInTheDocument();
    expect(screen.getByText(/realistic 1-billion-year/i)).toBeInTheDocument();
  });

  it("renders colonization formulas as readable article text", async () => {
    window.history.pushState({}, "", "/laniakea-colonization");

    render(<App />);

    await screen.findByRole("heading", { name: "Laniakea Colonization" });
    expect(document.body.textContent).toMatch(/R\s+\u2248\s+vfront\s+t/i);
    expect(document.body.textContent).not.toMatch(/\\approx|\\text|\\gamma|\[\s*R/);
    expect(document.body.textContent).not.toMatch(/\*\*/);
  });

  it("keeps the compute text available from Markdown at the compute route", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Laniakea Compute" })).toBeInTheDocument();
    expect(screen.getByText(/Laniakea Computation Cluster/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "The Computation Cluster" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ancestor Reconstruction" })).not.toBeInTheDocument();
  });

  it("renders compute formulas as readable article text", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    await screen.findByRole("heading", { name: "Laniakea Compute" });
    expect(document.body.textContent).toMatch(/K = \(log10 P - 6\) \/ 10/i);
    expect(document.body.textContent).toMatch(/Lsun\s+\u2248\s+3\.8\s+\u00d7\s+1026\s+W/i);
    expect(document.body.textContent).not.toMatch(/\\frac|\\odot|\\times|\\text|\[\s*K/);
    expect(document.body.textContent).not.toMatch(/\*\*/);
  });

  it("keeps original explorer scale controls and canvas labels working", async () => {
    canvasCalls.fillText.length = 0;
    canvasCalls.arcs.length = 0;
    window.history.pushState({}, "", "/");

    render(<App />);

    await screen.findByRole("button", { name: "linear" });
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(canvasCalls.arcs.every((call) => call[2] >= 0)).toBe(true);
    expect(canvasCalls.fillText.some((call) => call[0] === "Milky Way")).toBe(true);
    expect(canvasCalls.fillText.some((call) => call[0] === "Virgo Cluster")).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "linear" }));

    expect(screen.getByRole("button", { name: "linear" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Linear scale - true proportional distances/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "log" }));

    expect(screen.getByRole("button", { name: "log" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Logarithmic scale - the whole reachable universe/i)).toBeInTheDocument();
  });
});
