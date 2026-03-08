import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StepProgressBar from "../StepProgressBar";

const STEPS = [
  { label: "Recherche", description: "Saisissez un poste" },
  { label: "Sélection", description: "Choisissez les variantes" },
  { label: "Résultat", description: "Copiez la requête" },
];

describe("StepProgressBar", () => {
  it("should render all step labels", () => {
    // Arrange / Act
    render(<StepProgressBar currentStep={0} steps={STEPS} />);
    // Assert
    expect(screen.getByText("Recherche")).toBeInTheDocument();
    expect(screen.getByText("Sélection")).toBeInTheDocument();
    expect(screen.getByText("Résultat")).toBeInTheDocument();
  });

  it("should have accessible progressbar role", () => {
    render(<StepProgressBar currentStep={1} steps={STEPS} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "3");
  });

  it("should display step numbers for non-completed steps", () => {
    render(<StepProgressBar currentStep={0} steps={STEPS} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should show check icon for completed steps", () => {
    // Step 2 means steps 0 and 1 are completed
    const { container } = render(<StepProgressBar currentStep={2} steps={STEPS} />);
    // Completed steps render Check icon (svg) instead of number
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
