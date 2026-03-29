import { linkBackend } from "../config";

export async function login(username, password) {
  console.log("🔐 [LOGIN] Request start");
  console.log("➡️ URL:", `${linkBackend}/auth/login`);
  console.log("📦 Payload:", { username, password });

  try {
    const res = await fetch(`${linkBackend}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    console.log("📡 Response status:", res.status);

    const data = await res.json();
    console.log("📥 Response data:", data);

    if (!res.ok) {
      console.error("❌ Login failed:", data);
      throw new Error(data.detail || "Login failed");
    }

    console.log("✅ Login success:", data);
    return data;
  } catch (err) {
    console.error("🔥 ERROR during login:", err.message);
    throw err;
  }
}
