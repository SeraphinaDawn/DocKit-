import { motion, useReducedMotion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { cx } from './ui-helpers'
import { floatPresets, type FloatPresetName } from './float-presets'

type FloatWrapperProps = Omit<HTMLMotionProps<'div'>, 'animate' | 'transition'> & {
  children: ReactNode
  preset?: FloatPresetName
  respectReducedMotion?: boolean
}

export function FloatWrapper({
  children,
  className,
  preset = 'soft',
  respectReducedMotion = false,
  ...props
}: FloatWrapperProps) {
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = respectReducedMotion && prefersReducedMotion
  const motionPreset = floatPresets[preset]

  return (
    <motion.div
      className={cx('transform-gpu will-change-transform', className)}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              x: motionPreset.x,
              y: motionPreset.y,
              rotate: motionPreset.rotate,
            }
      }
      transition={
        shouldReduceMotion
          ? undefined
          : {
              duration: motionPreset.duration,
              delay: motionPreset.delay,
              ease: 'easeInOut',
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'loop',
              times: [0, 0.22, 0.5, 0.76, 1],
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}
