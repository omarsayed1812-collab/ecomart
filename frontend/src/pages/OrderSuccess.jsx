import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle2, Leaf } from "lucide-react"
import { scaleIn } from "@/lib/motion"
import { Button } from "@/components/ui/button"

export default function OrderSuccess() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={scaleIn.initial}
        animate={scaleIn.animate}
        transition={scaleIn.transition}
        className="max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold">Order Placed!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for shopping sustainably. Your order is being processed and you can track it from your orders page.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          <Leaf className="h-4 w-4" /> You just made a positive impact!
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/orders"><Button>View Orders</Button></Link>
          <Link to="/products"><Button variant="outline">Keep Shopping</Button></Link>
        </div>
      </motion.div>
    </div>
  )
}
