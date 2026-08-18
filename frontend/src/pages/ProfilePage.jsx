import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        const message = error.response?.data?.message || "Unable to load profile.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      await logout();
      toast.success("You have been logged out.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Unable to log out.";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-100 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Profile</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">User details</h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700"
          >
            Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">Loading profile...</div>
        ) : user ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-sm text-blue-700">Name</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{user.name}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 text-lg font-medium text-slate-800">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
            Profile not available.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
