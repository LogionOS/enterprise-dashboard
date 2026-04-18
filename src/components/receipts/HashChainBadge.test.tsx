import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HashChainBadge } from "./HashChainBadge";

describe("HashChainBadge", () => {
  it("renders verified pill when verified=true", () => {
    const { container } = render(<HashChainBadge verified />);
    expect(container.querySelector('[data-chain-verified="true"]')).not.toBeNull();
    expect(screen.getByText(/Chain verified/i)).toBeInTheDocument();
  });

  it("renders tampered pill when verified=false", () => {
    const { container } = render(<HashChainBadge verified={false} />);
    expect(container.querySelector('[data-chain-verified="false"]')).not.toBeNull();
    expect(screen.getByText(/TAMPERED/)).toBeInTheDocument();
  });

  it("truncates long chain heads", () => {
    render(
      <HashChainBadge
        verified
        chainHead="0123456789abcdef0123456789abcdef"
      />,
    );
    expect(screen.getByText(/0123456789/)).toBeInTheDocument();
  });
});
