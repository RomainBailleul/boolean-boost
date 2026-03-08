import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils/render";
import StepResult from "../steps/StepResult";

const defaultProps = {
  booleanQuery: '"CMO" OR "Directeur Marketing" OR "Marketing Director"',
  selectedCount: 3,
  onBack: vi.fn(),
  onReset: vi.fn(),
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe("StepResult", () => {
  // ─── Rendering ──────────────────────────────────────────────

  it("should render the boolean query in a textarea", () => {
    // Arrange / Act
    renderWithProviders(<StepResult {...defaultProps} />);
    // Assert
    const textarea = screen.getByDisplayValue(defaultProps.booleanQuery);
    expect(textarea).toBeInTheDocument();
  });

  it("should display selected count badge", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    expect(screen.getByText("3 titres")).toBeInTheDocument();
  });

  it("should display character count", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    expect(screen.getByText(`${defaultProps.booleanQuery.length} car.`)).toBeInTheDocument();
  });

  it("should render the header with LinkedIn icon", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    expect(screen.getByText("Votre requête Boolean")).toBeInTheDocument();
  });

  it("should render the help text about LinkedIn Sales Navigator", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    expect(screen.getByText(/Sales Navigator/)).toBeInTheDocument();
  });

  // ─── Copy button ───────────────────────────────────────────

  it("should render copy button", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    expect(screen.getByRole("button", { name: /copier la requête/i })).toBeInTheDocument();
  });

  it("should call clipboard writeText on copy click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StepResult {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /copier la requête/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.booleanQuery);
  });

  // ─── Save section ──────────────────────────────────────────

  it("should render save input and button", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    expect(screen.getByText(/sauvegarder cette requête/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nom/i)).toBeInTheDocument();
  });

  // ─── Navigation buttons ────────────────────────────────────

  it("should call onBack when clicking Modifier", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderWithProviders(<StepResult {...defaultProps} onBack={onBack} />);
    await user.click(screen.getByRole("button", { name: /modifier/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("should call onReset when clicking Nouveau", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithProviders(<StepResult {...defaultProps} onReset={onReset} />);
    await user.click(screen.getByRole("button", { name: /nouveau/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  // ─── Edge cases ─────────────────────────────────────────────

  it("should render correctly with empty query", () => {
    renderWithProviders(<StepResult {...defaultProps} booleanQuery="" selectedCount={0} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("");
    expect(screen.getByText("0 titres")).toBeInTheDocument();
  });

  it("should make textarea readonly", () => {
    renderWithProviders(<StepResult {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("readonly");
  });
});
