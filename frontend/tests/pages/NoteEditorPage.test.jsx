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

jest.mock("react-quill-new");

jest.mock("react-quill-new/dist/quill.snow.css", () => ({}));

describe("NoteEditorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the create note form", async () => {
    render(
      <MemoryRouter initialEntries={["/notes/new"]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/write a new note/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save note/i })
    ).toBeInTheDocument();
  });

  it("submits a note successfully", async () => {
    api.post.mockResolvedValue({
      data: {
        success: true,
      },
    });

    render(
      <MemoryRouter initialEntries={["/notes/new"]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/write a new note/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: {
        value: "Test note",
      },
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
      target: {
        value: "<p>This is my test note.</p>",
      },
    });

    const saveButton = screen.getByRole("button", {
      name: /save note/i,
    });

    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/notes", {
        title: "Test note",
        content: "<p>This is my test note.</p>",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  it("loads an existing note in edit mode", async () => {
    api.get.mockResolvedValue({
      data: {
        note: {
          id: "123",
          title: "Existing note",
          content: "<p>Existing content</p>",
        },
      },
    });

    render(
      <MemoryRouter initialEntries={["/notes/123"]}>
        <Routes>
          <Route path="/notes/:id" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/notes/123");
    });

    expect(
      await screen.findByDisplayValue("Existing note")
    ).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue("<p>Existing content</p>")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("updates an existing note successfully", async () => {
    api.get.mockResolvedValue({
      data: {
        note: {
          id: "123",
          title: "Old title",
          content: "<p>Old content</p>",
        },
      },
    });

    api.put.mockResolvedValue({
      data: {
        success: true,
      },
    });

    render(
      <MemoryRouter initialEntries={["/notes/123"]}>
        <Routes>
          <Route path="/notes/:id" element={<NoteEditorPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/notes/123");
    });

    const titleInput = await screen.findByDisplayValue("Old title");
    const contentInput = await screen.findByDisplayValue(
      "<p>Old content</p>"
    );

    fireEvent.change(titleInput, {
      target: {
        value: "Updated title",
      },
    });

    fireEvent.change(contentInput, {
      target: {
        value: "<p>Updated content</p>",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/notes/123", {
        title: "Updated title",
        content: "<p>Updated content</p>",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  it("does not submit when title is empty", async () => {
    render(
      <MemoryRouter initialEntries={["/notes/new"]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/write a new note/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
      target: {
        value: "<p>Some content</p>",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save note/i,
      })
    );

    expect(api.post).not.toHaveBeenCalled();
  });

  it("does not submit when content is empty", async () => {
    render(
      <MemoryRouter initialEntries={["/notes/new"]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/write a new note/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: {
        value: "Test note",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save note/i,
      })
    );

    expect(api.post).not.toHaveBeenCalled();
  });
});