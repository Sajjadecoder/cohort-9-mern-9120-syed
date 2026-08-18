import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NoteEditorPage from "../../src/pages/NoteEditorPage";
import api from "../../src/services/api";

jest.mock("../../src/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe("NoteEditorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the create note form", () => {
    render(
      <MemoryRouter initialEntries={["/notes/new"]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/write a new note/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  });

  it("submits a note successfully", async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={["/notes/new"]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Test note" } });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: "This is a test note body." },
    });

    fireEvent.click(screen.getByRole("button", { name: /save note/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/notes", {
        title: "Test note",
        content: "This is a test note body.",
      });
    });
  });
});
