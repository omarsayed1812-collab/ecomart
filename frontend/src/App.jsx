import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { Loader2 } from "lucide-react"
import { queryClient } from "@/lib/query-client"
import { AuthProvider, useAuth } from "@/lib/AuthContext"
import AppLayout from "@/components/layout/AppLayout"
import Login from "@/pages/Login"
import Home from "@/pages/Home"
import Products from "@/pages/Products"
import ProductDetails from "@/pages/ProductDetails"
import Cart from "@/pages/Cart"
import Checkout from "@/pages/Checkout"
import OrderSuccess from "@/pages/OrderSuccess"
import Orders from "@/pages/Orders"
import Wishlist from "@/pages/Wishlist"
import SetupProfile from "@/pages/SetupProfile"
import CompanyDashboard from "@/pages/company/Dashboard"
import CompanyAnalytics from "@/pages/company/Analytics"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import PageNotFound from "@/pages/PageNotFound"

function AuthenticatedApp() {
  const { isAuthenticated, isLoadingAuth } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/analytics" element={<CompanyAnalytics />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthenticatedApp />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
