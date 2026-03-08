import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils/render";
import StepSelect from "../steps/StepSelect";

const defaultProps = {
  mode: "category" as const,
  inputValue: "",
  selectedCategory: "marketing",
  selectedTitles: [] as string[],
  setSelectedTitles: vi.fn(),
  customTitles: [] as string[],
  setCustomTitles: vi.fn(),
  exclusions: [] as string[],
  setExclusions: vi.fn(),
  skills: [] as string[],
  setSkills: vi.fn(),
  onNext: vi.fn(),
  onBack: vi.fn(),
};

describe("StepSelect", () => {
  // ─── Rendering ──────────────────────────────────────────────

  it("should render title section", () => {
    renderWithProviders(<StepSelect {...defaultProps} />);
    expect(screen.getByText("Titres")).toBeInTheDocument();
  });

  it("should render category titles as badges in category mode", () => {
    renderWithProviders(<StepSelect {...defaultProps} />);
    // Marketing category has titles like CMO, etc.
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should show selected count", () => {
    renderWithProviders(
      <StepSelect {...defaultProps} selectedTitles={["CMO", "Directeur Marketing"]} />
    );
    expect(screen.getByText(/2 sélectionnés/)).toBeInTheDocument();
  });

  it("should show singular when 1 selected", () => {
    renderWithProviders(<StepSelect {...defaultProps} selectedTitles={["CMO"]} />);
    expect(screen.getByText(/1 sélectionné$/)).toBeInTheDocument();
  });

  // ─── Select all / Deselect all ─────────────────────────────

  it("should call setSelectedTitles on Tout sélectionner click", async () => {
    const user = userEvent.setup();
    const setSelectedTitles = vi.fn();
    renderWithProviders(
      <StepSelect {...defaultProps} setSelectedTitles={setSelectedTitles} />
    );
    await user.click(screen.getByRole("button", { name: /tout sélectionner/i }));
    expect(setSelectedTitles).toHaveBeenCalled();
  });

  it("should call setSelectedTitles([]) on Tout désélectionner click", async () => {
    const user = userEvent.setup();
    const setSelectedTitles = vi.fn();
    renderWithProviders(
      <StepSelect {...defaultProps} setSelectedTitles={setSelectedTitles} />
    );
    await user.click(screen.getByRole("button", { name: /tout désélectionner/i }));
    expect(setSelectedTitles).toHaveBeenCalledWith([]);
  });

  // ─── Badge toggle ──────────────────────────────────────────

  it("should call setSelectedTitles when clicking a badge", async () => {
    const user = userEvent.setup();
    const setSelectedTitles = vi.fn();
    renderWithProviders(
      <StepSelect {...defaultProps} setSelectedTitles={setSelectedTitles} />
    );
    const badges = screen.getAllByRole("checkbox");
    await user.click(badges[0]);
    expect(setSelectedTitles).toHaveBeenCalled();
  });

  // ─── Custom title input ────────────────────────────────────

  it("should render custom title input", () => {
    renderWithProviders(<StepSelect {...defaultProps} />);
    expect(screen.getByPlaceholderText(/titre personnalisé/i)).toBeInTheDocument();
  });

  it("should add custom title on Enter", async () => {
    const user = userEvent.setup();
    const setCustomTitles = vi.fn();
    const setSelectedTitles = vi.fn();
    renderWithProviders(
      <StepSelect
        {...defaultProps}
        setCustomTitles={setCustomTitles}
        setSelectedTitles={setSelectedTitles}
      />
    );
    const input = screen.getByPlaceholderText(/titre personnalisé/i);
    await user.type(input, "Mon Titre{Enter}");
    expect(setCustomTitles).toHaveBeenCalled();
    expect(setSelectedTitles).toHaveBeenCalled();
  });

  // ─── Navigation buttons ────────────────────────────────────

  it("should call onBack when clicking Retour", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderWithProviders(<StepSelect {...defaultProps} onBack={onBack} />);
    await user.click(screen.getByRole("button", { name: /retour/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("should disable Générer button when no titles selected", () => {
    renderWithProviders(<StepSelect {...defaultProps} selectedTitles={[]} />);
    expect(screen.getByRole("button", { name: /générer/i })).toBeDisabled();
  });

  it("should enable Générer button when titles are selected", () => {
    renderWithProviders(<StepSelect {...defaultProps} selectedTitles={["CMO"]} />);
    expect(screen.getByRole("button", { name: /générer/i })).not.toBeDisabled();
  });

  it("should call onNext when clicking Générer", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderWithProviders(
      <StepSelect {...defaultProps} selectedTitles={["CMO"]} onNext={onNext} />
    );
    await user.click(screen.getByRole("button", { name: /générer/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  // ─── Free mode with variants ───────────────────────────────

  it("should show auto-generated variants section in free mode", () => {
    renderWithProviders(
      <StepSelect
        {...defaultProps}
        mode="free"
        inputValue="DRH"
        selectedCategory=""
      />
    );
    expect(screen.getByText(/variantes auto-générées/i)).toBeInTheDocument();
  });

  it("should show Suggestions label in free mode", () => {
    renderWithProviders(
      <StepSelect
        {...defaultProps}
        mode="free"
        inputValue="DRH"
        selectedCategory=""
      />
    );
    expect(screen.getByText("Suggestions")).toBeInTheDocument();
  });
});
