/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./public/**/*.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./demo/**/*.{vue,js,ts,jsx,tsx}",
        "./node_modules/@jx3box/jx3box-ui/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    // 本项目已引入 normalize.css/组件库样式；关闭 preflight 避免 Tailwind 重置影响现有样式
    corePlugins: {
        preflight: false,
    },
};
