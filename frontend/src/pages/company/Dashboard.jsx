import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Package, Clock, DollarSign, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Product, ProductRequest } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { formatPrice, statusColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import ProductFormDialog from "@/components/company/ProductFormDialog"

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </Card>
  )
}

export default function CompanyDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState("products")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["company-products", user?.id],
    queryFn: () => Product.filter({ company_id: user.id }, "-created_date", 200),
    enabled: !!user?.id,
  })

  const { data: requests = [] } = useQuery({
    queryKey: ["product-requests", user?.id],
    queryFn: () => ProductRequest.filter({ company_id: user.id }, "-created_date", 200),
    enabled: !!user?.id,
  })

  const deleteRequest = useMutation({
    mutationFn: (product) =>
      ProductRequest.create({
        company_id: user.id,
        company_name: user.full_name,
        request_type: "delete",
        product_id: product.id,
        product_data: { title: product.title },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-requests"] })
      toast.success("Delete request submitted for review")
    },
    onError: (e) => toast.error(e.message),
  })

  const openAdd = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (product) => { setEditing(product); setDialogOpen(true) }

  const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0)
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0)
  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">{user?.full_name}</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Products" value={products.length} />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(totalRevenue)} />
        <StatCard icon={Eye} label="Total Views" value={totalViews} />
        <StatCard icon={Clock} label="Pending Requests" value={pendingCount} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="products">My Products</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : products.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              No products yet. Add your first product to get started.
            </Card>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <Card key={p.id} className="flex items-center gap-4 p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatPrice(p.price)} \u00B7 {p.stock} in stock \u00B7 {p.views || 0} views</p>
                  </div>
                  <Badge className={statusColor(p.status)}>{p.status}</Badge>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-md p-2 hover:bg-secondary"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteRequest.mutate(p)} className="rounded-md p-2 text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requests.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">No requests submitted yet.</Card>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <Card key={r.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{r.request_type} \u2014 {r.product_data?.title || "Product"}</p>
                    {r.admin_note && <p className="text-sm text-muted-foreground">Note: {r.admin_note}</p>}
                  </div>
                  <Badge className={statusColor(r.status)}>{r.status}</Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} />
    </div>
  )
}
