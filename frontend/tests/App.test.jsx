import { render, screen, waitFor } from "@testing-library/react";
import App from "../src/App";
import { AuthProvider } from "../src/contexts/AuthContext";
import api from "../src/services/api";

jest.mock("../src/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("App routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.history.pushState({}, "", "/login");
    api.get.mockRejectedValue(new Error("Unauthorized"));
  });

  it("renders the login screen by default", async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });
});
