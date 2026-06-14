import { Link } from "react-router-dom"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PageNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <Leaf className="h-12 w-12 text-primary" />
      <h1 className="font-serif text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page wandered off into the wild.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
