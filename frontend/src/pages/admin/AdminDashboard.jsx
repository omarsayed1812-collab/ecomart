import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2, Package, Check, X, ExternalLink, Users, Clock, Loader2, FileCheck } from "lucide-react"
import { toast } from "sonner"
import { CompanyApplication, ProductRequest, Product, User } from "@/api/client"
import { formatPrice, statusColor } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState("companies")

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => CompanyApplication.list("-created_date"),
  })
  const { data: requests = [], isLoading: loadingReqs } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => ProductRequest.list("-created_date"),
  })
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => Product.list("-created_date", 500),
  })
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => User.list(),
  })

  const reviewApp = useMutation({
    mutationFn: ({ id, status }) => CompanyApplication.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] })
      toast.success("Application updated")
    },
    onError: (e) => toast.error(e.message),
  })

  const reviewRequest = useMutation({
    mutationFn: ({ id, status }) => ProductRequest.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] })
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast.success("Request updated")
    },
    onError: (e) => toast.error(e.message),
  })

  const pendingApps = applications.filter((a) => a.status === "pending")
  const pendingReqs = requests.filter((r) => r.status === "pending")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">Admin Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Pending Applications" value={pendingApps.length} />
        <StatCard icon={Package} label="Pending Requests" value={pendingReqs.length} />
        <StatCard icon={Building2} label="Live Products" value={products.length} />
        <StatCard icon={Users} label="Total Users" value={users.length} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="companies">Company Applications ({pendingApps.length})</TabsTrigger>
          <TabsTrigger value="requests">Product Requests ({pendingReqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          {loadingApps ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
          ) : applications.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">No company applications.</Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{app.company_name}</h3>
                        <Badge className={statusColor(app.status)}>{app.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{app.company_description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">By {app.user_name} \u00B7 {app.user_email}</p>
                      {app.website && (
                        <a href={app.website} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                          {app.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {app.certificate_url && (
                        <a href={app.certificate_url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs text-primary">
                          <FileCheck className="h-3 w-3" /> View sustainability certificate
                        </a>
                      )}
                    </div>
                    {app.status === "pending" && (
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" onClick={() => reviewApp.mutate({ id: app.id, status: "approved" })} disabled={reviewApp.isPending}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reviewApp.mutate({ id: app.id, status: "rejected" })} disabled={reviewApp.isPending}>
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {loadingReqs ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
          ) : requests.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">No product requests.</Card>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      {req.product_data?.image_url && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <img src={req.product_data.image_url} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{req.request_type}</Badge>
                          <h3 className="font-semibold truncate">{req.product_data?.title || "Product"}</h3>
                          <Badge className={statusColor(req.status)}>{req.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">By {req.company_name}</p>
                        {req.product_data?.price != null && req.request_type !== "delete" && (
                          <p className="mt-1 text-sm">{formatPrice(req.product_data.price)} \u00B7 {req.product_data.category}</p>
                        )}
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" onClick={() => reviewRequest.mutate({ id: req.id, status: "approved" })} disabled={reviewRequest.isPending}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reviewRequest.mutate({ id: req.id, status: "rejected" })} disabled={reviewRequest.isPending}>
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
