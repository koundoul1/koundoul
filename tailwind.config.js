/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette inspirée de l'interface éducative
        primary: {
          50: '#E8F4F8',   // Très clair teal
          100: '#D1E9F1',  // Clair teal
          200: '#A3D3E3',  // Teal clair
          300: '#75BDD5',  // Teal moyen-clair
          400: '#4DA6B3',  // Teal moyen (bouton secondaire)
          500: '#367C89',  // Teal foncé (bouton principal)
          600: '#2A5F6B',  // Teal plus foncé
          700: '#1E424D',  // Teal très foncé
          800: '#12252F',  // Teal sombre
          900: '#060811',  // Teal très sombre
        },
        secondary: {
          50: '#F8FAFB',   // Gris très clair
          100: '#F1F5F6',  // Gris clair
          200: '#E2E8F0',  // Gris moyen-clair
          300: '#CBD5E1',  // Gris moyen
          400: '#94A3B8',  // Gris
          500: '#7F8C8D',  // Gris moyen (texte secondaire)
          600: '#475569',  // Gris foncé
          700: '#34495E',  // Bleu-gris foncé (texte principal)
          800: '#1E293B',  // Très foncé
          900: '#0F172A',  // Presque noir
        },
        accent: {
          50: '#FEF3E2',   // Orange très clair
          100: '#FDE7C5',  // Orange clair
          200: '#FBCF8A',  // Orange moyen-clair
          300: '#F9B74F',  // Orange moyen
          400: '#F39C12',  // Orange (accent principal)
          500: '#E67E22',  // Orange foncé
          600: '#D35400',  // Orange très foncé
          700: '#BA4A00',  // Orange sombre
          800: '#A04000',  // Orange très sombre
          900: '#853600',  // Orange le plus sombre
        },
        // Couleurs de fond gradient
        gradient: {
          from: '#68A8AD',  // Teal-bleu du haut
          to: '#DDE5E8',    // Bleu-gris clair du bas
        }
      },
      backgroundImage: {
        'gradient-educational': 'linear-gradient(180deg, #68A8AD 0%, #DDE5E8 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}