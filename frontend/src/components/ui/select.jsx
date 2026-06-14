import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

// Lightweight native-select wrapper.
// Usage: <Select value={v} onValueChange={setV} options={[{value,label}]} />
export function Select({ className, value, onValueChange, options = [], icon: Icon, ...props }) {
  return (
    <div className={cn("relative", className)}>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      )}
      <select
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        className={cn(
          "flex h-9 w-full appearance-none rounded-md border border-input bg-transparent pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          Icon ? "pl-9" : "pl-3"
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
