import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration: _duration = 1, className = '' }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const spring = useSpring(0, { stiffness: 75, damping: 25 })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(Math.round(v)))
    return () => unsub()
  }, [spring])

  return <motion.span className={className}>{display}</motion.span>
}
