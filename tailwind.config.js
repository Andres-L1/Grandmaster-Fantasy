/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                success: 'rgb(var(--color-success) / <alpha-value>)',
                error: 'rgb(var(--color-error) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            }
        }
    },
    plugins: []
};
