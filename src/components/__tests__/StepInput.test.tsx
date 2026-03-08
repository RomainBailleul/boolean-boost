import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils/render";
import StepInput from "../steps/StepInput";

const defaultProps = {
  mode: "free" as const,
  setMode: vi.fn(),
  inputValue: "",
  setInputValue: vi.fn(),
  selectedCategory: "",
  setSelectedCategory: vi.fn(),
  onNext: vi.fn(),
};

describe("StepInput", () => {
  // ─── Rendering ──────────────────────────────────────────────

  it("should render mode toggle buttons", () => {
    // Arrange / Act
    renderWithProviders(<StepInput {...defaultProps} />);
    // Assert
    expect(screen.getByText("Recherche libre")).toBeInTheDocument();
    expect(screen.getByText("Par métier")).toBeInTheDocument();
  });

  it("should render free search input when mode is free", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="free" />);
    expect(screen.getByLabelText(/intitulé/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CMO/)).toBeInTheDocument();
  });

  it("should render category grid when mode is category", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="category" />);
    expect(screen.getByText("Choisissez une famille métier")).toBeInTheDocument();
    expect(screen.getByText(/marketing/i)).toBeInTheDocument();
  });

  // ─── Mode toggle ───────────────────────────────────────────

  it("should call setMode when clicking category button", async () => {
    // Arrange
    const user = userEvent.setup();
    const setMode = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} setMode={setMode} />);
    // Act
    await user.click(screen.getByText("Par métier"));
    // Assert
    expect(setMode).toHaveBeenCalledWith("category");
  });

  it("should call setMode when clicking free search button", async () => {
    const user = userEvent.setup();
    const setMode = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} mode="category" setMode={setMode} />);
    await user.click(screen.getByText("Recherche libre"));
    expect(setMode).toHaveBeenCalledWith("free");
  });

  // ─── Free mode input ───────────────────────────────────────

  it("should call setInputValue on typing", async () => {
    const user = userEvent.setup();
    const setInputValue = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} setInputValue={setInputValue} />);
    await user.type(screen.getByPlaceholderText(/CMO/), "D");
    expect(setInputValue).toHaveBeenCalled();
  });

  // ─── Category mode selection ────────────────────────────────

  it("should call setSelectedCategory when clicking a category", async () => {
    const user = userEvent.setup();
    const setSelectedCategory = vi.fn();
    renderWithProviders(
      <StepInput {...defaultProps} mode="category" setSelectedCategory={setSelectedCategory} />
    );
    await user.click(screen.getByLabelText(/Catégorie marketing/i));
    expect(setSelectedCategory).toHaveBeenCalledWith("marketing");
  });

  // ─── Next button ────────────────────────────────────────────

  it("should disable Suivant button when no input in free mode", () => {
    renderWithProviders(<StepInput {...defaultProps} inputValue="" />);
    expect(screen.getByRole("button", { name: /suivant/i })).toBeDisabled();
  });

  it("should enable Suivant button when input has value", () => {
    renderWithProviders(<StepInput {...defaultProps} inputValue="DRH" />);
    expect(screen.getByRole("button", { name: /suivant/i })).not.toBeDisabled();
  });

  it("should disable Suivant in category mode when no category selected", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="category" selectedCategory="" />);
    expect(screen.getByRole("button", { name: /suivant/i })).toBeDisabled();
  });

  it("should enable Suivant in category mode when category selected", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="category" selectedCategory="marketing" />);
    expect(screen.getByRole("button", { name: /suivant/i })).not.toBeDisabled();
  });

  it("should call onNext when clicking Suivant", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} inputValue="DRH" onNext={onNext} />);
    await user.click(screen.getByRole("button", { name: /suivant/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  // ─── Keyboard ───────────────────────────────────────────────

  it("should call onNext on Enter key when input is valid", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} inputValue="DRH" onNext={onNext} />);
    const input = screen.getByPlaceholderText(/CMO/);
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onNext).toHaveBeenCalledOnce();
  });

  // ─── Accessibility ─────────────────────────────────────────

  it("should have aria-pressed on active mode button", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="free" />);
    const freeBtn = screen.getByText("Recherche libre").closest("button");
    const catBtn = screen.getByText("Par métier").closest("button");
    expect(freeBtn).toHaveAttribute("aria-pressed", "true");
    expect(catBtn).toHaveAttribute("aria-pressed", "false");
  });
});
