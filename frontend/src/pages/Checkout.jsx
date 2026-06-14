import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { CartItem, Order } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "", country: "" })

  const { data: items = [] } = useQuery({ queryKey: ["cart"], queryFn: () => CartItem.list() })

  const set = (key) => (e) => setAddress((a) => ({ ...a, [key]: e.target.value }))

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99
  const total = subtotal + shipping

  const placeOrder = useMutation({
    mutationFn: () =>
      Order.create({
        customer_email: user.email,
        customer_name: user.full_name,
        items: items.map((i) => ({
          product_id: i.product_id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          company_id: i.company_id,
        })),
        total,
        shipping_address: address,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["cart-count"] })
      navigate("/order-success")
    },
    onError: (e) => toast.error(e.message),
  })

  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Your cart is empty. <button className="text-primary underline" onClick={() => navigate("/products")}>Shop now</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">Checkout</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); placeOrder.mutate() }}
        className="grid gap-8 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input value={address.street} onChange={set("street")} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={address.city} onChange={set("city")} required /></div>
                <div><Label>State / Province</Label><Input value={address.state} onChange={set("state")} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>ZIP / Postal Code</Label><Input value={address.zip} onChange={set("zip")} required /></div>
                <div><Label>Country</Label><Input value={address.country} onChange={set("country")} required /></div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="truncate text-muted-foreground">{i.title} \u00D7 {i.quantity}</span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-3 h-px bg-border" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span className="text-primary">{formatPrice(total)}</span></div>
          </div>
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={placeOrder.isPending}>
            {placeOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Place Order
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Demo checkout \u2014 no real payment.</p>
        </Card>
      </form>
    </div>
  )
}
