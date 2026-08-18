import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      await api.get("/auth/me");
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
