import { useQuery } from "@tanstack/react-query"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts"
import { DollarSign, Eye, ShoppingCart, TrendingUp } from "lucide-react"
import { Product } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { formatPrice, CHART_COLORS, CATEGORIES } from "@/lib/utils"
import { bgColor } from "@/lib/motion"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const chartMargin = { top: 8, right: 8, left: -16, bottom: 0 }
const pieOuterRadius = 90

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  )
}

export default function CompanyAnalytics() {
  const { user } = useAuth()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["company-products", user?.id],
    queryFn: () => Product.filter({ company_id: user.id }, "-revenue", 200),
    enabled: !!user?.id,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-6 h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    )
  }

  const totalRevenue = products.reduce((s, p) => s + (p.revenue || 0), 0)
  const totalViews = products.reduce((s, p) => s + (p.views || 0), 0)
  const totalOrders = products.reduce((s, p) => s + (p.orders_count || 0), 0)
  const conversion = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : "0"

  const topProducts = products.slice(0, 6).map((p) => ({
    name: p.title.length > 14 ? p.title.slice(0, 14) + "\u2026" : p.title,
    revenue: p.revenue || 0,
    views: p.views || 0,
  }))

  const categoryData = CATEGORIES.map((c) => ({
    name: c.label,
    value: products.filter((p) => p.category === c.value).length,
  })).filter((d) => d.value > 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">Analytics</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(totalRevenue)} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders} />
        <StatCard icon={Eye} label="Total Views" value={totalViews} />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={`${conversion}%`} />
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No data yet. Add products to see analytics.</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Revenue by Product</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Bar dataKey="revenue" fill={CHART_COLORS[0]} radius={barRadius} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Products by Category</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={pieOuterRadius} label>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="mb-4 font-semibold">Views by Product</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip />
                <Bar dataKey="views" fill={CHART_COLORS[2]} radius={barRadius} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  )
}

const axisTick = { fontSize: 12 }
const barRadius = [6, 6, 0, 0]
