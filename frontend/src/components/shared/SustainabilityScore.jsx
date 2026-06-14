import { Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export default function SustainabilityScore({ score = 0, size = "sm" }) {
  return (
    <div className="flex items-center gap-0.5" title={`Sustainability score: ${score}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Leaf
          key={i}
          className={cn(
            sizeMap[size],
            i <= score ? "text-primary fill-primary" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}
