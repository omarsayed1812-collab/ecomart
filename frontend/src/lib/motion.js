// Reusable framer-motion presets (kept as plain objects so JSX can
// reference them with single braces, e.g. initial={fadeInUp.initial}).
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 },
}

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4 },
}

// Build a transition object with a stagger delay.
export const delayTransition = (i, base = 0.4) => ({ duration: base, delay: i * 0.05 })

// Common inline style helpers (avoid double-brace JSX).
export const bgColor = (color) => ({ backgroundColor: color })
