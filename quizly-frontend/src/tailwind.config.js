/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'mono-black': '#000000',
                'mono-white': '#ffffff',
                'mono-gray': {
                    900: '#0a0a0a',
                    800: '#121212',
                    700: '#1e1e1e',
                    600: '#2a2a2a',
                    500: '#52525b',
                    400: '#a1a1aa',
                    300: '#d4d4d8',
                    200: '#e4e4e7',
                    100: '#f4f4f5',
                },
            },
            fontFamily: {
                'sans': ['Outfit', 'sans-serif'],
                'display': ['Space Grotesk', 'sans-serif'],
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'], // Added for code elements
            },
            animation: {
                'grid': 'grid-drift 20s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Added for subtle effects
            },
            keyframes: {
                'grid-drift': {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '40px 40px' },
                },
            },
            // Add container for better responsive control
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                    lg: '4rem',
                    xl: '5rem',
                },
            },
        },
    },
    plugins: [],
}