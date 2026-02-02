import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors (from mobile app)
        primary: {
          DEFAULT: '#2930A6',
          light: '#3B42B8',
          dark: '#1E2485',
        },
        secondary: {
          DEFAULT: '#FFCF0D',
          light: '#FFD93D',
          dark: '#E6BA00',
        },
        // Text colors
        text: {
          primary: '#000000',
          secondary: '#595959',
          muted: '#6D5B5B',
          dark: '#333333',
          nearBlack: '#1A1A1A',
          white: '#FFFFFF',
        },
        // Background colors
        background: {
          white: '#FFFFFF',
          offWhite: '#F5F5F5',
          light: '#F8F9FA',
          card: '#E1E1E1',
          chat: '#ECE5DD',
          gray: '#D9D9D9',
        },
        // Status colors
        status: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#007AFF',
          online: '#2930A6',
          offline: '#6D5B5B',
        },
        // Message bubble colors
        message: {
          user: '#0084FF',
          astrologer: '#FEF3C7',
          readTick: '#34B7F1',
        },
        // Transaction colors
        transaction: {
          credit: '#22C55E',
          debit: '#EF4444',
          refund: '#F59E0B',
        },
        // Gray scale (from mobile)
        gray: {
          light: '#666666',
          medium: '#595959',
          dark: '#371B34',
        },
      },
      fontFamily: {
        lexend: ['var(--font-lexend)', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      fontSize: {
        'xs': ['10px', { lineHeight: '14px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'md': ['16px', { lineHeight: '22px' }],
        'lg': ['18px', { lineHeight: '26px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['26px', { lineHeight: '34px' }],
        '4xl': ['30px', { lineHeight: '38px' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '30px',
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'modal': '0 4px 24px rgba(0, 0, 0, 0.2)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 20px rgba(41, 48, 166, 0.3)',
        'glow-secondary': '0 0 20px rgba(255, 207, 13, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(41, 48, 166, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(41, 48, 166, 0.5)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #2930A6 0%, #3B42B8 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FFCF0D 0%, #FFD93D 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
