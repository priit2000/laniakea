import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App.jsx";

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

  it("renders the compute article route from Markdown", async () => {
    window.history.pushState({}, "", "/laniakea-compute");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Laniakea Compute" })).toBeInTheDocument();
    expect(screen.getByText(/Laniakea Computation Cluster/i)).toBeInTheDocument();
  });
});
