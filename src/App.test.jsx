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
    expect(screen.getByRole("link", { name: "Compute" })).toHaveAttribute("href", "/laniakea-compute");
  });

  it("renders the colonization article route from Markdown", async () => {
    window.history.pushState({}, "", "/laniakea-colonization");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Laniakea Colonization" })).toBeInTheDocument();
    expect(screen.getByText(/realistic 1-billion-year/i)).toBeInTheDocument();
  });

  it("renders the compute explorer route", async () => {
    canvasCalls.fillText.length = 0;
    canvasCalls.arcs.length = 0;
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "The Computation Cluster" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "galactic" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "cluster" })).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(canvasCalls.arcs.every((call) => call[2] >= 0)).toBe(true);
    expect(canvasCalls.fillText.some((call) => call[0] === "Milky Way Core")).toBe(true);
    expect(canvasCalls.fillText.some((call) => call[0] === "Virgo Compute Mesh")).toBe(true);
  });

  it("updates the compute explorer visualization controls", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    await screen.findByRole("button", { name: "cluster" });
    await userEvent.click(screen.getByRole("button", { name: "cluster" }));

    expect(screen.getByRole("button", { name: "cluster" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Whole-cluster thought/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/asynchronous/i).length).toBeGreaterThan(0);
  });

  it("keeps the compute article available from Markdown", async () => {
    window.history.pushState({}, "", "/laniakea-compute-article");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Laniakea Compute" })).toBeInTheDocument();
    expect(screen.getByText(/Laniakea Computation Cluster/i)).toBeInTheDocument();
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
