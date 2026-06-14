// API client mirroring the entity/SDK pattern used across the app.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const TOKEN_KEY = "ecomart_token"

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

function qs(params = {}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, v)
  })
  const s = sp.toString()
  return s ? `?${s}` : ""
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || "Request failed")
    err.status = res.status
    throw err
  }
  return data
}

// Generic entity factory: list / filter / get / create / update / delete
function entity(resource) {
  const base = `/${resource}`
  return {
    list: (sort, limit) => request(`${base}${qs({ sort, limit })}`),
    filter: (query = {}, sort, limit) => request(`${base}${qs({ ...query, sort, limit })}`),
    get: (id) => request(`${base}/${id}`),
    create: (data) => request(base, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`${base}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`${base}/${id}`, { method: "DELETE" }),
  }
}

export const Product = entity("products")
export const CartItem = entity("cart")
export const WishlistItem = entity("wishlist")
export const Order = entity("orders")
export const CompanyApplication = entity("company-applications")
export const ProductRequest = entity("product-requests")
export const User = entity("users")
export const Review = entity("reviews")

export const auth = {
  me: () => request("/auth/me"),
  login: async (email, password) => {
    const r = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setToken(r.token)
    return r.user
  },
  register: async (data) => {
    const r = await request("/auth/register", { method: "POST", body: JSON.stringify(data) })
    setToken(r.token)
    return r.user
  },
  updateMe: (data) => request("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  logout: () => clearToken(),
  isAuthenticated: () => !!getToken(),
}

export const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      const token = getToken()
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Upload failed")
      return data // { file_url }
    },
  },
}
