const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 401) {
    throw new Error("Not authenticated");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const auth = {
  me: () => request("/auth/me"),
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (username, password, displayName) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, displayName }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
  changePassword: (password) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};

export const entries = {
  list: () => request("/entries"),
  create: (text, category) =>
    request("/entries", {
      method: "POST",
      body: JSON.stringify({ text, category }),
    }),
  remove: (id) => request(`/entries/${id}`, { method: "DELETE" }),
};
