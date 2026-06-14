import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function Checkbox({ checked, onCheckedChange, className, id }) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-primary shadow flex items-center justify-center transition-colors",
        checked ? "bg-primary text-primary-foreground" : "bg-transparent",
        className
      )}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  )
}
