import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter Tight'", "system-ui", "sans-serif"],
        serif: ["'Newsreader'", "Georgia", "serif"],
      },
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          bg: '#f5f5f5',
        },
        brand: {
          DEFAULT: '#14130f',
          blue: '#35a7f6',
          green: '#23a56b',
          red: '#d96b61',
          purple: '#8e8df7',
        },
        muted: {
          DEFAULT: '#7a7368',
          2: '#958f82',
          3: '#a39c8f',
          label: '#8d867b',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(20,19,15,0.08)',
      },
      boxShadow: {
        card: '0 1px 0 rgba(20,19,15,0.05), 0 1px 3px rgba(0,0,0,0.025)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
export default config;
