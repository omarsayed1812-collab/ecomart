import { useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/AuthContext"
import { roleFlags } from "@/lib/utils"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { isNewUser } = roleFlags(user)

  useEffect(() => {
    if (isNewUser && location.pathname !== "/setup-profile") {
      navigate("/setup-profile", { replace: true })
    }
  }, [isNewUser, location.pathname, navigate])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
