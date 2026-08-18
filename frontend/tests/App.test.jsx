import { render, screen } from "@testing-library/react";
import App from "../src/App";

jest.mock("../src/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  saveAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

describe("App routes", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/login");
  });

  it("renders the login screen by default", () => {
    render(<App />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });
});
