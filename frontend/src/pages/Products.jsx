import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react"
import { Product, WishlistItem } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { roleFlags, CATEGORIES } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from "@/components/shared/ProductCard"

const sortOptions = [
  { value: "-created_date", label: "Newest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-sustainability_score", label: "Most Sustainable" },
  { value: "-orders_count", label: "Most Popular" },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { isCustomer } = roleFlags(user)

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const category = searchParams.get("category") || "all"
  const [sort, setSort] = useState("-created_date")

  useEffect(() => {
    setSearch(searchParams.get("search") || "")
  }, [searchParams])

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category, sort],
    queryFn: () => {
      const query = { status: "active" }
      if (category !== "all") query.category = category
      return Product.filter(query, sort, 100)
    },
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => WishlistItem.list(),
    enabled: isCustomer,
  })
  const wishlistIds = wishlist.map((w) => w.product_id)

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  )

  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === "all") next.delete("category")
    else next.set("category", value)
    setSearchParams(next)
  }

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` })),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">Shop Products</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory} options={categoryOptions} icon={SlidersHorizontal} className="sm:w-52" />
        <Select value={sort} onValueChange={setSort} options={sortOptions} className="sm:w-52" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No products found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} wishlistIds={wishlistIds} />
          ))}
        </div>
      )}
    </div>
  )
}
