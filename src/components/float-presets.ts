type FloatPreset = {
  x: [number, number, number, number, number]
  y: [number, number, number, number, number]
  rotate: [number, number, number, number, number]
  duration: number
  delay?: number
}

export const floatPresets = {
  soft: {
    x: [0, 14, -12, 9, 0],
    y: [0, -14, 13, -9, 0],
    rotate: [0, 0.5, -0.6, 0.35, 0],
    duration: 9,
    delay: -0.8,
  },
  driftA: {
    x: [0, 30, -24, 18, 0],
    y: [0, -24, 28, -18, 0],
    rotate: [0, 1.4, -1.8, 0.9, 0],
    duration: 8,
    delay: -2,
  },
  driftB: {
    x: [0, -28, 24, -16, 0],
    y: [0, -22, 30, -20, 0],
    rotate: [0, -1.2, 1.6, -0.8, 0],
    duration: 10,
    delay: -7,
  },
  driftC: {
    x: [0, 24, -30, 18, 0],
    y: [0, -20, 24, -16, 0],
    rotate: [0, 1.1, -1.4, 0.7, 0],
    duration: 9,
    delay: -4,
  },
  driftD: {
    x: [0, -32, 26, -18, 0],
    y: [0, -26, 30, -18, 0],
    rotate: [0, -1.5, 1.9, -1, 0],
    duration: 11,
    delay: -6,
  },
  driftE: {
    x: [0, 26, -22, 16, 0],
    y: [0, -18, 26, -20, 0],
    rotate: [0, 1, -1.5, 0.8, 0],
    duration: 8.5,
    delay: -9,
  },
  driftF: {
    x: [0, -24, 30, -18, 0],
    y: [0, -22, 24, -16, 0],
    rotate: [0, -1.1, 1.6, -0.8, 0],
    duration: 9.5,
    delay: -3,
  },
  driftG: {
    x: [0, 28, -24, 18, 0],
    y: [0, -28, 24, -18, 0],
    rotate: [0, 1.3, -1.7, 0.9, 0],
    duration: 10.5,
    delay: -11,
  },
  mobileA: {
    x: [0, 18, -14, 10, 0],
    y: [0, -14, 16, -10, 0],
    rotate: [0, 0.8, -1, 0.5, 0],
    duration: 8,
    delay: 0,
  },
  mobileB: {
    x: [0, -18, 14, -10, 0],
    y: [0, -16, 18, -12, 0],
    rotate: [0, -0.8, 1, -0.5, 0],
    duration: 9,
    delay: -1.2,
  },
  mobileC: {
    x: [0, 16, -18, 12, 0],
    y: [0, -18, 16, -12, 0],
    rotate: [0, 0.9, -1.1, 0.55, 0],
    duration: 9.5,
    delay: -2.4,
  },
  mobileD: {
    x: [0, -16, 18, -12, 0],
    y: [0, -14, 16, -10, 0],
    rotate: [0, -0.75, 1, -0.5, 0],
    duration: 10,
    delay: -3.6,
  },
} as const satisfies Record<string, FloatPreset>

export type FloatPresetName = keyof typeof floatPresets
