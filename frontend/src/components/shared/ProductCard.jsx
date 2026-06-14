import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Heart, ShoppingCart } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CartItem, WishlistItem } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { roleFlags, formatPrice, cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import SustainabilityScore from "./SustainabilityScore"
import EcoBadge from "./EcoBadge"

const hoverProps = { y: -4 }
const hoverTransition = { type: "spring", stiffness: 300 }

export default function ProductCard({ product, wishlistIds = [] }) {
  const { user } = useAuth()
  const { isCustomer } = roleFlags(user)
  const queryClient = useQueryClient()
  const inWishlist = wishlistIds.includes(product.id)

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

  const handleAction = (e, fn) => {
    e.preventDefault()
    e.stopPropagation()
    fn()
  }

  return (
    <motion.div whileHover={hoverProps} transition={hoverTransition}>
      <Link to={`/products/${product.id}`} className="group block">
        <Card className="overflow-hidden h-full">
          <div className="relative aspect-square bg-secondary overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-12 w-12 opacity-20" />
              </div>
            )}
            {product.eco_badges?.[0] && (
              <div className="absolute left-2 top-2">
                <EcoBadge badge={product.eco_badges[0]} />
              </div>
            )}
            {isCustomer && (
              <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => handleAction(e, () => toggleWishlist.mutate())}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      inWishlist ? "fill-red-500 text-red-500" : "text-foreground"
                    )}
                  />
                </button>
                <button
                  onClick={(e) => handleAction(e, () => addToCart.mutate())}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground truncate">
                {product.company_name}
              </span>
              <SustainabilityScore score={product.sustainability_score} />
            </div>
            <h3 className="mt-1 font-semibold truncate">{product.title}</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
              {product.carbon_saved_kg > 0 && (
                <span className="text-xs text-muted-foreground">
                  {product.carbon_saved_kg}kg CO\u2082 saved
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
