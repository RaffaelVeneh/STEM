/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Playful disaster-preparedness palette
        safety: {
          orange: '#FF6B35',
          yellow: '#FFC107',
          red: '#E63946',
          green: '#2EC4B6',
        },
        earth: {
          brown: '#8B4513',
          sand: '#F4A261',
          clay: '#E76F51',
        },
        ocean: {
          deep: '#1D3557',
          wave: '#457B9D',
          foam: '#A8DADC',
        },
        siaga: {
          // Siaga the Owl palette
          feather: '#6C584C',
          beak: '#FFB703',
          eye: '#FFD60A',
          belly: '#FEFAE0',
        }
      },
      fontFamily: {
        display: ['Fredoka', 'Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'blob': '30% 70% 70% 30% / 30% 30% 70% 70%',
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 183, 3, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 183, 3, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
