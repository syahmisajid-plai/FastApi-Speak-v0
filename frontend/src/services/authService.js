import { linkBackend } from "../config";

// ======================
// LOGIN
// ======================
export async function login(username, password) {
  console.log("🔐 [LOGIN] Request:", { username });

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

  const data = await res.json();

  console.log("🔐 [LOGIN] Response:", data);

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

// ======================
// SAVE USER
// ======================
export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

// ======================
// GET USER
// ======================
export function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

// ======================
// LOGOUT
// ======================
export function logout() {
  console.log("🚪 [LOGOUT]");
  localStorage.removeItem("user");
}
