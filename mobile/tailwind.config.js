/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
<<<<<<< HEAD
        extend: {},
=======
        extend: {
            colors: {
                primary: '#E63946', // Student.LIFE Red
                secondary: '#1A1A1A', // Black/Grey
            }
        },
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    },
    plugins: [],
}
