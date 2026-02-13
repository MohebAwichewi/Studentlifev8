/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
        extend: {
            colors: {
                primary: '#E63946', // Student.LIFE Red
                secondary: '#1A1A1A', // Black/Grey
            }
        },
    },
    plugins: [],
}
