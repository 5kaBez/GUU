/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b",
                foreground: "#fafafa",
                primary: {
                    DEFAULT: "#3b82f6",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#27272a",
                    foreground: "#fafafa",
                },
                muted: {
                    DEFAULT: "#27272a",
                    foreground: "#a1a1aa",
                },
                accent: {
                    DEFAULT: "#27272a",
                    foreground: "#fafafa",
                },
                card: {
                    DEFAULT: "rgba(24, 24, 27, 0.4)",
                    foreground: "#fafafa",
                },
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
            },
            backdropBlur: {
                xs: "2px",
            }
        },
    },
    plugins: [],
}
