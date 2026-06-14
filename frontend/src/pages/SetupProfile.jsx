import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingBag, Store, Loader2, Leaf, Upload, FileCheck } from "lucide-react"
import { toast } from "sonner"
import { auth, CompanyApplication, integrations } from "@/api/client"
import { useAuth } from "@/lib/AuthContext"
import { fadeInUp } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function SetupProfile() {
  const navigate = useNavigate()
  const { user, checkUserAuth } = useAuth()
  const [choice, setChoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState({ company_name: "", company_description: "", website: "" })
  const [certUrl, setCertUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleCert = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { file_url } = await integrations.Core.UploadFile({ file })
      setCertUrl(file_url)
      toast.success("Certificate uploaded")
    } catch (err) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const finishCustomer = async () => {
    setLoading(true)
    try {
      await auth.updateMe({ account_type: "customer" })
      await checkUserAuth()
      toast.success("Welcome to EcoMart!")
      navigate("/")
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const finishCompany = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await CompanyApplication.create({
        user_email: user.email,
        user_name: user.full_name,
        company_name: company.company_name,
        company_description: company.company_description,
        website: company.website,
        certificate_url: certUrl,
      })
      await auth.updateMe({ account_type: "pending_company" })
      await checkUserAuth()
      toast.success("Application submitted for review!")
      navigate("/")
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12">
      <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold">Welcome, {user?.full_name?.split(" ")[0]}!</h1>
          <p className="mt-2 text-muted-foreground">How would you like to use EcoMart?</p>
        </div>

        {!choice && (
          <div className="grid gap-4 sm:grid-cols-2">
            <button onClick={() => setChoice("customer")}>
              <Card className="flex h-full flex-col items-center gap-3 p-8 text-center transition-colors hover:border-primary hover:bg-primary/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl font-bold">Shop as Customer</h3>
                <p className="text-sm text-muted-foreground">Browse and buy sustainable products from verified companies.</p>
              </Card>
            </button>
            <button onClick={() => setChoice("company")}>
              <Card className="flex h-full flex-col items-center gap-3 p-8 text-center transition-colors hover:border-primary hover:bg-primary/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                  <Store className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl font-bold">Sell as Company</h3>
                <p className="text-sm text-muted-foreground">Apply to list your eco-friendly products. Requires admin approval.</p>
              </Card>
            </button>
          </div>
        )}

        {choice === "customer" && (
          <Card className="p-8 text-center">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-primary" />
            <h3 className="font-serif text-xl font-bold">Shop sustainably</h3>
            <p className="mt-2 text-sm text-muted-foreground">You're all set to start exploring eco-friendly products.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setChoice(null)} disabled={loading}>Back</Button>
              <Button onClick={finishCustomer} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Continue
              </Button>
            </div>
          </Card>
        )}

        {choice === "company" && (
          <Card className="p-8">
            <form onSubmit={finishCompany} className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input value={company.company_name} onChange={(e) => setCompany((c) => ({ ...c, company_name: e.target.value }))} required />
              </div>
              <div>
                <Label>Company Description</Label>
                <Textarea value={company.company_description} onChange={(e) => setCompany((c) => ({ ...c, company_description: e.target.value }))} rows={3} required />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input type="url" value={company.website} onChange={(e) => setCompany((c) => ({ ...c, website: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label>Sustainability Certificate (optional)</Label>
                <div className="flex items-center gap-3">
                  {certUrl && (
                    <a href={certUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary underline">
                      <FileCheck className="h-4 w-4" /> View file
                    </a>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload Certificate"}
                    <input type="file" accept="image/*,application/pdf" onChange={handleCert} className="hidden" />
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Image or PDF. The admin reviews this before approving your company.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setChoice(null)} disabled={loading}>Back</Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit Application
                </Button>
              </div>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
