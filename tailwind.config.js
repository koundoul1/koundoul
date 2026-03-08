/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Koundoul Premium Palette
        kprimary: {
          50: '#EAE8FF',
          100: '#D5D1FF',
          200: '#ABA3FF',
          300: '#8177FF',
          400: '#6C63FF',
          500: '#5A52E0',
          600: '#4840C0',
          700: '#362FA0',
          800: '#241F80',
          900: '#120F60',
          DEFAULT: '#6C63FF',
        },
        ksecondary: {
          50: '#E0FAF5',
          100: '#B3F2E5',
          200: '#80E8D3',
          300: '#4DDEC1',
          400: '#3ECFCF',
          500: '#33B3B3',
          600: '#289797',
          700: '#1D7B7B',
          800: '#125F5F',
          900: '#074343',
          DEFAULT: '#3ECFCF',
        },
        kaccent: {
          50: '#FFF0E8',
          100: '#FFD6C0',
          200: '#FFBC98',
          300: '#FFA270',
          400: '#FF6B35',
          500: '#E05A2A',
          600: '#C04A20',
          700: '#A03A16',
          800: '#802A0C',
          900: '#601A02',
          DEFAULT: '#FF6B35',
        },
        // Legacy palette (keep for backward compat)
        primary: {
          50: '#E8F4F8',
          100: '#D1E9F1',
          200: '#A3D3E3',
          300: '#75BDD5',
          400: '#4DA6B3',
          500: '#367C89',
          600: '#2A5F6B',
          700: '#1E424D',
          800: '#12252F',
          900: '#060811',
        },
        secondary: {
          50: '#F8FAFB',
          100: '#F1F5F6',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#7F8C8D',
          600: '#475569',
          700: '#34495E',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          50: '#FEF3E2',
          100: '#FDE7C5',
          200: '#FBCF8A',
          300: '#F9B74F',
          400: '#F39C12',
          500: '#E67E22',
          600: '#D35400',
          700: '#BA4A00',
          800: '#A04000',
          900: '#853600',
        },
        gradient: {
          from: '#68A8AD',
          to: '#DDE5E8',
        }
      },
      backgroundImage: {
        'gradient-educational': 'linear-gradient(180deg, #68A8AD 0%, #DDE5E8 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-kprimary': 'linear-gradient(135deg, #6C63FF 0%, #3ECFCF 100%)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
