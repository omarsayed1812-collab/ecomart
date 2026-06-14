import { useState } from "react"
import { motion } from "framer-motion"
import { Leaf, Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import { fadeInUp } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ full_name: "", email: "", password: "" })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === "login") {
        await login(form.email, form.password)
      } else {
        await register({ full_name: form.full_name, email: form.email, password: form.password })
      }
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary to-background p-4">
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold">EcoMart</h1>
          <p className="mt-1 text-muted-foreground">Sustainable shopping, made simple.</p>
        </div>

        <Card className="p-6">
          <div className="mb-6 flex rounded-lg bg-secondary p-1">
            <button
              onClick={() => { setMode("login"); setError(null) }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-card shadow" : "text-muted-foreground"}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("register"); setError(null) }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-card shadow" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={form.full_name} onChange={update("full_name")} required placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} required placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} required placeholder="Your password" className="pr-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Log In" : "Create Account"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: admin@ecomart.com / admin123 \u00B7 company@ecomart.com / company123 \u00B7 customer@ecomart.com / customer123
        </p>
      </motion.div>
    </div>
  )
}
