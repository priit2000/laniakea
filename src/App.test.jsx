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

  it("renders colonization formulas as readable article text", async () => {
    window.history.pushState({}, "", "/laniakea-colonization");

    render(<App />);

    await screen.findByRole("heading", { name: "Laniakea Colonization" });
    expect(document.body.textContent).toMatch(/R\s+\u2248\s+vfront\s+t/i);
    expect(document.body.textContent).not.toMatch(/\\approx|\\text|\\gamma|\[\s*R/);
    expect(document.body.textContent).not.toMatch(/\*\*/);
  });

  it("renders the compute explorer route", async () => {
    canvasCalls.fillText.length = 0;
    canvasCalls.arcs.length = 0;
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "The Computation Cluster" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "One galaxy thinking" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Whole cluster reflection" })).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(canvasCalls.arcs.every((call) => call[2] >= 0)).toBe(true);
    expect(canvasCalls.fillText.some((call) => call[0] === "Milky Way Core")).toBe(true);
    expect(canvasCalls.fillText.some((call) => call[0] === "Virgo Compute Mesh")).toBe(true);
  });

  it("updates the compute explorer visualization controls", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    await screen.findByRole("button", { name: "Whole cluster reflection" });
    await userEvent.click(screen.getByRole("button", { name: "Whole cluster reflection" }));

    expect(screen.getByRole("button", { name: "Whole cluster reflection" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Whole-cluster thought/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/asynchronous/i).length).toBeGreaterThan(0);
  });

  it("lets compute explorer projects change use-case outputs and workload settings", async () => {
    canvasCalls.fillText.length = 0;
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("button", { name: "Ancestor Reconstruction" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Histories per cycle/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Fidelity")).toBeInTheDocument();
    expect(screen.getByLabelText("Ethics strictness")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Physics Search" }));

    expect(screen.getByRole("button", { name: "Physics Search" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Candidate models/i)).toBeInTheDocument();
    expect(screen.getByText(/Search breadth/i)).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(canvasCalls.fillText.some((call) => call[0] === "Physics Search")).toBe(true);
  });

  it("presents compute as a guided visual explorer instead of a settings wall", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Choose a cosmic project" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What happens now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rebuild a lost Earth" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run a trillion civilizations" })).toBeInTheDocument();
    expect(screen.getByText(/Advanced assumptions/i)).toBeInTheDocument();
    expect(screen.getByText(/Show the machine room/i)).toBeInTheDocument();
  });

  it("formats compute powers as scientific notation without fractional exponents", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    await screen.findByRole("heading", { name: "The Computation Cluster" });

    expect(document.body.textContent).toMatch(/x 10\^\d+/);
    expect(document.body.textContent).not.toMatch(/10\^\d+\.\d/);
  });

  it("shows detailed activity presets for the compute explorer", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("button", { name: "Civilization Sim Farm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Galaxy-Scale Art" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Asynchronous Governance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deep-Time Archive" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Star-Lifting Program" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Escape Archive Launch" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Black-Hole Compute Reserve" })).toBeInTheDocument();
  });

  it("keeps the compute article available from Markdown", async () => {
    window.history.pushState({}, "", "/laniakea-compute-article");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Laniakea Compute" })).toBeInTheDocument();
    expect(screen.getByText(/Laniakea Computation Cluster/i)).toBeInTheDocument();
  });

  it("renders compute formulas as readable article text", async () => {
    window.history.pushState({}, "", "/laniakea-compute-article");

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
