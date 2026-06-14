import { Leaf } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-serif text-lg font-bold">EcoMart</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            A sustainable marketplace connecting conscious shoppers with eco-friendly products from verified companies.
          </p>
          <p className="text-xs text-muted-foreground">
            \u00A9 {new Date().getFullYear()} EcoMart. Shop responsibly.
          </p>
        </div>
      </div>
    </footer>
  )
}
