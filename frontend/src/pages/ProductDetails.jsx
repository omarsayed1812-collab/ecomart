import { useEffect, useRef, useState, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Heart,
  Leaf,
  ArrowLeft,
  Loader2,
  PackageX,
  Star,
  Recycle,
  Sprout,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { Product, CartItem, WishlistItem, Review } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { roleFlags, formatPrice, cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import SustainabilityScore from "@/components/shared/SustainabilityScore"
import EcoBadge from "@/components/shared/EcoBadge"

function Stars({ value = 0, size = "h-4 w-4", onSelect }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={onSelect ? "button" : undefined}
          disabled={!onSelect}
          onClick={onSelect ? () => onSelect(i) : undefined}
          className={cn(onSelect && "cursor-pointer", !onSelect && "cursor-default")}
        >
          <Star
            className={cn(
              size,
              i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { isCustomer } = roleFlags(user)
  const viewCounted = useRef(false)

  const [impactOpen, setImpactOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => Product.get(id),
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => WishlistItem.list(),
    enabled: isCustomer,
  })
  const inWishlist = wishlist.some((w) => w.product_id === id)

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => Review.filter({ product_id: id }, "-created_date", 100),
    enabled: !!id,
  })

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    return reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
  }, [reviews])

  useEffect(() => {
    if (product && !viewCounted.current) {
      viewCounted.current = true
      Product.update(id, { views: (product.views || 0) + 1 }).catch(() => {})
    }
  }, [product, id])

  const addToCart = useMutation({
    mutationFn: () =>
      CartItem.create({
        product_id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        company_id: product.company_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["cart-count"] })
      toast.success("Added to cart")
    },
    onError: (e) => toast.error(e.message),
  })

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      const existing = await WishlistItem.filter({ product_id: product.id })
      if (existing.length > 0) {
        await WishlistItem.delete(existing[0].id)
        return "removed"
      }
      await WishlistItem.create({
        product_id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
      })
      return "added"
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] })
      toast.success(result === "added" ? "Added to wishlist" : "Removed from wishlist")
    },
    onError: (e) => toast.error(e.message),
  })

  const submitReview = useMutation({
    mutationFn: () => Review.create({ product_id: id, rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] })
      setComment("")
      setRating(5)
      toast.success("Thanks for your review!")
    },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <PackageX className="h-14 w-14 text-muted-foreground/40" />
        <h2 className="font-serif text-2xl font-bold">Product not found</h2>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    )
  }

  const outOfStock = product.stock !== undefined && product.stock <= 0
  const hasImpact =
    product.materials ||
    product.lifecycle ||
    product.impact_summary ||
    product.recycled_percentage > 0 ||
    product.carbon_saved_kg > 0 ||
    (product.eco_badges && product.eco_badges.length > 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
        className="grid gap-8 md:grid-cols-2"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-16 w-16 opacity-20" />
            </div>
          )}
          {product.eco_badges?.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {product.eco_badges.map((b) => <EcoBadge key={b} badge={b} />)}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">{product.company_name}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold">{product.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SustainabilityScore score={product.sustainability_score} size="md" />
            <span className="text-sm text-muted-foreground">{product.sustainability_score}/5 sustainability</span>
            {reviews.length > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Stars value={avgRating} /> {avgRating.toFixed(1)} ({reviews.length})
              </span>
            )}
          </div>

          <p className="mt-4 text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

          {product.carbon_saved_kg > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <Leaf className="h-4 w-4" /> Saves {product.carbon_saved_kg}kg CO₂ vs. conventional
            </div>
          )}

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="capitalize">{product.category}</Badge>
            {outOfStock ? (
              <span className="text-destructive">Out of stock</span>
            ) : (
              <span className="text-muted-foreground">{product.stock} in stock</span>
            )}
          </div>

          {hasImpact && (
            <Button variant="outline" className="mt-5" onClick={() => setImpactOpen(true)}>
              <Leaf className="h-4 w-4" /> Environmental Impact Report
            </Button>
          )}

          {isCustomer && (
            <div className="mt-8 flex gap-3">
              <Button size="lg" className="flex-1" disabled={outOfStock || addToCart.isPending} onClick={() => addToCart.mutate()}>
                {addToCart.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" disabled={toggleWishlist.isPending} onClick={() => toggleWishlist.mutate()}>
                <Heart className={cn("h-4 w-4", inWishlist && "fill-red-500 text-red-500")} />
              </Button>
            </div>
          )}
          {!isCustomer && (
            <p className="mt-8 text-sm text-muted-foreground">Sign in as a customer to purchase this product.</p>
          )}
        </div>
      </motion.div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold">
          <Star className="h-5 w-5 text-amber-400" /> Reviews
          {reviews.length > 0 && (
            <span className="text-base font-normal text-muted-foreground">
              — {avgRating.toFixed(1)} / 5 ({reviews.length})
            </span>
          )}
        </h2>

        {isCustomer && (
          <div className="mb-6 rounded-xl border bg-card p-5">
            <p className="mb-2 text-sm font-medium">Leave a review</p>
            <Stars value={rating} size="h-6 w-6" onSelect={setRating} />
            <Textarea
              className="mt-3"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => submitReview.mutate()} disabled={submitReview.isPending}>
                {submitReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Review
              </Button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.customer_name || "Customer"}</span>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Environmental Impact Report dialog */}
      <Dialog open={impactOpen} onOpenChange={setImpactOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" /> Environmental Impact Report
          </DialogTitle>
          <DialogDescription>{product.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Sustainability Score</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                {product.sustainability_score}/5 <SustainabilityScore score={product.sustainability_score} />
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">CO₂ Saved</p>
              <p className="mt-1 text-lg font-bold text-primary">{product.carbon_saved_kg || 0} kg</p>
            </div>
          </div>

          {product.recycled_percentage > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Recycle className="h-4 w-4 text-primary" />
              <span><strong>{product.recycled_percentage}%</strong> recycled content</span>
            </div>
          )}
          {product.materials && (
            <div className="flex items-start gap-2 text-sm">
              <Sprout className="mt-0.5 h-4 w-4 text-primary" />
              <span><strong>Materials:</strong> {product.materials}</span>
            </div>
          )}
          {product.lifecycle && (
            <div className="flex items-start gap-2 text-sm">
              <Leaf className="mt-0.5 h-4 w-4 text-primary" />
              <span><strong>Lifecycle:</strong> {product.lifecycle}</span>
            </div>
          )}
          {product.impact_summary && (
            <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">{product.impact_summary}</p>
          )}
          {product.eco_badges?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.eco_badges.map((b) => <EcoBadge key={b} badge={b} />)}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  )
}
