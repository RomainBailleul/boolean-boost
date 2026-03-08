import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils/render";
import BooleanGenerator from "../BooleanGenerator";

// Mock clipboard
const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
});

describe("BooleanGenerator", () => {
  // ─── Initial render ─────────────────────────────────────────

  it("should render header and step 1 by default", () => {
    renderWithProviders(<BooleanGenerator />);
    expect(screen.getByText("Boolean")).toBeInTheDocument();
    expect(screen.getByText("Boost")).toBeInTheDocument();
    expect(screen.getByText("Recherche libre")).toBeInTheDocument();
    expect(screen.getByText("Par métier")).toBeInTheDocument();
  });

  it("should show progress bar at step 1", () => {
    renderWithProviders(<BooleanGenerator />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "1");
  });

  // ─── Free mode full flow ────────────────────────────────────

  it("should navigate through all 3 steps in free mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BooleanGenerator />);

    // Step 1: Type a job title and click Suivant
    const input = screen.getByPlaceholderText(/CMO/);
    await user.type(input, "DRH");
    await user.click(screen.getByRole("button", { name: /suivant/i }));

    // Step 2: Should show variant badges and Générer button
    await waitFor(() => {
      expect(screen.getByText(/variantes auto-générées/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /générer/i })).toBeInTheDocument();

    // Click Générer
    await user.click(screen.getByRole("button", { name: /générer/i }));

    // Step 3: Should show the boolean query result
    await waitFor(() => {
      expect(screen.getByText("Votre requête Boolean")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /copier la requête/i })).toBeInTheDocument();
  });

  // ─── Category mode full flow ────────────────────────────────

  it("should navigate through all 3 steps in category mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BooleanGenerator />);

    // Step 1: Switch to category mode
    await user.click(screen.getByText("Par métier"));

    // Select a category
    await user.click(screen.getByLabelText(/Catégorie marketing/i));
    await user.click(screen.getByRole("button", { name: /suivant/i }));

    // Step 2: Should show category titles
    await waitFor(() => {
      expect(screen.getByText("Titres")).toBeInTheDocument();
    });

    // Select all and generate
    await user.click(screen.getByRole("button", { name: /tout sélectionner/i }));
    await user.click(screen.getByRole("button", { name: /générer/i }));

    // Step 3: Result
    await waitFor(() => {
      expect(screen.getByText("Votre requête Boolean")).toBeInTheDocument();
    });
  });

  // ─── Back navigation ───────────────────────────────────────

  it("should go back from step 2 to step 1", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BooleanGenerator />);

    // Go to step 2
    await user.type(screen.getByPlaceholderText(/CMO/), "DRH");
    await user.click(screen.getByRole("button", { name: /suivant/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retour/i })).toBeInTheDocument();
    });

    // Go back
    await user.click(screen.getByRole("button", { name: /retour/i }));

    // Should be back at step 1
    await waitFor(() => {
      expect(screen.getByText("Recherche libre")).toBeInTheDocument();
    });
  });

  it("should go back from step 3 to step 2", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BooleanGenerator />);

    // Navigate to step 3
    await user.type(screen.getByPlaceholderText(/CMO/), "DRH");
    await user.click(screen.getByRole("button", { name: /suivant/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /générer/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /générer/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /modifier/i })).toBeInTheDocument();
    });

    // Go back to step 2
    await user.click(screen.getByRole("button", { name: /modifier/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /générer/i })).toBeInTheDocument();
    });
  });

  // ─── Reset ──────────────────────────────────────────────────

  it("should reset to step 1 when clicking Nouveau", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BooleanGenerator />);

    // Navigate to step 3
    await user.type(screen.getByPlaceholderText(/CMO/), "DRH");
    await user.click(screen.getByRole("button", { name: /suivant/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /générer/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /générer/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /nouveau/i })).toBeInTheDocument();
    });

    // Reset
    await user.click(screen.getByRole("button", { name: /nouveau/i }));

    // Should be back at step 1 with empty input
    await waitFor(() => {
      expect(screen.getByText("Recherche libre")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/CMO/)).toHaveValue("");
  });

  // ─── Copy from step 3 ──────────────────────────────────────

  it("should copy boolean query to clipboard from step 3", async () => {
    const user = userEvent.setup();
    writeTextMock.mockClear();
    renderWithProviders(<BooleanGenerator />);

    // Navigate to step 3
    await user.type(screen.getByPlaceholderText(/CMO/), "DRH");
    await user.click(screen.getByRole("button", { name: /suivant/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /générer/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /générer/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copier la requête/i })).toBeInTheDocument();
    });

    // Copy
    await user.click(screen.getByRole("button", { name: /copier la requête/i }));
    await screen.findByText("Copié !");
    expect(writeTextMock).toHaveBeenCalled();
    // The copied value should contain OR-joined quoted titles
    const copiedValue = writeTextMock.mock.calls[0][0];
    expect(copiedValue).toContain("OR");
    expect(copiedValue).toContain('"');
  });

  // ─── Footer ─────────────────────────────────────────────────

  it("should render footer with La-Mine.io link", () => {
    renderWithProviders(<BooleanGenerator />);
    const link = screen.getByRole("link", { name: /la.mine/i });
    expect(link).toHaveAttribute("href", "https://la-mine.io");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
