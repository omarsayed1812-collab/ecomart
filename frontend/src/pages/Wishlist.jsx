import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Heart } from "lucide-react"
import { Product, WishlistItem } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from "@/components/shared/ProductCard"

export default function Wishlist() {
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => WishlistItem.list(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ["wishlist-products", wishlist.map((w) => w.product_id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        wishlist.map((w) => Product.get(w.product_id).catch(() => null))
      )
      return results.filter(Boolean)
    },
    enabled: wishlist.length > 0,
  })

  const wishlistIds = wishlist.map((w) => w.product_id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Heart className="h-14 w-14 text-muted-foreground/40" />
        <h2 className="font-serif text-2xl font-bold">Your wishlist is empty</h2>
        <p className="text-muted-foreground">Save products you love for later.</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">My Wishlist</h1>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} wishlistIds={wishlistIds} />
        ))}
      </div>
    </div>
  )
}
