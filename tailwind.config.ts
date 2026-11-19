import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kid: {
          yellow: '#FFDE59',
          orange: '#FF914D',
          blue: '#38BDF8',
          purple: '#CB6CE6',
          green: '#4ADE80',
          pink: '#FF66C4',
        },
      },
      fontFamily: {
        sans: ['var(--font-bubble)', 'Nunito', 'Baloo 2', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
