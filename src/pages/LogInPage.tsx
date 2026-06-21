import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { AnimatedRealoLogo } from "@/components/RealoLoader";

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (credentials.username === "admin" && credentials.password === "admin") {
      sessionStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password. Try admin/admin.");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050705] px-5 py-10 text-[#f5f0e8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(201,171,3,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(10,72,52,0.7),transparent_36%),linear-gradient(145deg,rgba(10,72,52,0.78)_0%,rgba(5,7,5,0.96)_46%,#050705_100%)]" />

      <div className="relative w-full max-w-md border border-real-estate-secondary/25 bg-[#08150f]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="border-b border-real-estate-secondary/15 px-8 pt-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mx-auto inline-flex items-center justify-center"
            aria-label="Go to home page"
          >
            <AnimatedRealoLogo />
          </button>

          <p className="realo-login-rise mt-6 font-text text-xs uppercase tracking-[0.32em] text-real-estate-secondary">
            Admin Access
          </p>
          <h1 className="realo-login-rise mt-2 font-title text-5xl leading-none text-[#f5f0e8]">
            Dashboard
          </h1>
          <p className="realo-login-rise mx-auto mt-3 max-w-xs pb-8 text-sm leading-6 text-[#f5f0e8]/60">
            Sign in to manage Realo properties, media, floor plans, and Pioneer virtual tours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="realo-login-rise space-y-5 px-8 py-8">
          <label className="block space-y-2" htmlFor="username">
            <span className="font-text text-xs uppercase tracking-[0.22em] text-real-estate-secondary">
              Username
            </span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-real-estate-secondary/75" />
              <input
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full border border-real-estate-secondary/20 bg-[#050705] py-3.5 pl-11 pr-4 text-[#f5f0e8] outline-none transition placeholder:text-[#f5f0e8]/30 focus:border-real-estate-secondary focus:ring-2 focus:ring-real-estate-secondary/15"
                required
              />
            </span>
          </label>

          <label className="block space-y-2" htmlFor="password">
            <span className="font-text text-xs uppercase tracking-[0.22em] text-real-estate-secondary">
              Password
            </span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-real-estate-secondary/75" />
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border border-real-estate-secondary/20 bg-[#050705] py-3.5 pl-11 pr-4 text-[#f5f0e8] outline-none transition placeholder:text-[#f5f0e8]/30 focus:border-real-estate-secondary focus:ring-2 focus:ring-real-estate-secondary/15"
                required
              />
            </span>
          </label>

          {error ? (
            <div className="border border-red-500/35 bg-red-950/25 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-real-estate-secondary bg-real-estate-secondary py-3.5 font-text text-xs font-bold uppercase tracking-[0.24em] text-real-estate-primary transition hover:bg-[#f1d676] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
