import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Pill } from "./Pill";

describe("Pill", () => {
  it("renders the provided variant attribute", () => {
    const { container, rerender } = render(
      <Pill variant="success">ok</Pill>,
    );
    expect(
      container.querySelector('[data-variant="success"]'),
    ).toBeInTheDocument();
    rerender(<Pill variant="warning">warn</Pill>);
    expect(
      container.querySelector('[data-variant="warning"]'),
    ).toBeInTheDocument();
  });
});
