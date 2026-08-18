import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "../../src/pages/DashboardPage";
import api from "../../src/services/api";

jest.mock("../../src/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        notes: [
          { id: "1", title: "First note", content: "Hello world", updatedAt: "2026-08-01T00:00:00Z" },
          { id: "2", title: "Second note", content: "Another note", updatedAt: "2026-08-02T00:00:00Z" },
        ],
      },
    });
  });

  it("renders note cards from the backend", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First note")).toBeInTheDocument();
    });

    expect(screen.getByText("Second note")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new note/i })).toBeInTheDocument();
  });

  it("opens the delete confirmation flow when delete is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First note")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText(/delete note/i)[0]);
    expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
  });
});
