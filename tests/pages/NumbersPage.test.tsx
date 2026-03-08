import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NumbersPage from "@/pages/dashboard/NumbersPage";

const toastMock = vi.fn();

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe("NumbersPage", () => {
  beforeEach(() => {
    toastMock.mockReset();
    queryClient.clear();
    
    // Mock the fetch call for useQuery
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { number: "+1 (555) 100-0001", type: "LOCAL", assignedAt: "2024-01-01T00:00:00Z" },
        { number: "+1 (800) 555-0199", type: "TOLL-FREE", assignedAt: "2024-02-01T00:00:00Z" }
      ]),
    });
  });

  it("renders the phone numbers table with fetched rows", async () => {
    renderWithClient(<NumbersPage />);

    expect(screen.getByRole("heading", { name: "Phone Numbers" })).toBeInTheDocument();
    
    // Wait for react-query to resolve and render data
    await waitFor(() => {
      expect(screen.getByText("+1 (555) 100-0001")).toBeInTheDocument();
      expect(screen.getByText("+1 (800) 555-0199")).toBeInTheDocument();
    });
  });

  it("opens the Buy Number modal", async () => {
    renderWithClient(<NumbersPage />);

    const buyButton = screen.getByRole("button", { name: /Buy Number/i });
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(screen.getByText("Buy a New Number")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Area Code (e.g. 212)")).toBeInTheDocument();
    });
  });

  it("fires a 'coming soon' toast when delete is clicked", async () => {
    renderWithClient(<NumbersPage />);

    await waitFor(() => {
      expect(screen.getByText("+1 (555) 100-0001")).toBeInTheDocument();
    });

    const row = screen.getByText("+1 (555) 100-0001").closest("tr");
    expect(row).not.toBeNull();
    const buttons = within(row as HTMLTableRowElement).getAllByRole("button");

    // Click the Trash icon button
    fireEvent.click(buttons[0]);

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Remove number",
        description: "Feature coming soon",
      }),
    );
  });
});
