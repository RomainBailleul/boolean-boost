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
  selectedCategories: [] as string[],
  setSelectedCategories: vi.fn(),
  onNext: vi.fn(),
};

describe("StepInput", () => {
  it("should render mode toggle buttons", () => {
    renderWithProviders(<StepInput {...defaultProps} />);
    expect(screen.getByText("Recherche libre")).toBeInTheDocument();
    expect(screen.getByText("Par métier")).toBeInTheDocument();
  });

  it("should render free search input in free mode", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="free" />);
    expect(screen.getByPlaceholderText(/CMO/)).toBeInTheDocument();
  });

  it("should render category grid in category mode", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="category" />);
    expect(screen.getByText(/marketing/i)).toBeInTheDocument();
  });

  it("should call setMode when clicking mode buttons", async () => {
    const user = userEvent.setup();
    const setMode = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} setMode={setMode} />);
    await user.click(screen.getByText("Par métier"));
    expect(setMode).toHaveBeenCalledWith("category");
  });

  it("should call setInputValue on typing", async () => {
    const user = userEvent.setup();
    const setInputValue = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} setInputValue={setInputValue} />);
    await user.type(screen.getByPlaceholderText(/CMO/), "D");
    expect(setInputValue).toHaveBeenCalled();
  });

  it("should call setSelectedCategories when clicking a category", async () => {
    const user = userEvent.setup();
    const setSelectedCategories = vi.fn();
    renderWithProviders(
      <StepInput {...defaultProps} mode="category" setSelectedCategories={setSelectedCategories} />
    );
    await user.click(screen.getByText(/marketing/i));
    expect(setSelectedCategories).toHaveBeenCalled();
  });

  it("should disable Suivant when no input", () => {
    renderWithProviders(<StepInput {...defaultProps} inputValue="" />);
    expect(screen.getByRole("button", { name: /suivant/i })).toBeDisabled();
  });

  it("should enable Suivant with input value", () => {
    renderWithProviders(<StepInput {...defaultProps} inputValue="CMO" />);
    expect(screen.getByRole("button", { name: /suivant/i })).not.toBeDisabled();
  });

  it("should enable Suivant with selected categories", () => {
    renderWithProviders(
      <StepInput {...defaultProps} mode="category" selectedCategories={["marketing"]} />
    );
    expect(screen.getByRole("button", { name: /suivant/i })).not.toBeDisabled();
  });

  it("should disable Suivant without selected categories", () => {
    renderWithProviders(
      <StepInput {...defaultProps} mode="category" selectedCategories={[]} />
    );
    expect(screen.getByRole("button", { name: /suivant/i })).toBeDisabled();
  });

  it("should call onNext when clicking Suivant", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} inputValue="CMO" onNext={onNext} />);
    await user.click(screen.getByRole("button", { name: /suivant/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("should call onNext on Enter in free mode", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderWithProviders(<StepInput {...defaultProps} inputValue="CMO" onNext={onNext} />);
    await user.type(screen.getByPlaceholderText(/CMO/), "{Enter}");
    expect(onNext).toHaveBeenCalled();
  });

  it("should set aria-pressed on mode buttons", () => {
    renderWithProviders(<StepInput {...defaultProps} mode="free" />);
    expect(screen.getByText("Recherche libre").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Par métier").closest("button")).toHaveAttribute("aria-pressed", "false");
  });
});
