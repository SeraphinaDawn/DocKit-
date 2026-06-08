/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 10px 26px rgba(71, 85, 105, 0.08)',
        float: '0 18px 60px rgba(71, 85, 105, 0.12)',
        glow: '0 20px 56px rgba(37, 99, 235, 0.12)',
      },
      backgroundImage: {
        'page-grid':
          'linear-gradient(rgba(255,255,255,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px), radial-gradient(circle at 50% 24%, rgba(96,165,250,0.18), transparent 34%), linear-gradient(180deg, #e7f0fb 0%, #f8fbff 48%, #fffaf4 100%)',
        checker:
          'linear-gradient(45deg, #e7eef7 25%, transparent 25%), linear-gradient(-45deg, #e7eef7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e7eef7 75%), linear-gradient(-45deg, transparent 75%, #e7eef7 75%)',
      },
    },
  },
  plugins: [],
}
