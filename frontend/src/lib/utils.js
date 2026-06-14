import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value) {
  const n = Number(value || 0)
  return `$${n.toFixed(2)}`
}

export const CATEGORIES = [
  { value: "clothing", label: "Clothing", emoji: "\u{1F455}", color: "bg-emerald-50 border-emerald-200" },
  { value: "home", label: "Home", emoji: "\u{1F3E0}", color: "bg-sky-50 border-sky-200" },
  { value: "food", label: "Food", emoji: "\u{1F957}", color: "bg-amber-50 border-amber-200" },
  { value: "beauty", label: "Beauty", emoji: "\u2728", color: "bg-pink-50 border-pink-200" },
  { value: "electronics", label: "Electronics", emoji: "\u26A1", color: "bg-violet-50 border-violet-200" },
  { value: "garden", label: "Garden", emoji: "\u{1F33F}", color: "bg-lime-50 border-lime-200" },
  { value: "accessories", label: "Accessories", emoji: "\u{1F45C}", color: "bg-orange-50 border-orange-200" },
  { value: "cleaning", label: "Cleaning", emoji: "\u{1F9F4}", color: "bg-cyan-50 border-cyan-200" },
]

export const ECO_BADGES = ["Organic", "Recycled", "Fair Trade", "Carbon Neutral", "Biodegradable"]

export const CHART_COLORS = [
  "hsl(152,55%,28%)",
  "hsl(42,80%,55%)",
  "hsl(200,50%,45%)",
  "hsl(152,45%,40%)",
  "hsl(80,30%,50%)",
  "hsl(340,75%,55%)",
]

export function roleFlags(user) {
  const role = user?.role
  const accountType = user?.account_type
  const isAdmin = role === "admin"
  const isCompany = role === "company" || accountType === "company"
  const isPendingCompany = accountType === "pending_company"
  const isCustomer = accountType === "customer"
  const isNewUser = !isAdmin && !isCompany && !isPendingCompany && !isCustomer
  return { isAdmin, isCompany, isPendingCompany, isCustomer, isNewUser }
}

export function statusColor(status) {
  switch (status) {
    case "approved":
    case "active":
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "pending":
    default:
      return "bg-amber-100 text-amber-800 border-amber-200"
  }
}
