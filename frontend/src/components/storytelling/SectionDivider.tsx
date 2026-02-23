import { motion } from 'framer-motion'

/** Subtle transition between sections: thin animated glowing separator */
export default function SectionDivider() {
  return (
    <div className="relative flex flex-col items-center justify-center py-6 md:py-8" aria-hidden>
      {/* Main line */}
      <motion.div
        className="h-px w-full max-w-lg"
        style={{
          background: 'linear-gradient(90deg, transparent, rgb(var(--ds-accent) / 0.22), rgb(var(--ds-accent-teal) / 0.18), transparent)',
        }}
        initial={{ opacity: 0.3, scaleX: 0.6 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Center glow dot */}
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-ds-accent"
        style={{
          boxShadow: '0 0 10px 2px rgb(var(--ds-accent) / 0.5)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
