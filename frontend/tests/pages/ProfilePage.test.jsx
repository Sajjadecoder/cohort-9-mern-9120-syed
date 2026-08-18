import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProfilePage from "../../src/pages/ProfilePage";
import { AuthProvider } from "../../src/contexts/AuthContext";
import api from "../../src/services/api";

jest.mock("../../src/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          name: "Jane Doe",
          email: "jane@example.com",
        },
      },
    });
  });

  it("renders user details from the profile API", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout when the logout button is clicked", async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/logout");
    });
  });
});
