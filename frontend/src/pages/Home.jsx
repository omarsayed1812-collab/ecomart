import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Leaf, ShieldCheck, Truck, Recycle, ArrowRight, Building2, Trophy } from "lucide-react"
import { Product, WishlistItem } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { roleFlags, CATEGORIES } from "@/lib/utils"
import { fadeInUp, fadeIn } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/shared/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"

const features = [
  { icon: ShieldCheck, title: "Verified Sellers", text: "Every company is admin-approved before listing." },
  { icon: Recycle, title: "Eco Scored", text: "Transparent sustainability ratings on all products." },
  { icon: Truck, title: "Carbon Tracked", text: "See the CO2 you save with every purchase." },
]

export default function Home() {
  const { user } = useAuth()
  const { isCustomer } = roleFlags(user)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => Product.filter({ status: "active" }, "-orders_count", 8),
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => WishlistItem.list(),
    enabled: isCustomer,
  })
  const wishlistIds = wishlist.map((w) => w.product_id)

  const { data: allProducts = [] } = useQuery({
    queryKey: ["all-products-for-companies"],
    queryFn: () => Product.filter({ status: "active" }, "-orders_count", 500),
  })

  const topCompanies = useMemo(() => {
    const map = {}
    for (const p of allProducts) {
      const key = p.company_name || p.company_id || "Unknown"
      if (!map[key]) map[key] = { name: key, sold: 0, carbon: 0, products: 0 }
      map[key].sold += p.orders_count || 0
      map[key].carbon += (p.carbon_saved_kg || 0) * (p.orders_count || 0)
      map[key].products += 1
    }
    return Object.values(map)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4)
  }, [allProducts])

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Leaf className="h-4 w-4" /> Sustainable Marketplace
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-6xl">
              Shop better for the planet
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover eco-friendly products from verified sustainable companies. Every purchase makes a measurable difference.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg">
                  Start Shopping <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={fadeInUp.initial}
                whileInView={fadeInUp.animate}
                viewport={viewportOnce}
                transition={fadeInUp.transition}
                className="rounded-xl border bg-card p-6"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-6 font-serif text-2xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Popular Products</h2>
          <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
            className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} wishlistIds={wishlistIds} />
            ))}
          </motion.div>
        )}
      </section>

      {topCompanies.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-2xl font-bold">Top Companies</h2>
          </div>
          <p className="-mt-4 mb-6 text-sm text-muted-foreground">
            Ranked by items sold and the CO₂ they helped customers save.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topCompanies.map((c, i) => (
              <div key={c.name} className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    #{i + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1 truncate font-semibold">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{c.name}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">{c.products} products</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{c.sold}</p>
                    <p className="text-xs text-muted-foreground">items sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{c.carbon.toFixed(1)}kg</p>
                    <p className="text-xs text-muted-foreground">CO₂ saved</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const viewportOnce = { once: true }
