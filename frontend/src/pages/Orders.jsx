import { useQuery } from "@tanstack/react-query"
import { Package, Leaf } from "lucide-react"
import { format } from "date-fns"
import { Order } from "@/api/client"
import { formatPrice, statusColor } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => Order.list("-created_date"),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="h-14 w-14 text-muted-foreground/40" />
        <h2 className="font-serif text-2xl font-bold">No orders yet</h2>
        <p className="text-muted-foreground">Your placed orders will appear here.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-sm font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  {order.created_date ? format(new Date(order.created_date), "PP") : ""}
                </p>
              </div>
              <Badge className={statusColor(order.status)}>{order.status}</Badge>
            </div>
            <div className="space-y-2 py-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.title} \u00D7 {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              {order.carbon_saved_total > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <Leaf className="h-3 w-3" /> {order.carbon_saved_total}kg CO\u2082 saved
                </span>
              ) : <span />}
              <span className="font-bold">Total: {formatPrice(order.total)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
