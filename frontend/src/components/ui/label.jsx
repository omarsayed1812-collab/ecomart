import { cn } from "@/lib/utils"

export function Label({ className, ...props }) {
  return (
    <label
      className={cn("text-sm font-medium leading-none mb-1.5 block", className)}
      {...props}
    />
  )
}
