import { Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { CartItem } from "@/api/client"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Cart() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => CartItem.list("-created_date"),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] })
    queryClient.invalidateQueries({ queryKey: ["cart-count"] })
  }

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }) => CartItem.update(id, { quantity }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  })

  const removeItem = useMutation({
    mutationFn: (id) => CartItem.delete(id),
    onSuccess: () => {
      invalidate()
      toast.success("Removed from cart")
    },
    onError: (e) => toast.error(e.message),
  })

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99
  const total = subtotal + shipping

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingCart className="h-14 w-14 text-muted-foreground/40" />
        <h2 className="font-serif text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some sustainable products to get started.</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.image_url && <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{item.title}</h3>
                <p className="text-sm text-primary font-medium">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                  className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-secondary"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}
                  className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-secondary"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="w-20 text-right font-semibold">{formatPrice(item.price * item.quantity)}</div>
              <button
                onClick={() => removeItem.mutate(item.id)}
                className="rounded-md p-2 text-destructive hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>

        <Card className="h-fit p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {subtotal < 50 && subtotal > 0 && (
              <p className="text-xs text-muted-foreground">Add {formatPrice(50 - subtotal)} more for free shipping.</p>
            )}
            <div className="my-2 h-px bg-border" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/checkout")}>
            Checkout <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  )
}
