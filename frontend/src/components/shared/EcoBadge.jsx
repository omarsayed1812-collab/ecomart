import { Sprout, Recycle, Scale, Wind, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

const badgeConfig = {
  Organic: { icon: Sprout, className: "bg-green-100 text-green-800 border-green-200" },
  Recycled: { icon: Recycle, className: "bg-blue-100 text-blue-800 border-blue-200" },
  "Fair Trade": { icon: Scale, className: "bg-amber-100 text-amber-800 border-amber-200" },
  "Carbon Neutral": { icon: Wind, className: "bg-teal-100 text-teal-800 border-teal-200" },
  Biodegradable: { icon: Leaf, className: "bg-lime-100 text-lime-800 border-lime-200" },
}

export default function EcoBadge({ badge }) {
  const config = badgeConfig[badge] || {
    icon: Leaf,
    className: "bg-secondary text-secondary-foreground border-border",
  }
  const Icon = config.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {badge}
    </span>
  )
}
