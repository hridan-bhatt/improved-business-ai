import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { HeroPrimaryButton, HeroSecondaryButton } from './HeroCTAButtons'
import Hero3D from '../Hero3D'

const WORD_VARIANTS = {
  hidden: { opacity: 0, y: 40, skewY: 3 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: {
      duration: 0.75,
      delay: 0.1 + i * 0.07,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const LINE_WORDS = ['AI', 'That', 'Thinks', 'Like', 'Your']

export default function HeroSection() {
  const { token, isValid } = useAuth()
  const { theme } = useTheme()
  const isLoggedIn = !!token && isValid
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 0.5], [0, 55])
  const y3d = useTransform(scrollYProgress, [0, 0.5], [0, -40])
  const opacity3d = useTransform(scrollYProgress, [0.15, 0.5], [1, 0.2])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden lg:flex-row lg:items-center"
      style={{ background: 'rgb(var(--ds-bg-base))' }}
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'var(--ds-hero-glow)' }} />
        <div className="absolute inset-0" style={{ background: 'var(--ds-hero-ambient)' }} />
        <div className="absolute inset-0" style={{ background: 'var(--ds-hero-vignette)' }} />
        {/* Radial light from upper-right — adds depth */}
        <div
          className="absolute -top-32 right-0 h-[70vh] w-[55vw] opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse 60% 55% at 80% 0%, rgb(var(--ds-accent) / 0.14) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Noise texture */}
        <div className="noise-overlay" />
      </div>

      {/* Thin horizontal top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgb(var(--ds-accent) / 0.5) 50%, transparent 100%)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Left: text content */}
      <motion.div
        style={{ y: yText }}
        className="relative z-10 flex flex-1 flex-col justify-center px-6 py-20 lg:w-[55%] lg:max-w-none lg:px-14 xl:px-20"
      >
        {/* Label pill */}
        <motion.div
          className="relative mb-7 inline-flex items-center"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{
              borderColor: 'rgb(var(--ds-accent) / 0.3)',
              background: 'rgb(var(--ds-accent) / 0.07)',
              color: 'rgb(var(--ds-accent))',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            Business Intelligence Platform
          </span>
        </motion.div>

        {/* Headline — cinematic word-by-word reveal */}
        <div className="relative overflow-hidden" aria-label="AI That Thinks Like Your CFO.">
          <h1 className="font-display text-[2.7rem] font-bold leading-[1.08] tracking-tight text-ds-text-primary sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
            <div className="flex flex-wrap items-baseline gap-x-[0.3em] gap-y-1 overflow-hidden">
              {LINE_WORDS.map((word, i) => (
                <div key={word} className="overflow-hidden">
                  <motion.span
                    className="inline-block"
                    variants={WORD_VARIANTS}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
              <div className="overflow-hidden">
                <motion.span
                  className="inline-block"
                  variants={WORD_VARIANTS}
                  custom={5}
                  initial="hidden"
                  animate="visible"
                  style={{
                    background: 'linear-gradient(135deg, rgb(var(--ds-accent)) 0%, rgb(var(--ds-accent-teal)) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  CFO.
                </motion.span>
              </div>
            </div>
          </h1>
        </div>

        {/* Sub-headline — animated words with underlines */}
        <motion.div
          className="relative mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          {['Predict.', 'Detect.', 'Optimize.'].map((word, i) => (
            <motion.span
              key={word}
              className="relative inline-block text-2xl font-semibold tracking-tight text-ds-text-primary sm:text-3xl lg:text-[1.75rem]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
              <motion.span
                  className="absolute bottom-0 left-0 h-0.5 w-full"
                  style={{ background: 'linear-gradient(90deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))', transformOrigin: 'left' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.75 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                />
            </motion.span>
          ))}
        </motion.div>

        {/* Body copy */}
        <motion.p
          className="relative mt-7 max-w-lg text-lg leading-relaxed text-ds-text-secondary"
          variants={FADE_UP}
          custom={4}
          initial="hidden"
          animate="visible"
        >
          Expenses, fraud detection, inventory forecasting, and sustainability analytics — unified in one AI engine.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="relative mt-10 flex flex-wrap items-center gap-4"
          variants={FADE_UP}
          custom={5}
          initial="hidden"
          animate="visible"
        >
          <HeroPrimaryButton to={isLoggedIn ? '/dashboard' : '/login'}>
            Enter Dashboard
          </HeroPrimaryButton>
          <HeroSecondaryButton href="#features">
            See How It Works
          </HeroSecondaryButton>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="relative mt-10 flex flex-wrap items-center gap-3"
          variants={FADE_UP}
          custom={6}
          initial="hidden"
          animate="visible"
        >
          <span className="text-xs font-medium text-ds-text-muted">Trusted by</span>
          {['Analytics', 'Finance', 'Operations'].map((label) => (
            <span
              key={label}
              className="rounded-full border px-3 py-1 text-xs font-medium text-ds-text-secondary transition-colors"
              style={{
                borderColor: 'rgb(var(--ds-border) / 0.35)',
                background: 'rgb(var(--ds-bg-surface) / 0.6)',
              }}
            >
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Right: 3D */}
      <motion.div
        style={{ y: y3d, opacity: opacity3d }}
        className="relative z-10 flex h-[50vh] flex-1 lg:h-[92vh] lg:w-[45%]"
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        >
          <Hero3D theme={theme} />
        </motion.div>
      </motion.div>
    </section>
  )
}
