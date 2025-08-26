import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Lock, User } from "lucide-react";

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (credentials.username === "admin" && credentials.password === "admin") {
      sessionStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid username or password. Try admin/admin.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b1220]">
      <div className="w-full max-w-md rounded-2xl border border-[#1e2837] bg-[#111826]/70 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]">
        {/* Header */}
        <div className="px-8 pt-8 text-center space-y-4">
          <div className="mx-auto w-fit rounded-xl p-3 bg-[#1a2a3d]">
            <Building2 className="h-8 w-8 text-[#89b4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#e6edf6]">
              Property Dashboard
            </h1>
            <p className="text-sm text-[#9aa4b2]">
              Sign in to manage your properties
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 space-y-5">
          {/* Username */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#c9d4e0]"
            >
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7685]" />
              <input
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full rounded-lg border border-[#2b3444] bg-[#0e1420] pl-10 pr-3 py-3 text-[#e6edf6] placeholder:text-[#6b7685] focus:outline-none focus:ring-2 focus:ring-[#5b9cff] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#c9d4e0]"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7685]" />
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-lg border border-[#2b3444] bg-[#0e1420] pl-10 pr-3 py-3 text-[#e6edf6] placeholder:text-[#6b7685] focus:outline-none focus:ring-2 focus:ring-[#5b9cff] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5b9cff] py-3 font-semibold text-[#0a1220] transition hover:bg-[#4a8ef5] disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-[#8c96a5]">
            Demo credentials: <span className="text-[#e6edf6]">admin</span> /{" "}
            <span className="text-[#e6edf6]">admin</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
