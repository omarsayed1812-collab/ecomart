import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Leaf, ShoppingCart, Heart, Search, Menu, X, User as UserIcon,
  LayoutDashboard, BarChart3, Package, LogOut, Shield,
} from "lucide-react"
import { CartItem, WishlistItem } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { roleFlags, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isCustomer, isCompany, isAdmin } = roleFlags(user)
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count"],
    queryFn: async () => (await CartItem.list()).length,
    enabled: isCustomer,
  })
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: async () => (await WishlistItem.list()).length,
    enabled: isCustomer,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(search)}`)
    setMobileOpen(false)
  }

  const navLinks = []
  if (isCustomer || (!isCompany && !isAdmin)) {
    navLinks.push({ to: "/products", label: "Shop", icon: Package })
  }
  if (isCompany) {
    navLinks.push({ to: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard })
    navLinks.push({ to: "/company/analytics", label: "Analytics", icon: BarChart3 })
  }
  if (isAdmin) {
    navLinks.push({ to: "/admin", label: "Admin", icon: Shield })
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-bold">EcoMart</span>
        </Link>

        {(isCustomer || (!isCompany && !isAdmin)) && (
          <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sustainable products..."
              className="pl-9"
            />
          </form>
        )}

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}

          {isCustomer && (
            <>
              <Link to="/wishlist" className="relative rounded-md p-2 hover:bg-secondary">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative rounded-md p-2 hover:bg-secondary">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <Dropdown
            trigger={
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <UserIcon className="h-4 w-4" />
              </button>
            }
          >
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            {isCustomer && (
              <DropdownItem onClick={() => navigate("/orders")}>
                <Package className="h-4 w-4" /> My Orders
              </DropdownItem>
            )}
            <DropdownItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownItem>
          </Dropdown>
        </nav>

        <button
          className="ml-auto rounded-md p-2 hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden">
          {(isCustomer || (!isCompany && !isAdmin)) && (
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </form>
          )}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  <Icon className="h-4 w-4" /> {link.label}
                </Link>
              )
            })}
            {isCustomer && (
              <>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                  <Heart className="h-4 w-4" /> Wishlist ({wishlistCount})
                </Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                  <ShoppingCart className="h-4 w-4" /> Cart ({cartCount})
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                  <Package className="h-4 w-4" /> My Orders
                </Link>
              </>
            )}
            <button onClick={logout} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-secondary">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
