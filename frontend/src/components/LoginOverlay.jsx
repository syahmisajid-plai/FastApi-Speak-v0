import { useState } from "react";
import { login } from "../services/authService";

export default function LoginOverlay({ onClose, onLoginSuccess }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(form.username, form.password);

      // kirim ke parent
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }

      // simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(res.user));

      // tutup overlay
      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        {/* Title */}
        <h2 className="text-white text-2xl font-semibold text-center">
          Login Required 🔐
        </h2>
        <p className="text-white/60 text-sm text-center mt-1">
          Please sign in to continue
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center mt-3">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Username / Email */}
          <div>
            <label className="text-white text-sm">Username or Email</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username or email"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-white/40"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-white text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-white/40"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3! rounded-xl bg-white! text-black font-medium active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Cancel */}
        {onClose && (
          <button
            // onClick={onClose}
            className="mt-4 w-full text-white/50 text-sm hover:text-white transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
