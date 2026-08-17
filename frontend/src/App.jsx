import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import NoteEditorPage from "./pages/NoteEditorPage";
import ProfilePage from "./pages/ProfilePage";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage mode="login" />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthPage mode="signup" />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/new"
          element={
            <ProtectedRoute>
              <NoteEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
              <NoteEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;