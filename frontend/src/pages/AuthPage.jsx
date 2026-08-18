import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const isSignup = mode === "signup";
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = isSignup ? form : { email: form.email, password: form.password };
      const endpoint = isSignup ? "/auth/register" : "/auth/login";

      await api.post(endpoint, payload);

      if (isSignup) {
        toast.success("Account created successfully. Please log in.");
        navigate("/login", { replace: true });
      } else {
        toast.success("Logged in successfully.");
        await login();
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
            N
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSignup
              ? "Sign up to start organizing your notes."
              : "Log in to view and manage your notes."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? (isSignup ? "Creating account..." : "Logging in...") : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            to={isSignup ? "/login" : "/signup"}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
