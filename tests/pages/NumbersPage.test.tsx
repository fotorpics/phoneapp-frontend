import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import NumbersPage from "@/pages/dashboard/NumbersPage";

const toastMock = vi.fn();

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

describe("NumbersPage", () => {
  beforeEach(() => {
    toastMock.mockReset();
  });

  it("renders the phone numbers table with seeded rows", () => {
    render(<NumbersPage />);

    expect(screen.getByRole("heading", { name: "Phone Numbers" })).toBeInTheDocument();
    expect(screen.getByText("+1 (555) 100-0001")).toBeInTheDocument();
    expect(screen.getByText("+1 (555) 100-0002")).toBeInTheDocument();
    expect(screen.getByText("+1 (800) 555-0199")).toBeInTheDocument();
    expect(screen.getByText("+44 20 7946 0001")).toBeInTheDocument();
  });

  it("fires toasts for top level actions", () => {
    render(<NumbersPage />);

    fireEvent.click(screen.getByRole("button", { name: /Port Number/i }));
    fireEvent.click(screen.getByRole("button", { name: /Buy Number/i }));

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Port Number",
      }),
    );
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Buy Number",
      }),
    );
  });

  it("removes a number row when delete is clicked and emits a toast", () => {
    render(<NumbersPage />);

    const row = screen.getByText("+1 (555) 100-0001").closest("tr");
    expect(row).not.toBeNull();
    const buttons = within(row as HTMLTableRowElement).getAllByRole("button");

    fireEvent.click(buttons[1]);

    expect(screen.queryByText("+1 (555) 100-0001")).not.toBeInTheDocument();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Number removed",
        description: "+1 (555) 100-0001 was removed from the list.",
      }),
    );
  });

  it("fires assignment toast when assign button is clicked", () => {
    render(<NumbersPage />);

    const row = screen.getByText("+1 (555) 100-0001").closest("tr");
    expect(row).not.toBeNull();
    const buttons = within(row as HTMLTableRowElement).getAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Assignment",
        description: "Assigning +1 (555) 100-0001...",
      }),
    );
  });
});
