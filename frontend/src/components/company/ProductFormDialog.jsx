import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { ProductRequest, integrations } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { CATEGORIES, ECO_BADGES } from "@/lib/utils"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const empty = {
  title: "",
  description: "",
  price: "",
  category: "home",
  image_url: "",
  stock: 0,
  sustainability_score: 3,
  eco_badges: [],
  carbon_saved_kg: 0,
  materials: "",
  recycled_percentage: 0,
  lifecycle: "",
  impact_summary: "",
}

export default function ProductFormDialog({ open, onOpenChange, product }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(empty)
  const [uploading, setUploading] = useState(false)
  const isEdit = Boolean(product)

  useEffect(() => {
    if (product) {
      setForm({ ...empty, ...product })
    } else {
      setForm(empty)
    }
  }, [product, open])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { file_url } = await integrations.Core.UploadFile({ file })
      set("image_url", file_url)
      toast.success("Image uploaded")
    } catch (err) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const toggleBadge = (badge) => {
    setForm((f) => ({
      ...f,
      eco_badges: f.eco_badges.includes(badge)
        ? f.eco_badges.filter((b) => b !== badge)
        : [...f.eco_badges, badge],
    }))
  }

  const submit = useMutation({
    mutationFn: () => {
      const product_data = {
        ...form,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
        carbon_saved_kg: parseFloat(form.carbon_saved_kg) || 0,
        recycled_percentage: parseFloat(form.recycled_percentage) || 0,
        sustainability_score: parseInt(form.sustainability_score) || 3,
        company_id: user.id,
        company_name: user.full_name,
      }
      return ProductRequest.create({
        company_id: user.id,
        company_name: user.full_name,
        request_type: isEdit ? "edit" : "add",
        product_id: isEdit ? product.id : undefined,
        product_data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-requests"] })
      toast.success(isEdit ? "Edit request submitted for review" : "Product submitted for review")
      onOpenChange(false)
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>
          Submissions are reviewed by an admin before going live.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit.mutate()
        }}
        className="space-y-4"
      >
        <div>
          <Label>Product Title</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Price ($)</Label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v)}
              options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` }))}
            />
          </div>
          <div>
            <Label>Carbon Saved (kg CO2)</Label>
            <Input type="number" step="0.1" value={form.carbon_saved_kg} onChange={(e) => set("carbon_saved_kg", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Sustainability Score: {form.sustainability_score}/5</Label>
          <input
            type="range"
            min="1"
            max="5"
            value={form.sustainability_score}
            onChange={(e) => set("sustainability_score", e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div>
          <Label>Eco Badges</Label>
          <div className="flex flex-wrap gap-3">
            {ECO_BADGES.map((badge) => (
              <label key={badge} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.eco_badges.includes(badge)} onCheckedChange={() => toggleBadge(badge)} />
                {badge}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-dashed p-3">
          <p className="text-sm font-medium">Environmental Impact Report</p>
          <p className="text-xs text-muted-foreground">Shown to customers when they tap “Impact Report” on the product page.</p>
          <div>
            <Label>Materials</Label>
            <Input value={form.materials} onChange={(e) => set("materials", e.target.value)} placeholder="e.g. 100% organic cotton" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Recycled Content (%)</Label>
              <Input type="number" min="0" max="100" value={form.recycled_percentage} onChange={(e) => set("recycled_percentage", e.target.value)} />
            </div>
            <div>
              <Label>Lifecycle</Label>
              <Input value={form.lifecycle} onChange={(e) => set("lifecycle", e.target.value)} placeholder="e.g. Recyclable / Compostable" />
            </div>
          </div>
          <div>
            <Label>Impact Summary</Label>
            <Textarea value={form.impact_summary} onChange={(e) => set("impact_summary", e.target.value)} rows={2} placeholder="Describe the environmental impact of this product..." />
          </div>
        </div>

        <div>
          <Label>Product Image</Label>
          <div className="flex items-center gap-3">
            {form.image_url && (
              <img src={form.image_url} alt="" className="h-16 w-16 rounded-md object-cover" />
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submit.isPending}>
            {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit for Review
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
