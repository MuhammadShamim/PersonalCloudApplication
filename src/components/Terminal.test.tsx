import { render, screen } from "@testing-library/react";
import { Terminal } from "./Terminal";
import { describe, it, expect } from "vitest";

describe("Terminal Component", () => {
  it("renders the title correctly", () => {
    render(<Terminal logs={[]} />);
    expect(screen.getByText("System Logs")).toBeInTheDocument();
  });

  it("displays logs passed via props", () => {
    const testLogs = ["[INFO] System starting", "[ERR] Connection failed"];
    render(<Terminal logs={testLogs} />);

    // Check if both log lines are visible
    expect(screen.getByText("[INFO] System starting")).toBeInTheDocument();
    expect(screen.getByText("[ERR] Connection failed")).toBeInTheDocument();
  });

  it("handles empty logs gracefully", () => {
    render(<Terminal logs={[]} />);
    const logLines = document.getElementsByClassName("terminal-line");
    expect(logLines.length).toBe(0);
  });
});